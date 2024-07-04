const mongoose = require("mongoose");

const groupInviteSchema = new mongoose.Schema({
  description: String,
  group: { type: mongoose.Schema.ObjectId, ref: "Group" },
  invitedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  invitedUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

groupInviteSchema.post(/^find/, async (docs, next) => {
  await GroupInvite.populate(docs, {
    path: "invitedBy",
    select: "-__v -projects -groups -tasks -password -groupInvites",
  });
  next();
});

const GroupInvite = mongoose.model("GroupInvite", groupInviteSchema);

module.exports = GroupInvite;
