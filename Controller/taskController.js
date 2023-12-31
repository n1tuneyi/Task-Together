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

exports.getAllTasks = async (req, res, next) => {
  try {
    const completed = await Task.find({
      subject: req.body.subject,
      completedBy: { $all: [req.user._id] },
    }).populate({ path: "completedBy", select: "-groups -password -__v" });

    const notCompleted = await Task.find({
      subject: req.body.subject,
      completedBy: { $nin: [req.user._id] },
    }).populate({ path: "completedBy", select: "-groups -password -__v" });

    console.log(completed, notCompleted);
    responseController.sendResponse(res, "success", 200, [
      completed,
      notCompleted,
    ]);
    console.log(req.body.subject);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.setSubject = (req, res, next) => {
  req.body.subject = req.params.subjectID;
  next();
};
