const Group = require("../Model/groupModel");
const crudController = require("../Controller/crudController");
const AppError = require("../Utils/appError");
const responseController = require("../Controller/responseController");
const User = require("../Model/userModel");

exports.setGroup = async (req, res, next) => {
  req.body.members = [req.user._id];
  req.body.createdBy = req.user._id;
  next();
};

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
        .populate({
          path: "createdBy",
          select: "-__v -members -password",
        })
        .select("groups -_id")
    )[0].groups;

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.discoverGroups = async (req, res, next) => {
  try {
    let searchFilter;
    if (req.query.search) searchFilter = req.query.search;

    const data = await Group.find({
      _id: { $nin: req.user.groups },
      ...(searchFilter && { name: { $regex: searchFilter, $options: "i" } }),
    }).select("-__v -topic");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const updatedGroupData = await Group.findByIdAndUpdate(req.params.id, {
      $addToSet: { members: req.user._id },
    });

    const updatedUserData = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { groups: req.params.id },
    });

    responseController.sendResponse(res, "success", 200, updatedUserData);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

// exports.searchGroup = async (req, res , next) => {
//   try { }
// }
