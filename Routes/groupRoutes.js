const express = require("express");
const router = express.Router();

const groupController = require("../Controller/groupController");
const authController = require("../Controller/authController");
const topicRoutes = require("../Routes/topicRoutes");

router.use(authController.protect);

router.use("/:id", topicRoutes);

router
  .route("/")
  .post(authController.protect, groupController.createGroup)
  .get(authController.protect, groupController.getAllGroups);

module.exports = router;
