const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const responseController = require("../Controller/responseController");

const signToken = id => {
  // We only want to sign the ID of the user cause that's the payload that's gonna differ from a user to a user
  return jwt.sign({ id }, "secretadsfjk;324hfadsx", {
    expiresIn: "90d", // This env variable is equal to 90d
  });
};
exports.protect = async (req, res, next) => {
  // 1) Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    responseController.sendResponse(
      res,
      "fail",
      404,
      "Not authorized, no token"
    );

  const decoded = await promisify(jwt.verify)(token, "secretadsfjk;324hfadsx");

  const curUser = await User.findById(decoded.id);

  if (!curUser)
    responseController.sendResponse(res, "fail", 403, "user was deleted!!");

  req.user = curUser;

  next();
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user || !(await user.correctPassword(req.body.password))) {
      throw new Error("Incorrect username or password");
    }

    const token = signToken(user._id);
    if (!token) {
      throw err;
    }

    responseController.sendResponse(res, "success", 200, "Bearer " + token);
  } catch (err) {
    responseController.sendResponse(res, "fail", 401, err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password)
      throw new Error("username and password are required");

    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      nickname: req.body.nickname,
    });

    const token = signToken(user._id);

    if (!token) throw err;

    responseController.sendResponse(res, "success", 200, "Bearer " + token);
  } catch (err) {
    responseController.sendResponse(res, "fail", 400, err);
  }
};
