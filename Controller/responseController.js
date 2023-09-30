exports.sendResponse = (res, statusCode, data) => {
  res.status(statusCode).json({
    status: "success",
    data,
  });
};

exports.sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    status: "fail",
    message,
  });
};
