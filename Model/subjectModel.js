const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  nearestDeadline: Date,
  group: { type: mongoose.Schema.ObjectId, ref: "Group" },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
