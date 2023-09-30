const User = require("../Model/user");
const jwt = require("jsonwebtoken");
const util = require("util");
const promisify = util.promisify;

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

  if (!token) {
    // eslint-disable-next-line prettier/prettier
    return res.status(404).json({
      status: "fail",
      message: "Not authorized, no token",
    });
  }
  // 2) Verification Token
  // If the token is not valid the payload has been manipulated/ token timer expired
  // JWT will throw an error invalid signature
  const decoded = await promisify(jwt.verify)(token, "secretadsfjk;324hfadsx");

  // 3) Check if user still exists
  const curUser = await User.findById(decoded.id);
  if (!curUser)
    res.status(403).json({
      status: "fail",
      message: "user was deleted!!",
    });
  req.user = curUser;
  next();
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) throw err;

    const token = signToken(user._id);

    if (!token) throw err;

    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,
    };

    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      status: "success",
      token,
      data: { name: user.name },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "username is wrong or token expired! please login again!",
    });
  }
};
