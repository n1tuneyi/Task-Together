const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
  },
  description: String,
  completedBy: {
    type: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    unique: true,
  },
  startDate: {
    type: Date,
    default: Date.now(),
  },
  endDate: Date,
  topic: {
    type: mongoose.Schema.ObjectId,
    ref: "Topic",
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
