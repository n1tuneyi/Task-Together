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

messageSchema.post(/^find/, async (docs, next) => {
  await Message.populate(docs, {
    path: "sender",
    select: "-__v -password -groups -tasks -projects -groupInvites",
  });
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
