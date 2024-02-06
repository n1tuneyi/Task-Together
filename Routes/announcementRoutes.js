const express = require("express");
const router = express.Router({ mergeParams: true });
const announcementController = require("../Controller/announcementController");

router
  .route("/:announcementID")
  .patch(announcementController.updateAnnouncement)
  .delete(announcementController.deleteAnnouncement);

router.use(announcementController.setAnnouncement);

router
  .route("/")
  .post(
    announcementController.setAnnouncement,
    announcementController.createAnnouncement
  )
  .get(
    announcementController.setAnnouncement,
    announcementController.getAnnouncements
  );

module.exports = router;
