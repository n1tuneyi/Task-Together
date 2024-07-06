const Project = require("../Model/projectModel");
const AppError = require("../Utils/appError");
const User = require("../Model/userModel");
const Group = require("../Model/groupModel");

exports.createProject = async projectForm => {
  const group = await Group.findById(projectForm.group);
  if (!group) throw new AppError("Group not found", 404);

  const project = await Project.create(projectForm);
  if (!project) throw new AppError("Project not created", 400);

  await User.updateOne(
    { _id: projectForm.members[0] },
    {
      $addToSet: { projects: project._id },
    }
  );

  return project;
};
