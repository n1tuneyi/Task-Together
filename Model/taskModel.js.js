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
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: "Subject",
  },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
