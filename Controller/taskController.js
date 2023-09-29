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
    const task = await Task.aggregate([
      {
        $project: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          CompletedBy: 1,
          name: 1,
        },
      },
      {
        $group: {
          _id: "$date",
          numTasks: { $sum: 1 },
          tasks: { $push: "$name" },
        },
      },
      {
        $sort: { Date: 1 },
      },
      // $ne stands for not equal
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);
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
