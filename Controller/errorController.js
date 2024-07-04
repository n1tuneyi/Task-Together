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

  sendErrorProd(err, res);
};
