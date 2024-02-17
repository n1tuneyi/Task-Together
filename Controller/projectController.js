const Project = require("../Model/projectModel");
const crudController = require("./crudController");
const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const User = require('../Model/userModel')

exports.setGroup = (req, res, next) => {
  req.body.group = req.params.groupID;
  next();
};

exports.createProject = crudController.createOne(Project);
exports.getAllProjects = async (req, res, next) => {
  try {
    const data = await Project.find().select("-__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getAllProjectsForGroup = async (req, res, next) => {
  try {
    const data = await Project.find({ group: req.body.group }).select(
      "-__v -group"
    );
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.assignMembers = async (req, res, next) => {
  try {
    console.log(req.params.projectID);
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
      { _id : { $in : req.body} },
      {
        $addToSet: {projects: req.params.projectID}
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
    const data = await User.find({ projects: { $nin : [req.params.projectID]} }).select("-groups -password -projects -tasks -__v");
    console.log(data);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getMembers = async (req, res , next) => { 
  try {
    const data = (await Project
    .findById(req.params.projectID)
    .select("members -_id")).members
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
}