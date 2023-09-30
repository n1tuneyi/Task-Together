const User = require("../Model/user");
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
    return responseController.sendError(res, 404, "Not authorized, no token");

  const decoded = await promisify(jwt.verify)(token, "secretadsfjk;324hfadsx");

  const curUser = await User.findById(decoded.id);

  if (!curUser) responseController.sendError(res, 403, "user was deleted!!");

  req.user = curUser;
  next();
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name });

    if (!user) {
      throw err;
    }

    const token = signToken(user._id);
    if (!token) {
      throw err;
    }

    res.status(200).json({
      status: "success",
      data: "Bearer " + token,
    });
    responseController.sendResponse(res, 200, "Bearer " + token);
  } catch (err) {
    responseController.sendError(res, 401, err);
  }
};
