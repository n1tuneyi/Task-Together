const Group = require("../Model/groupModel");
const crudController = require("../Controller/crudController");
const AppError = require("../utils/appError");
const responseController = require("../Controller/responseController");

exports.createGroup = crudController.createOne(Group);
exports.getAllGroups = async (req, res, next) => {
  try {
    const data = await Group.find().select("-password -__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
