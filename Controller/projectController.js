const Project = require("../Model/projectModel");

const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const User = require("../Model/userModel");
const Task = require("../Model/taskModel");
const ObjectId = require("mongoose").Types.ObjectId;

exports.setGroup = (req, res, next) => {
  req.body.group = req.params.groupID;
  next();
};

exports.createProject = async (req, res, next) => {
  try {
    req.body.members = [req.user._id];

    const project = await Project.create(req.body);

    await User.updateMany(
      { _id: { $in: req.body.members } },
      {
        $addToSet: { projects: project._id },
      },
      {
        new: true,
      }
    );
    responseController.sendResponse(res, "success", 201, project);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

// Not working for some reason
exports.getAllProjectsForGroup = async (req, res, next) => {
  try {
    const userGroups = req.user.groups.map(group => String(group._id));

    if (!userGroups.includes(req.params.groupID))
      throw new Error("You are not part of this group");

    const data = await Project.find({
      group: req.params.groupID,
      members: { $in: req.user._id },
    }).select("-__v -group");

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getMembersStatistics = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectID);

    if (!project) return next(new AppError("Project not found", 404));

    const statistics = project.members.map(async member => {
      const completedTasksWeights =
        (
          await Task.aggregate([
            {
              $match: {
                assignedMember: member._id,
                project: req.params.projectID,
                completedDate: { $ne: null },
              },
            },
            {
              $group: {
                _id: null,
                totalWeight: { $sum: "$weight" },
              },
            },
          ])
        )[0]?.totalWeight || 0;

      const totalTasksWeights =
        (
          await Task.aggregate([
            {
              $match: {
                assignedMember: member._id,
                project: req.params.projectID,
              },
            },
            {
              $group: {
                _id: null,
                totalWeight: { $sum: "$weight" },
              },
            },
          ])
        )[0]?.totalWeight || 0;

      const completedTasks = await Task.countDocuments({
        assignedMember: member._id,
        project: req.params.projectID,
        completedDate: { $ne: null },
      });

      const remainingTasks = await Task.countDocuments({
        assignedMember: member._id,
        project: req.params.projectID,
        completedDate: null,
      });

      const tasks = await Task.find({
        assignedMember: member._id,
        project: req.params.projectID,
      });

      return {
        member,
        tasks,
        completedTasks,
        remainingTasks,
        assignedTasks: completedTasks + remainingTasks,
        progress: (completedTasksWeights / totalTasksWeights) * 100 || 0,
      };
    });

    const data = await Promise.all(statistics);

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getProjectStatistics = async (req, res, next) => {
  const project = await Project.findById(req.params.projectID);

  if (!project) return next(new AppError("Project Not Found", 404));

  const totalTasks = await Task.countDocuments({
    project: req.params.projectID,
  });

  const completedTasks = await Task.countDocuments({
    project: req.params.projectID,
    completedDate: { $ne: null },
  });

  const totalTasksWeight =
    (
      await Task.aggregate([
        {
          $match: {
            project: new ObjectId(req.params.projectID),
          },
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: "$weight" },
          },
        },
      ])
    )[0]?.totalWeight || 0;

  const totalCompletedTasksWeights =
    (
      await Task.aggregate([
        {
          $match: {
            project: new ObjectId(req.params.projectID),
            completedDate: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: "$weight" },
          },
        },
      ])
    )[0]?.totalWeight || 0;

  const projectProgress =
    (totalCompletedTasksWeights / totalTasksWeight) * 100 || 0;

  let totalCompletedTasksWeightInterval = await Task.aggregate([
    {
      $match: {
        project: new ObjectId(req.params.projectID),
        completedDate: { $ne: null },
      },
    },
    {
      $addFields: {
        dueDate: "$completedDate",
      },
    },
    {
      $group: {
        _id: {
          $toDate: {
            $dateFromParts: {
              year: { $year: "$dueDate" },
              month: { $month: "$dueDate" },
              day: { $dayOfMonth: "$dueDate" },
            },
          },
        },
        totalWeight: { $sum: "$weight" },
      },
    },
    {
      $sort: { totalWeight: -1 },
    },
    {
      $project: {
        date: "$_id",
        totalWeight: 1,
        _id: 0,
      },
    },
  ]);

  const maxDayWeight = totalCompletedTasksWeightInterval[0]?.totalWeight || 0;

  totalCompletedTasksWeightInterval.sort((a, b) => a.date - b.date);

  const data = {
    totalTasks,
    completedTasks,
    maxDayWeight,
    projectProgress,
    totalTasksWeight,
    totalCompletedTasksWeightInterval,
    startDate: project.startDate,
    deadline: project.deadline,
  };

  responseController.sendResponse(res, "success", 200, data);
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(
      {
        _id: req.params.projectID,
      },
      { $addToSet: { members: req.body } },
      {
        new: true,
      }
    );

    await User.updateMany(
      { _id: { $in: req.body } },
      {
        $addToSet: { projects: req.params.projectID },
      },
      {
        new: true,
      }
    );

    responseController.sendResponse(res, "success", 200, req.body);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    const data = await User.find({
      projects: { $nin: [req.params.projectID] },
    }).select("-groups -password -projects -tasks -__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const data = (
      await Project.findById(req.params.projectID).select("members -_id")
    ).members;
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    const data = await Project.find();
    return data;
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectID,
      {
        $pull: { members: { $in: [req.query.userId] } },
      },
      {
        new: true,
      }
    );

    if (!updatedProject)
      return next(new AppError("No project found with that ID", 404));

    if (updatedProject.members.length == 0) {
      await Project.findByIdAndDelete(req.params.projectID);
    }

    await User.findByIdAndUpdate(req.query.userId, {
      $pull: { projects: req.params.projectID },
    });

    responseController.sendResponse(res, "success", 204);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
