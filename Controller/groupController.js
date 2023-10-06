const Group = require("../Model/groupModel");
const crudController = require("../Controller/crudController");
const AppError = require("../Utils/appError");
const responseController = require("../Controller/responseController");
const User = require("../Model/userModel");

exports.createGroup = crudController.createOne(Group);
exports.getAllGroups = async (req, res, next) => {
  try {
    const data = await Group.find()
      .populate({
        path: "members",
        select: "-__v -groups -password",
      })
      .select("-password -__v");

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getGroupsForUser = async (req, res, next) => {
  try {
    const data = (
      await User.find({
        _id: req.user._id,
      })
        .populate({
          path: "groups",
          select: "-__v -members -password",
        })
        .select("groups -_id")
    )[0].groups;

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
