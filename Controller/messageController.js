const responseController = require("./responseController");
const messageService = require("../Service/messageService");
const deeplService = require("../Service/deeplService");

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

exports.translateMessage = async (req, res, next) => {
  try {
    const { targetLang, text } = req.query;
    console.log(text, targetLang);
    const translatedText = await deeplService.translateText(text, targetLang);

    responseController.sendResponse(res, "success", 200, translatedText);
  } catch (err) {
    return next(err);
  }
};
