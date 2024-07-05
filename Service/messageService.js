const Message = require("../Model/messageModel");
const Group = require("../Model/groupModel");
const AppError = require("../Utils/appError");
const authService = require("../Service/authService");

exports.createMessage = async msg => {
  try {
    const group = await Group.findById(msg.groupID);
    const sender = await authService.validateUser(msg.token);

    if (!group) throw new AppError("Group not found", 404);

    if (
      !group.members
        .map(member => String(member._id))
        .includes(String(sender._id))
    )
      throw new AppError("Unauthorized", 401);

    const message = await Message.create({
      content: msg.content,
      sender: sender._id,
      group: group._id,
      timestamp: Date.now(),
    });

    return message;
  } catch (err) {
    throw new AppError(err, 400);
  }
};
