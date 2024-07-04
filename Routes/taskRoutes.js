const express = require("express");
const router = express.Router({ mergeParams: true });

const taskController = require("../Controller/taskController");
const authController = require("../Controller/authController");

router.use(authController.protect);

router
  .route("/")
  .get(taskController.setProject, taskController.getTasksForUser)
  .post(taskController.setProject, taskController.createTask);
  // The admin of a group/project need to see all the tasks
  // .get(taskController.setProject, taskController.getAllTasks)

router.route("/:taskID/tick").patch(taskController.tickTask);
router.route("/:taskID/members").post(taskController.assignMembers);
router.route("/:taskID/candidates").get(taskController.getCandidates);
router.route("/:taskID").delete(taskController.deleteTask);

module.exports = router;
