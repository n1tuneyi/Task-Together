const express = require("express");
const router = express.Router({ mergeParams: true });

const topicController = require("../Controller/topicController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");
const announcementRouter = require("./announcementRoutes");

router.use(authController.protect);

router
  .route("/")
  .get(topicController.setGroup, topicController.getAllTopicsForGroup)
  .post(topicController.setGroup, topicController.createTopic);

router.route("/:topicID/members").post(topicController.assignMembers);
router.route("/:topicID/candidates").get(topicController.getCandidates);

router.use("/:topicID/tasks", taskRouter);
router.use("/:topicID/announcements", announcementRouter);

module.exports = router;
