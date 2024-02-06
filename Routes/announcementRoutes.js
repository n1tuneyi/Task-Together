const express = require("express");
const router = express.Router({ mergeParams: true });
const announcementController = require("../Controller/announcementController");

router.use(announcementController.setAnnouncement);

router
  .route("/")
  .post(announcementController.createAnnouncement)
  .get(announcementController.getAnnouncements);

module.exports = router;
