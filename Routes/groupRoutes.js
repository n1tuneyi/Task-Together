const express = require("express");
const router = express.Router();

const groupController = require("../Controller/groupController");
const authController = require("../Controller/authController");
const projectRouter = require("./projectRoutes");
const announcementRouter = require("./announcementRoutes");

router.use(authController.protect);

router.route("/discover").get(groupController.discoverGroups);

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

router
  .route("/:groupID/members")
  .get(groupController.getMembers)
  .delete(groupController.removeMember);

router.route("/:groupID/invite").post(groupController.inviteToGroup);

router.route("/groupInvites").get(groupController.showGroupInvites);

router
  .route("/groupInvites/:groupInviteID")
  .post(groupController.acceptOrRejectGroupInvite);

router.use("/:groupID/projects", projectRouter);

router.use("/:groupID/announcements", announcementRouter);

module.exports = router;
