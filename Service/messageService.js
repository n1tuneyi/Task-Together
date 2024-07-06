const Message = require("../Model/messageModel");
const Group = require("../Model/groupModel");
const AppError = require("../Utils/appError");
const authService = require("../Service/authService");
const User = require("../Model/userModel");
const validateMessage = (group, sender) => {
  try {
    if (!group) throw new AppError("Group not found", 404);

    if (
      !group.members
        .map(member => String(member._id))
        .includes(String(sender._id))
    )
      throw new AppError("Unauthorized", 401);
  } catch (err) {
    throw err;
  }
};

exports.sendMessage = async (groupID, token, content) => {
  try {
    const group = await Group.findById(groupID);
    let sender = await authService.validateUser(token);

    validateMessage(group, sender);

    return await Message.create({
      content,
      sender,
      group: group._id,
      timestamp: Date.now(),
    });
  } catch (err) {
    throw new AppError(err, 400);
  }
};

exports.getMessages = async (groupID, token, page, pageSize) => {
  try {
    const group = await Group.findById(groupID);
    const sender = await authService.validateUser(token);

    validateMessage(group, sender);

    if (!page || !Number.isInteger(page) || page <= 0)
      throw new AppError("Invalid page number", 400);

    if (!pageSize || !Number.isInteger(pageSize) || pageSize <= 0)
      throw new AppError("Invalid page size", 400);

    const skip = (page - 1) * pageSize;

    const messages = await Message.find({ group: groupID })
      .skip(skip)
      .limit(pageSize)
      .sort({ timestamp: -1 });

    const totalMessages = await Message.countDocuments({ group: groupID });

    const totalPages = Math.ceil(totalMessages / pageSize);

    return {
      messages,
      totalMessages,
      isLast: page >= totalPages,
    };
  } catch (err) {
    throw err;
  }
};
