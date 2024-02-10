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
    console.log(req.params.topicID);
    await Topic.findByIdAndUpdate(
      {
        _id: req.params.topicID,
      },
      { $addToSet: { members: req.body } },
      {
        new: true,
      }
    );
    
    await User.updateMany(
      { _id : { $in : req.body} },
      {
        $addToSet: {topics: req.params.topicID}
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
    console.log(data);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
