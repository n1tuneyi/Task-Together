const express = require("express");
const router = express.Router({ mergeParams: true });

const taskController = require("../Controller/taskController");
const authController = require("../Controller/authController");

router.use(authController.protect);

router
  .route("/")
  .get(taskController.setSubject, taskController.getAllTasks)
  .post(taskController.setSubject, taskController.createTask);

router.route("/:taskID/tick").patch(taskController.tickTask);
router.route("/:taskID/members").post(taskController.assignMembers);
router.route("/:taskID/candidates").get(taskController.getCandidates);

module.exports = router;
