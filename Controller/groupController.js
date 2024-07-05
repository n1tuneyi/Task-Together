const Group = require("../Model/groupModel");
const AppError = require("../Utils/appError");
const responseController = require("../Controller/responseController");
const User = require("../Model/userModel");
const multer = require("multer");
const cloudinary = require("cloudinary");
const Project = require("../Model/projectModel");
const Task = require("../Model/taskModel");
const GroupInvite = require("../Model/groupInvitesModel");
const multerStorage = multer.memoryStorage();
const socketImport = require("../websocket");

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadToBody = upload.single("photo");

exports.uploadGroupPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      console.log("no file found!");
      return next();
    }

    const imageData = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${imageData}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    req.body.photo = result.secure_url;

    next();
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.groupID,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    responseController.sendResponse(res, "success", 200, updatedGroup);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

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
      select: "-__v -password -groups -projects -tasks",
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
    const data = (
      await User.findOne({
        _id: req.user._id,
      }).select("groups -_id")
    ).groups;

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
      .select("-__v -project -password")
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

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { groups: req.params.groupID },
    });

    responseController.sendResponse(res, "success", 200, updatedGroupData);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const data = (
      await Group.findById(req.params.groupID).select("members -_id")
    ).members;
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.groupID,
      {
        $pull: { members: { $in: [req.query.userId] } },
      },
      {
        new: true,
      }
    );

    if (!updatedGroup) return next(new AppError("Group not found", 404));

    // If the group has no members, delete the group
    if (updatedGroup.members.length == 0) {
      await Group.findByIdAndDelete(req.params.groupID);
    }

    await User.findByIdAndUpdate(req.query.userId, {
      $pull: { groups: req.params.groupID },
    });

    responseController.sendResponse(res, "success", 204);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.inviteToGroup = async (req, res, next) => {
  try {
    const invitedUser = await User.findOne({ username: req.query.username });

    const invitedBy = await User.findById(req.user._id);

    if (!invitedUser)
      return next(new AppError("There is no user with that name", 404));

    const checkExistingGroupInvite = await GroupInvite.findOne({
      invitedUser: invitedUser._id,
      group: req.params.groupID,
    });

    if (checkExistingGroupInvite)
      return next(new AppError("User is already invited", 404));

    // if a person is not in the group he can't invite other people to that group
    if (
      !invitedBy.groups
        .map(group => String(group._id))
        .includes(req.params.groupID)
    )
      return next(new AppError("Something went wrong", 404));

    if (String(invitedUser._id) == String(req.user._id))
      return next(new AppError("You can't Invite yourself", 404));

    if (
      invitedUser.groups
        .map(group => String(group._id))
        .includes(req.params.groupID)
    )
      return next(new AppError("User already in group", 404));

    const groupInvite = await GroupInvite.create({
      ...req.body,
      invitedBy: req.user._id,
      invitedUser: invitedUser._id,
      group: req.params.groupID,
    });

    await User.findByIdAndUpdate(invitedUser._id, {
      $addToSet: { groupInvites: groupInvite._id },
    });

    responseController.sendResponse(res, "success", 200, groupInvite);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.showGroupInvites = async (req, res, next) => {
  try {
    const data = await GroupInvite.find({ invitedUser: req.user._id }).populate(
      {
        path: "group",
        select: "-members -password",
      }
    );

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.acceptOrRejectGroupInvite = async (req, res, next) => {
  try {
    const groupInvite = await GroupInvite.findById(req.params.groupInviteID);

    if (!groupInvite || String(groupInvite.invitedUser) != String(req.user._id))
      return next(new AppError("Group Invite not found", 404));

    if (req.query.accept == "true") {
      await Group.findByIdAndUpdate(
        groupInvite.group,
        {
          $addToSet: { members: req.user._id },
        },
        {
          new: true,
        }
      );

      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { groups: groupInvite.group },
      });
    }

    await GroupInvite.findOneAndDelete(groupInvite._id);
    responseController.sendResponse(res, "success", 200, groupInvite);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.testWebsocket = async (req, res, next) => {
  responseController.sendResponse(res, "success", 204);
};
