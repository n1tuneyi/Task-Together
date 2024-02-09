const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
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

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
