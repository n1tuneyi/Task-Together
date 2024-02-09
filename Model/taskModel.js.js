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
  topic: {
    type: mongoose.Schema.ObjectId,
    ref: "Topic",
  },
  members : [
    {
      type: mongoose.Schema.ObjectId,
      ref : "User",
    }
  ]
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
