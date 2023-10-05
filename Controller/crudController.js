const responseController = require("../Controller/responseController");
const AppError = require("../utils/appError");

exports.deleteOne = Model => async (req, res, next) => {
  try {
    await Model.findByIdAndDelete(req.params.id);
    responseController.sendResponse(res, "success", 204, null);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.getOne = Model => async (req, res, next) => {
  try {
    const data = await Model.findById(req.params.id);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.createOne = Model => async (req, res, next) => {
  try {
    const data = await Model.create(req.body);
    responseController.sendResponse(res, "success", 201, data);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};
