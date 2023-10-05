const mongoose = require("mongoose");
const { promisify } = require("util");
const bcrypt = require("bcrypt");

// Here we need to make the name unique
const groupSchema = new mongoose.Schema({
  name: String,
  password: String,
  description: String,
});

groupSchema.pre("save", async function (next) {
  this.password = await promisify(bcrypt.hash)(this.password, 10);
  next();
});
groupSchema.methods.correctPassword = async function (candidatePassword) {
  // THIS keyword here refers to the document that called this function
  return await bcrypt.compare(candidatePassword, this.password);
};

const Topic = mongoose.model("Group", groupSchema);

module.exports = Topic;
