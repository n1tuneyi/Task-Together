const Task = require("../Model/taskModel.js");
const responseController = require("../Controller/responseController");
const AppError = require("../Utils/appError.js");
const User = require("../Model/userModel");
const Project = require("../Model/projectModel.js");
const ObjectId = require("mongoose").Types.ObjectId;

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    await User.findByIdAndUpdate(
      {
        _id: new ObjectId(req.body.assignedMember),
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

exports.setProject = (req, res, next) => {
  req.body.project = req.params.projectID;
  next();
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Task.findByIdAndUpdate(
      {
        _id: req.params.taskID,
      },
      { assignedMember: req.body.assignedMember }
    );

    await User.findByIdAndUpdate(
      { _id: req.body.assignedMember },
      {
        $addToSet: { tasks: req.params.taskID },
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

exports.deleteTask = async (req, res, next) => {
  try {
    const data = await Task.findByIdAndDelete(req.params.taskID);

    if (!data) return next(new AppError("No task found with that ID", 404));

    responseController.sendResponse(res, "success", 204);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};
