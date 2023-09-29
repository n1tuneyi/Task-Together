const Task = require("../Model/task");

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
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
    const task = await Task.find();
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
