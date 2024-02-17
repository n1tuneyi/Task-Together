const Task = require("../Model/taskModel.js");
const responseController = require("../Controller/responseController");
const crudController = require("../Controller/crudController");
const AppError = require("../Utils/appError.js");
const User = require('../Model/userModel');
const Project = require("../Model/projectModel.js");

exports.createTask = crudController.createOne(Task);
exports.deleteTask = crudController.deleteOne(Task);

exports.tickTask = async (req, res, next) => {
  try {
    const completed = await Task.findOne({
      _id: req.params.taskID,
      completedBy: { $all: [req.user._id] },
    });

    const conditionalQuery = {
      ...(completed
        ? { $pull: { completedBy: req.user._id } }
        : { $addToSet: { completedBy: req.user._id } }),
      // Update title and other related data of task
      // $set: req.body,
    };

    const updatedTask = await Task.findByIdAndUpdate(
      {
        _id: req.params.taskID,
      },
      conditionalQuery,
      {
        new: true,
      }
    ).populate({
      path: "completedBy",
      select: "-password -__v -groups",
    });
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
  next();
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Task.findByIdAndUpdate(
      {
        _id: req.params.taskID,
      },
      { assignedMember: req.body.member } ,
      {
        new: true,
      }
    );

    await User.findByIdAndUpdate(
      { _id :  req.body.member },
      {
        $addToSet: {tasks: req.params.taskID}
      },
      {
        new : true
      }
    );

    responseController.sendResponse(res, "success", 200, req.body);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    
    const project = (await Task
    .findById(req.params.taskID)).project
    
    const data = (await Project.findOne({ _id:  project._id})
    .select('members')
    .populate({
        path: "members",
        select: "-groups -tasks -projects -password -__v",
      })).members
        
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};