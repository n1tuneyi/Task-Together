const Topic = require("../Model/topicModel");
const crudController = require("./crudController");
const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const User = require('../Model/userModel')

exports.setGroup = (req, res, next) => {
  req.body.group = req.params.groupID;
  next();
};

exports.createTopic = crudController.createOne(Topic);
exports.getAllTopics = async (req, res, next) => {
  try {
    const data = await Topic.find().select("-__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getAllTopicsForGroup = async (req, res, next) => {
  try {
    const data = await Topic.find({ group: req.body.group }).select(
      "-__v -group"
    );
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Topic.findByIdAndUpdate(
      {
        _id: req.params.topicID,
      },
      { $addToSet: { members: req.body.members } },
      {
        new: true,
      }
    );
    
    await User.updateMany(
      { _id : { $in : req.body.members} },
      {
        $addToSet: {topic: req.params.topicID}
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
    const data = await User.find({ topics: { $nin : [req.params.topicID]} }).select("-groups -password -topics -tasks -__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};