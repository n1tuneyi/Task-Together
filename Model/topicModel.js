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

topicSchema.post(/^(find|save)/, async (docs, next) => {
  await Topic.populate(docs, {
    path: "members",
    select: "-__v -password -groups -tasks -topics",
  });
  
  next();
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
