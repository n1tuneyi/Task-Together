const mongoose = require("mongoose");

// Here we need to make the name unique
const announcementSchema = new mongoose.Schema({
  name: String,
  description: String,
  place: mongoose.Schema.ObjectId,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

announcementSchema.post(/^find/, async (docs, next) => {
  await Announcement.populate(docs, {
    path: "createdBy",
    select: "-__v -password -groups",
  });

  next();
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
