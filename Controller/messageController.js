const responseController = require("./responseController");
const messageService = require("../Service/messageService");

exports.getMessages = async (req, res, next) => {
  try {
    const groupID = req.params.groupID;
    const token = req.headers?.authorization || req?.cookies?.jwt;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const data = await messageService.getMessages(
      groupID,
      token,
      page,
      pageSize
    );

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(err);
  }
};
