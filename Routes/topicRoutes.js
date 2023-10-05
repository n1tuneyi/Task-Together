const express = require("express");
const router = express.Router({ mergeParams: true });

const topicController = require("../Controller/topicController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");

router
  .route("/")
  .get(topicController.setGroup, topicController.getAllTopicsForGroup)
  .post(topicController.setGroup, topicController.createTopic);

router.use("/:id", taskRouter);

module.exports = router;
