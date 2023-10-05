const responseController = require("../Controller/responseController");

exports.deleteOne = Model => async (req, res, next) => {
  try {
    await Model.findByIdAndDelete(req.params.id);
    responseController.sendResponse(res, "success", 204, null);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.getOne = Model => async (req, res, next) => {
  try {
    const data = await Model.findById(req.params.id);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.createOne = Model => async (req, res, next) => {
  try {
    const data = await Model.create(req.body);
    responseController.sendResponse(res, "success", 201, data);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};
