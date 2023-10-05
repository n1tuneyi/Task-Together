const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err, field) => {
  const message = `${err.keyValue.name} already exists. Please use another ${field}!`;
  return new Error(message);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid Token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  let error = JSON.parse(JSON.stringify(err));

  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  // if (error.name === "CastError") error = handleCastErrorDB(error);
  // if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  // if (error.name === "JsonWebTokenError") error = handleJWTError();
  // if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  sendErrorProd(error, res);
};
