const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../Utils/appError");
const { promisify } = require("util");

const signToken = id => {
  // We only want to sign the ID of the user cause that's the payload that's gonna differ from a user to a user
  return jwt.sign({ id }, "secretadsfjk;324hfadsx", {
    expiresIn: "90d", // This env variable is equal to 90d
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // HTTPS when in production mode
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: "Bearer " + token,
    data: user,
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
  } else {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(new AppError("Not Authorized, no token provided", 401));

  const decoded = await promisify(jwt.verify)(token, "secretadsfjk;324hfadsx");

  const curUser = await User.findById(decoded.id);

  if (!curUser) return next(new AppError("user was deleted!!", 403));

  req.user = curUser;

  next();
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user || !(await user.correctPassword(req.body.password))) {
      throw new Error("Incorrect username or password");
    }

    createSendToken(user, 200, res);
  } catch (err) {
    return next(new AppError(err, 401));
  }
};

exports.signup = async (req, res, next) => {
  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      nickname: req.body.nickname,
    });

    createSendToken(user, 201, res);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};
