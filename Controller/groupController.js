const Group = require("../Model/groupModel");
const AppError = require("../Utils/appError");
const responseController = require("../Controller/responseController");
const User = require("../Model/userModel");
const multer = require("multer");
const cloudinary = require("cloudinary");
const GroupInvite = require("../Model/groupInvitesModel");

const multerStorage = multer.memoryStorage();

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

    console.log("file start", req.file, "file end");
    console.log("calling toString");
    const imageData = req.file.buffer.toString("base64");
    console.log("dataURL concat");
    const dataUrl = `data:${req.file.mimetype};base64,${imageData}`;

    console.log(imageData.length, dataUrl.length);

    const result = await cloudinary.uploader.upload(dataUrl, {
      public_id: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // Resize and limit the dimensions
        { quality: "auto" }, // Optimize quality
      ],
      format: "webp", // Convert to webp format
    });

    req.body.photo = result.secure_url;
    console.log("report", req.body.photo, "this");
    next();
  } catch (err) {
    console.log(err);
    return next(new AppError(err, 500));
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupID);

    if (!group) return next(new AppError("Group not found", 404));

    if (!group.adminUsername == req.user.username)
      return next(new AppError("You are not the admin of this group", 403));

    const fields = ["name", "description"];

    fields.forEach(field => {
      if (req.body[field]) {
        group[field] = req.body[field];
      }
    });

    if (req.body.photo) {
      group.photo = req.body.photo;
    }

    await group.save();

    responseController.sendResponse(res, "success", 200, group);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.setGroup = async (req, res, next) => {
  req.body.members = [req.user._id];
  req.body.createdBy = req.user._id;
  req.body.adminUsername = req.user.username;

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
    const data = await GroupInvite.find({ invitedUser: req.user._id });

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

exports.deleteGroup = async (req, res, next) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.groupID);

    if (!deletedGroup) return next(new AppError("Group not found", 404));

    // if the user is not the admin, they can't delete the group
    if (deletedGroup.adminUsername != req.user.username)
      return next(new AppError("Something went wrong", 404));

    await User.updateMany(
      { _id: { $in: deletedGroup.members } },
      { $pull: { groups: req.params.groupID } }
    );

    responseController.sendResponse(res, "success", 204);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.testWebsocket = async (req, res, next) => {
  responseController.sendResponse(res, "success", 204);
};
