const Announcement = require("../Model/announcementModel");
const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const crudController = require("./crudController");
exports.setAnnouncement = (req, res, next) => {
  req.body.place = req.params.subjectID || req.params.groupID;
  req.body.createdBy = req.user._id;
  next();
};

exports.createAnnouncement = crudController.createOne(Announcement);
exports.getAnnouncements = async (req, res, next) => {
  try {
    const data = await Announcement.find({ place: req.body.place });
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.updateAnnouncement = async (req, res, next) => {
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.announcementID,
      req.body,
      {
        new: true,
      }
    );
    responseController.sendResponse(res, "success", 200, updatedAnnouncement);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.announcementID);
    responseController.sendResponse(res, "success", 204, null);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};
