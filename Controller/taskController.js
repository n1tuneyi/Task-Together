const Task = require("../Model/task");
const responseController = require("../Controller/responseController");
exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    responseController.sendResponse(res, 201, [...task]);
  } catch (err) {
    responseController.sendError(res, 404, err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    responseController.sendResponse(res, 204, null);
  } catch (err) {
    console.log(err);
  }
};

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

    responseController.sendResponse(res, 200, data);
  } catch (err) {
    responseController.sendError(res, 404, err);
  }
};

exports.tickTask = async (req, res, next) => {
  try {
    const updateQuery = await Task.updateMany(
      { _id: { $in: req.body } },
      {
        $addToSet: {
          completedBy: req.user.name,
        },
      }
    );

    const updatedTasks = await Task.find({ _id: { $in: req.body } }).select(
      "-__v -date"
    );

    responseController.sendResponse(res, 200, updatedTasks);
  } catch (err) {
    responseController.sendError(res, 404, err);
  }
};
