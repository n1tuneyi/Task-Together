const express = require("express");
const router = express.Router({ mergeParams: true });
const messageController = require("../Controller/messageController");

router.get("/", messageController.getMessages);

router.get("/translation", messageController.translateMessage);

module.exports = router;
