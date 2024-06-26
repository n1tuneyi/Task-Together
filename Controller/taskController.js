const Task = require("../Model/taskModel.js");
const responseController = require("../Controller/responseController");
const crudController = require("../Controller/crudController");
const AppError = require("../Utils/appError.js");
const User = require("../Model/userModel");
const Project = require("../Model/projectModel.js");

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    await User.findByIdAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $addToSet: { tasks: task._id },
      }
    );
    responseController.sendResponse(res, "success", 201, task);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.deleteTask = crudController.deleteOne(Task);

exports.tickTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskID);

    if (!task) return next(new AppError("Task not found", 404));

    if (String(req.user._id) != String(task.assignedMember))
      return next(new AppError("Forbidden Resource", 403));

    const conditionalUpdate = {
      ...(task.completedDate
        ? { completedDate: null }
        : { completedDate: Date.now() }),
    };

    // const conditionalQuery = {
    //   ...(completed
    //     ? { $pull: { completedBy: req.user._id } }
    //     : { $addToSet: { completedBy: req.user._id } }),
    //   // Update title and other related data of task
    //   // $set: req.body,
    // };

    const updatedTask = await Task.findByIdAndUpdate(
      {
        _id: req.params.taskID,
      },
      conditionalUpdate,
      {
        new: true,
      }
    );

    responseController.sendResponse(res, "success", 200, updatedTask);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

const queryTasks = async (req, completed) => {
  const query = completed ? { $all: [req.user._id] } : { $nin: [req.user._id] };
  return await Task.find({
    project: req.body.project,
    completedBy: query,
  }).populate({ path: "completedBy", select: "-groups -password -__v" });
};

exports.getAllTasks = async (req, res, next) => {
  try {
    let completed = await queryTasks(req, true);
    let notCompleted = await queryTasks(req, false);

    const tasks = [
      ...completed.map(task => ({ ...task._doc, isCompleted: true })),
      ...notCompleted.map(task => ({ ...task._doc, isCompleted: false })),
    ];

    responseController.sendResponse(res, "success", 200, tasks);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.setProject = (req, res, next) => {
  req.body.project = req.params.projectID;
  req.body.assignedMember = req.user._id;
  next();
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Task.findByIdAndUpdate(
      {
        _id: req.params.taskID,
      },
      { assignedMember: req.body.member },
      {
        new: true,
      }
    );

    await User.findByIdAndUpdate(
      { _id: req.body.member },
      {
        $addToSet: { tasks: req.params.taskID },
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
    const project = (await Task.findById(req.params.taskID)).project;

    const data = (
      await Project.findOne({ _id: project._id }).select("members").populate({
        path: "members",
        select: "-groups -tasks -projects -password -__v",
      })
    ).members;

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const data = await Task.find({
      assignedMember: req.query.userID || req.user._id,
      project: req.params.projectID,
    });
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getTasksForUser = async (req, res, next) => {
  try {
    const data = await Task.find({
      assignedMember: req.user._id,
      project: req.params.projectID,
    });
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
