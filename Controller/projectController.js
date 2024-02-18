const Project = require("../Model/projectModel");
const crudController = require("./crudController");
const AppError = require("../Utils/appError");
const responseController = require("./responseController");
const User = require('../Model/userModel')
const Task = require('../Model/taskModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.setCategory = (req, res, next) => {
  req.body.category = req.params.categoryID;
  next();
};

exports.createProject = crudController.createOne(Project);

exports.getAllProjectsForCategory = async (req, res, next) => {
  try {
    const data = await Project.find({ category: req.params.categoryID }).select(
      "-__v -category"
    );
    console.log(data);
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};


exports.getMembersStatistics = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectID);
    const statistics = project.members.map(async (member) => {
      const completedTasks = await Task.countDocuments({ assignedMember: member._id, completedDate: { $ne: null } });
      const remainingTasks = await Task.countDocuments({ assignedMember: member._id, completedDate: null });

      return {
        member,
        completedTasks,
        remainingTasks,
        assignedTasks: completedTasks + remainingTasks,
        progress: ((completedTasks / this.assignedTasks) * 100) || 0,
      };
    });

    const data = await Promise.all(statistics);

    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
}

exports.getProjectStatistics = async (req, res, next) => {
   const totalTasks = await Task.countDocuments({ project: req.params.projectID });
   const completedTasks = await Task.countDocuments({ project: req.params.projectID, completedDate:{$ne:null }});
   const projectProgress = ((completedTasks / totalTasks) * 100) || 0;

   const totalTasksWeight = (await Task.aggregate([
     {
      $match: {
       project: new ObjectId(req.params.projectID),
      }
     },
     {
      $group: {
          _id: null,
          totalWeight: { $sum: "$weight" },
      }
     }
   ]))[0].totalWeight

   const totalCompletedTasksWeightInterval = await Task.aggregate([
     {
      $match: {
       project: new ObjectId(req.params.projectID),
       completedDate: { $ne: null }
      }
     },
    {
    $addFields: {
      dueDate: "$completedDate"
     }
    },
     {
      $group: {
          _id: {
            $toDate: { $dateFromParts: {
              year: { $year: "$dueDate" },
              month: {$month: "$dueDate"},
              day: { $dayOfMonth: "$dueDate"}
            }}
          },
          totalWeight: { $sum: "$weight" },
      }
     },
    {
      $project: {
        date: "$_id",
        totalWeight: 1,
        _id: 0 
      }
    }
  ])

   const data =  {
     totalTasks,
     completedTasks,
     projectProgress,
     totalTasksWeight,
     totalCompletedTasksWeightInterval
   }

   responseController.sendResponse(res, "success", 200, data);
}

exports.assignMembers = async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(
      {
        _id: req.params.projectID,
      },
      { $addToSet: { members: req.body } },
      {
        new: true,
      }
    );
    
    await User.updateMany(
      { _id : { $in : req.body} },
      {
        $addToSet: {projects: req.params.projectID}
      },
      {
        new : true
      }
    );

    responseController.sendResponse(res, "success", 200, req.body);
  } catch (err) {
    responseController.sendResponse(res, "fail", 404, err);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    const data = await User.find({ projects: { $nin : [req.params.projectID]} }).select("-groups -password -projects -tasks -__v");
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
};

exports.getMembers = async (req, res , next) => { 
  try {
    const data = (await Project
    .findById(req.params.projectID)
    .select("members -_id")).members
    responseController.sendResponse(res, "success", 200, data);
  } catch (err) {
    return next(new AppError(err, 404));
  }
}

exports.getAllProjects = async (req, res, next) => {
  try {
    const data = await Project.find();
    return data;
  } catch (err) {
    return next(new AppError(err, 404));
  }
}