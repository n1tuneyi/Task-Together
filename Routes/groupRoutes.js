const express = require("express");
const router = express.Router();

const groupController = require("../Controller/groupController");
const authController = require("../Controller/authController");
const topicRoutes = require("../Routes/topicRoutes");

router.use(authController.protect);

// you can call the topicRoutes(req, res, next) to immediately activate the router

router.use("/:id", topicRoutes);

// Define group-related routes and middleware
router
  .route("/")
  .post(authController.protect, groupController.createGroup)
  .get(authController.protect, groupController.getAllGroups);

module.exports = router;
