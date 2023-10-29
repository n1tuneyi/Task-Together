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

exports.createGroup = async (req, res, next) => {
  try {
    const data = await Group.create(req.body); // Create the group without populating members
    // Now, use a separate query to populate the members field
    const populatedData = await Group.populate(data, {
      path: "members",
      select: "-__v -password -groups",
    });
    responseController.sendResponse(res, "success", 201, populatedData);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};
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
    console.log("asdfasdf");
    const data = await User.find({
      _id: req.user._id,
    });
    //     .populate({
    //       path: "groups",
    //       select: "-__v -password",
    //       populate: {
    //         path: "members",
    //         select: "-groups -password -__v",
    //       },
    //     })
    //     .select("groups -_id")
    // )[0].groups;

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
    })
      .select("-__v -subject -password")
      .populate({
        path: "members",
        select: "-__v -groups -password",
      });
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const updatedGroupData = await Group.findByIdAndUpdate(req.params.groupID, {
      $addToSet: { members: req.user._id },
    });

    const updatedUserData = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { groups: req.params.groupID },
    });

    responseController.sendResponse(res, "success", 200, updatedUserData);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
