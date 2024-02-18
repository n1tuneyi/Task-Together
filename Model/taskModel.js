const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedMember: {
    type: mongoose.Schema.ObjectId,
    ref : "User"
  },
  deadline: Date,
  completedDate: {
    type: Date,
    default: null
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
  },
  weight: {
    type: Number,
    default: 1
  }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
