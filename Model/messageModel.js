const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: String,
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: "Group",
  },
  timestamp: Date,
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
