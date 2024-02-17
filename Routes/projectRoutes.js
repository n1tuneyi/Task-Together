const express = require("express");
const router = express.Router({ mergeParams: true });

const projectController = require("../Controller/projectController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");
const announcementRouter = require("./announcementRoutes");

router.use(authController.protect);

router
  .route("/")
  .get(projectController.setGroup, projectController.getAllProjectsForGroup)
  .post(projectController.setGroup, projectController.createProject);

router
  .route("/:projectID/members")
  .post(projectController.assignMembers)
  .get(projectController.getMembers);
  
router.route("/:projectID/candidates").get(projectController.getCandidates);

router.use("/:projectID/tasks", taskRouter);
router.use("/:projectID/announcements", announcementRouter);

module.exports = router;
