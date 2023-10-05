exports.sendResponse = (res, status, statusCode, data = null) => {
  res.status(statusCode).json({
    status,
    ...(status === "success"
      ? { data, message: null }
      : { message: data.message, data: null }),
  });
};
