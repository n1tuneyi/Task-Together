const express = require("express");
const router = express.Router({ mergeParams: true });

const subjectController = require("../Controller/subjectController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");
const announcementRouter = require("./announcementRoutes");

router.use(authController.protect);

router
  .route("/")
  .get(subjectController.setGroup, subjectController.getAllSubjectsForGroup)
  .post(subjectController.setGroup, subjectController.createSubject);

router.route("/:subjectID/members").post(subjectController.assignMembers);
router.route("/:subjectID/candidates").get(subjectController.getCandidates);

router.use("/:subjectID/tasks", taskRouter);
router.use("/:subjectID/announcements", announcementRouter);

module.exports = router;
