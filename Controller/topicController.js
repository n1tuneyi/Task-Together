const Topic = require("../Model/topicModel");
const crudController = require("../Controller/crudController");
const AppError = require("../Utils/appError");
const responseController = require("../Controller/responseController");

exports.setGroup = (req, res, next) => {
  req.body.group = req.params.id;
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
    console.log(data);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
