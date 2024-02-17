const mongoose = require("mongoose");

// Here we need to make the name unique
const announcementSchema = new mongoose.Schema({
  title: String,
  description: String,
  belongsTo: mongoose.Schema.ObjectId,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

announcementSchema.post(/^(find|save)/, async (docs, next) => {
  await Announcement.populate(docs, {
    path: "createdBy",
    select: "-__v -password -groups",
  });
  
  next();
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
