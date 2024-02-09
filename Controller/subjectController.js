const Subject = require("../Model/subjectModel");
const crudController = require("./crudController");
const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const User = require('../Model/userModel')

exports.setGroup = (req, res, next) => {
  req.body.group = req.params.groupID;
  next();
};

exports.createSubject = crudController.createOne(Subject);
exports.getAllSubjects = async (req, res, next) => {
  try {
    const data = await Subject.find().select("-__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getAllSubjectsForGroup = async (req, res, next) => {
  try {
    const data = await Subject.find({ group: req.body.group }).select(
      "-__v -group"
    );
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Subject.findByIdAndUpdate(
      {
        _id: req.params.subjectID,
      },
      { $addToSet: { members: req.body.members } },
      {
        new: true,
      }
    );
    
    await User.updateMany(
      { _id : { $in : req.body.members} },
      {
        $addToSet: {subjects: req.params.subjectID}
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
    const data = await User.find({ subjects: { $nin : [req.params.subjectID]} }).select("-groups -password -subjects -tasks -__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
