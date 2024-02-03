const express = require("express");
const router = express.Router({ mergeParams: true });

const subjectController = require("../Controller/subjectController");
const authController = require("../Controller/authController");
const taskRouter = require("./taskRoutes");

router.use(authController.protect);

router
  .route("/")
  .get(subjectController.setGroup, subjectController.getAllSubjectsForGroup)
  .post(subjectController.setGroup, subjectController.createSubject);

router.use("/:subjectID/tasks", taskRouter);

module.exports = router;
