const express = require("express");
const router = express.Router({ mergeParams: true });

const projectController = require("../Controller/projectController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");

router.use(authController.protect);

router
  .route("/")
  .get(projectController.setGroup, projectController.getAllProjectsForGroup)
  .post(projectController.setGroup, projectController.createProject)
  .delete(projectController.deleteProject);

router
  .route("/:projectID/members")
  .post(projectController.assignMembers)
  .get(projectController.getMembers)
  .delete(projectController.removeMember);

router.route("/:projectID/candidates").get(projectController.getCandidates);

router
  .route("/:projectID/memberStatistics")
  .get(projectController.getMembersStatistics);
router
  .route("/:projectID/projectStatistics")
  .get(projectController.getProjectStatistics);

router.use("/:projectID/tasks", taskRouter);

module.exports = router;
