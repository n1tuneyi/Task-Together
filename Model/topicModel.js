const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A topic must have a title"],
  },
  description: {
    type: String,
  },
  nearestDeadline: Date,
  tasks: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
    },
  ],
  group: { type: mongoose.Schema.ObjectId, ref: "Group" },
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
