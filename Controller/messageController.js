const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const Message = require("../Model/messageModel");

exports.createMessage = async (req, res, next) => {
  try {
    const message = await Message.create(req.body);
    responseController.sendResponse(res, "success", 201, message);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.getAnnouncements = async (req, res, next) => {
  try {
    let data = await Announcement.find({ group: req.params.groupID });

    data = data.map(announcement => {
      return {
        ...announcement._doc,
        editable: String(req.user._id) == String(announcement.createdBy._id),
      };
    });

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
