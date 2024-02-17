const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  nearestDeadline: Date,
  category: { type: mongoose.Schema.ObjectId, ref: "Category" },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

projectSchema.post(/^(find|save)/, async (docs, next) => {
  await Project.populate(docs, {
    path: "members",
    select: "-__v -password -groups -tasks -projects",
  });
  
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
