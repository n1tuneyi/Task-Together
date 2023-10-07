const express = require("express");
const router = express.Router();

const groupController = require("../Controller/groupController");
const authController = require("../Controller/authController");
const topicRoutes = require("../Routes/topicRoutes");

router.use(authController.protect);

// you can call the topicRoutes(req, res, next) to immediately activate the router
router.route("/discover").get(groupController.discoverGroups);

// Define group-related routes and middleware
router
  .route("/")
  .post(groupController.setGroup, groupController.createGroup)
  .get(groupController.getGroupsForUser);

router.route("/:id/join").post(groupController.joinGroup);

router.use("/:id", topicRoutes);

module.exports = router;
