const Task = require("../Model/taskModel.js");
const responseController = require("../Controller/responseController");
const crudController = require("../Controller/crudController");
const AppError = require("../Utils/appError.js");

exports.createTask = crudController.createOne(Task);
exports.deleteTask = crudController.deleteOne(Task);

exports.getTask = async (req, res, next) => {
  try {
    const data = await Task.aggregate([
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          name: 1,
          completedBy: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          tasks: {
            // Push here without date field
            $push: {
              name: "$name",
              completedBy: "$completedBy",
              id: "$_id",
            },
            // Pushes entire array
            // $push: "$$ROOT",
          },
        },
      },
      {
        $project: {
          date: "$_id",
          _id: 0,
          tasks: "$tasks",
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $addFields: {
          date: { $toDate: "$date" },
        },
      },
    ]);

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.tickTask = async (req, res, next) => {
  try {
    await Task.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $addToSet: {
          completedBy: req.user._id,
        },
        $set: req.body,
      }
    );
    responseController.sendResponse(res, "success", 200, "report jungler");
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const data = await Task.find({ topic: req.body.topic }).select(
      "-__v -topic"
    );
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.setTopicId = (req, res, next) => {
  req.body.topic = req.params.id;
  next();
};
