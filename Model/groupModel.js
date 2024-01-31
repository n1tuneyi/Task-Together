const mongoose = require("mongoose");
const { promisify } = require("util");
const bcrypt = require("bcrypt");
const User = require("./userModel");

// Here we need to make the name unique
const groupSchema = new mongoose.Schema({
  name: String,
  password: String,
  description: String,
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  photo: {
    type: String,
    default: "",
  },
});

groupSchema.pre("save", async function (next) {
  this.password = await promisify(bcrypt.hash)(this.password, 10);
  await User.findByIdAndUpdate(
    { _id: this.createdBy },
    { $addToSet: { groups: this._id } }
  );
  next();
});

groupSchema.methods.correctPassword = async function (candidatePassword) {
  // THIS keyword here refers to the document that called this function
  return await bcrypt.compare(candidatePassword, this.password);
};

groupSchema.pre(/^find/, function (next) {
  this.select("-password -__v");
  next();
});

groupSchema.post(/^find/, async function (docs, next) {
  await User.populate(docs, {
    path: "members",
    select: "-__v -groups -password",
  });
  next();
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
