const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A task must have a name"],
  },
  completedBy: {
    type: [mongoose.Schema.ObjectId],
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

// taskSchema.post("aggregate", function (next) {
//   console.log(this);
//   next();
// });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
