exports.sendResponse = (res, status, statusCode, data) => {
  res.status(statusCode).json({
    status,
    ...(status === "success"
      ? { data, message: null }
      : { data: null, message: data }),
  });
};

exports.sendError = (res, status, statusCode, message) => {
  res.status(statusCode).json({
    status: "fail",
    message,
  });
};
