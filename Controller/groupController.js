const Group = require("../Model/groupModel");
const AppError = require("../Utils/appError");
const responseController = require("../Controller/responseController");
const User = require("../Model/userModel");
const multer = require("multer");
const cloudinary = require("cloudinary");
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

    const updatedUserData = await User.findByIdAndUpdate(req.user._id, {
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
