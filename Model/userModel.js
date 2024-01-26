const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: [true, "A User must have a name"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "A User must have a password"],
  },
  groups: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
    },
  ],
});

userSchema.pre("save", async function (next) {
  this.password = await promisify(bcrypt.hash)(this.password, 10);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  // THIS keyword here refers to the document that called this function
  return await bcrypt.compare(candidatePassword, this.password);
};

// We need the password for logging in you can't hide it
// userSchema.pre(/^find/, function (next) {
//   this.select("-password -__v");
//   next();
// });

userSchema.post(/^find/, async function (docs, next) {
  await User.populate(docs, {
    path: "groups",
    select: "-__v -password",
  });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
