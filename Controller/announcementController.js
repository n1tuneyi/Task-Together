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
    console.log(data);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
