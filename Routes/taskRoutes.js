const express = require("express");
const router = express.Router();

const taskController = require("../Controller/taskController");
const authController = require("../Controller/authController");

router
  .route("/")
  .post(authController.protect, taskController.createTask)
  .get(authController.protect, taskController.getTask)
  .patch(authController.protect, taskController.tickTask);

module.exports = router;
