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
  passwordConfirm: {
    type: String,
    required: [true, "Re-enter your password to confirm"],
    validate: {
      validator: function (v) {
        return v === this.password;
      },
      message: "Passwords do not match",
    },
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
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  // THIS keyword here refers to the document that called this function
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
