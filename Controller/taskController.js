const Task = require("../Model/task");

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    console.log(12314);
    res.status(201).json({
      status: "success",
      data: [...task],
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
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
          numTasks: { $sum: 1 },
          tasks: {
            // Push here without _id field
            $push: {
              name: "$name",
              date: "$date",
              id: "$_id",
            },
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
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.tickTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    task.completedBy.push(req.user.id);

    res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
