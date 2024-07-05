const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const messageService = require("../Service/messageService");

exports.getMessages = async (req, res, next) => {
  try {
    const groupID = req.params.groupID;
    // const token =
    const data = messageService.getMessages(req.params.groupID);

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};
