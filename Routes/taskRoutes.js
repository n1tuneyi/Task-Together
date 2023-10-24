const express = require("express");
const router = express.Router({ mergeParams: true });

const taskController = require("../Controller/taskController");
const authController = require("../Controller/authController");

router.use(authController.protect);

router
  .route("/")
  .get(taskController.setTopicId, taskController.getAllTasks)
  .post(taskController.setTopicId, taskController.createTask);

router.route("/:id/tick").patch(taskController.tickTask);

module.exports = router;
