const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedMember: {
    type: mongoose.Schema.ObjectId,
    ref : "User"
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
  },
  deadline: Date,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
