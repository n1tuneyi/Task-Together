const express = require("express");
const router = express.Router({ mergeParams: true });

const taskController = require("../Controller/taskController");
const authController = require("../Controller/authController");

router
  .route("/")
  .get(taskController.setTopicId, taskController.getAllTasks)
  .post(taskController.setTopicId, taskController.createTask);
// .patch(taskController.tickTask);

module.exports = router;
