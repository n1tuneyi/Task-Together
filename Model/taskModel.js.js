const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A task must have a title"],
  },
  description: String,
  completedBy: {
    type: [String],
    unique: true,
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  endDate: Date,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
