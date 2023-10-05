const AppError = require("../Utils/appError");

// const handleCastErrorDB = err => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

const handleDuplicateFieldsDB = (err, field) => {
  const message = `${err.keyValue[field]} already exists. Please use another ${field}!`;
  return new AppError(message, 400);
};

// const handleValidationErrorDB = err => {
//   const errors = Object.values(err.errors).map(el => el.message);
//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

const handleJWTError = () =>
  new AppError("Invalid Token. Please log in again!", 401);

// const handleJWTExpiredError = () =>
//   new AppError("Your token has expired! Please log in again.", 401);

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    data: null,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  err.message = err.message || "Something went very bad!";

  if (err.code === 11000)
    err = handleDuplicateFieldsDB(err, Object.keys(err.keyValue).join("\n"));

  // if (error.name === "CastError") error = handleCastErrorDB(error);
  // if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  // if (error.name === "JsonWebTokenError") error = handleJWTError();
  // if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  sendErrorProd(err, res);
};
