const Message = require("../Model/messageModel");
const Group = require("../Model/groupModel");
const AppError = require("../Utils/appError");
const authService = require("../Service/authService");

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
    throw new AppError(err, 404);
  }
};

exports.sendMessage = async msg => {
  try {
    const group = await Group.findById(groupID);
    const sender = await authService.validateUser(token);

    validateMessage(group, sender);

    await Message.create({
      content: msg.content,
      sender: sender._id,
      group: group._id,
      timestamp: Date.now(),
    });
  } catch (err) {
    throw new AppError(err, 400);
  }
};

exports.getMessages = async groupID => {
  try {
    const group = await Group.findById(groupID);
    const sender = await authService.validateUser(token);

    validateMessage(group, sender);

    const messages = await Message.find({ group: groupID }).populate()



    return messages;
  } catch (err) {
    throw new AppError(err, 404);
  }
};
