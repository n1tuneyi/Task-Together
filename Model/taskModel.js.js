const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
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
