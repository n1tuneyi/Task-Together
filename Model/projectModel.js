const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  startDate: Date,
  deadline: Date,
  group: {
    type: mongoose.Schema.ObjectId,
    ref: "Group",
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

projectSchema.index({ title: 1, group: 1 }, { unique: true });

projectSchema.post(/^(find|save)/, async (docs, next) => {
  await Project.populate(docs, {
    path: "members",
    select: "-__v -password -groups -tasks -projects",
  });

  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
