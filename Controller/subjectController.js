const Subject = require("../Model/subjectModel");
const crudController = require("./crudController");
const AppError = require("../Utils/appError");
const responseController = require("./responseController");

exports.setGroup = (req, res, next) => {
  req.body.group = req.params.groupID;
  next();
};

exports.createSubject = crudController.createOne(Subject);
exports.getAllSubjects = async (req, res, next) => {
  try {
    const data = await Subject.find().select("-__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getAllSubjectsForGroup = async (req, res, next) => {
  try {
    const data = await Subject.find({ group: req.body.group }).select(
      "-__v -group"
    );
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.assignMembers = async (req, res, next) => {
  try {
    await Subject.findByIdAndUpdate(
      {
        _id: req.params.taskID,
      },
      { $addToSet: { members: req.user._id } },
      {
        new: true,
      }
    );
    responseController.sendResponse(res, "success", 200, req.body);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

// exports.getCandidates = async (req, res, next) => {
//   try {
//     const data = await Subject.find({ members: { $ne: req.user._id } });
//     responseController.sendResponse(res, "success", 200, data);
//   } catch (err) {
//     return next(new AppError(err, 404));
//   }
// };
