const express = require("express");
const router = express.Router();

const groupController = require("../Controller/groupController");
const authController = require("../Controller/authController");

const subjectRouter = require("./subjectRoutes");
router.use(authController.protect);

// you can call the subjectRoutes(req, res, next) to immediately activate the router
router.route("/discover").get(groupController.discoverGroups);

// Define group-related routes and middleware
// Comment
router
  .route("/")
  .post(groupController.setGroup, groupController.createGroup)
  .get(groupController.getGroupsForUser);

router.route("/:groupID/join").post(groupController.joinGroup);

router
  .route("/:groupID")
  .patch(
    groupController.uploadToBody,
    groupController.uploadGroupPhoto,
    groupController.updateGroup
  );

router.use("/:groupID/subjects", subjectRouter);

module.exports = router;
