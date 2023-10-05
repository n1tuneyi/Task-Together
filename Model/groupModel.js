const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A group must have a name"],
  },
  password: {
    type: String,
  },
  topics: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Topic",
    },
  ],
  users: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

const Topic = mongoose.model("Group", groupSchema);

module.exports = Topic;
