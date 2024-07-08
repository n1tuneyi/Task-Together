const Project = require("../Model/projectModel");
const AppError = require("../Utils/appError");
const User = require("../Model/userModel");
const Group = require("../Model/groupModel");

exports.createProject = async projectForm => {
  const group = await Group.findById(projectForm.group);

  if (!group) throw new AppError("Group not found", 404);

  const projectNames = (await Project.find({ group: group._id })).map(
    project => project.title
  );
  console.log("project checked");

  if (projectNames.includes(projectForm.title))
    throw new AppError("Project name already exists", 400);

  const project = await Project.create(projectForm);
  console.log("project created");
  await User.updateOne(
    { _id: projectForm.members[0] },
    {
      $addToSet: { projects: project._id },
    }
  );

  return project;
};
