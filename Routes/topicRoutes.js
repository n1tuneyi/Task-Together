const express = require("express");
const router = express.Router({ mergeParams: true });

const topicController = require("../Controller/topicController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");

router.use("/:id", taskRouter);

router
  .route("/")
  .get(
    authController.protect,
    topicController.setGroup,
    topicController.getAllTopicsForGroup
  )
  .post(
    authController.protect,
    topicController.setGroup,
    topicController.createTopic
  );

module.exports = router;
