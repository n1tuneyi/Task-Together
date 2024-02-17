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
  },
  endDate: Date,
  project: {
    type: mongoose.Schema.ObjectId,
    ref: "Project",
  },
  assignedMember: {
      type: mongoose.Schema.ObjectId,
      ref : "User",
  }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
