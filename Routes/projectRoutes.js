const express = require("express");
const router = express.Router({ mergeParams: true });

const projectController = require("../Controller/projectController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");

router.use(authController.protect);

router
  .route("/")
  .get(
    projectController.setCategory,
    projectController.getAllProjectsForCategory
  )
  .post(projectController.setCategory, projectController.createProject);

router
  .route("/:projectID/members")
  .post(projectController.assignMembers)
  .get(projectController.getMembers);

router.route("/:projectID/candidates").get(projectController.getCandidates);

router
  .route("/:projectID/memberStatistics")
  .get(projectController.getMembersStatistics);
router
  .route("/:projectID/projectStatistics")
  .get(projectController.getProjectStatistics);

router.use("/:projectID/tasks", taskRouter);

module.exports = router;
