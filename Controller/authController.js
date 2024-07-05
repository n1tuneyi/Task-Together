const AppError = require("../Utils/appError");
const authService = require("../Service/authService");

const setupCookieAndSend = (user, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie("jwt", user.token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    data: {
      token: "Bearer " + user.token,
      username: user.username,
      nickname: user.nickname,
    },
    message: null,
  });
};

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers?.authorization || req?.cookies?.jwt;

    const user = await authService.validateUser(token);

    req.user = user;

    next();
  } catch (err) {
    return next(new AppError(err, 401));
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await authService.login({
      username: req.body.username,
      password: req.body.password,
    });

    setupCookieAndSend(user, 200, res);
  } catch (err) {
    return next(new AppError(err, 401));
  }
};

exports.signup = async (req, res, next) => {
  try {
    const user = await authService.signUp({
      username: req.body.username,
      password: req.body.password,
      nickname: req.body.nickname,
    });

    setupCookieAndSend(user, 201, res);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};
