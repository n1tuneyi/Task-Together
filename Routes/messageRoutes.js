const express = require("express");
const router = express.Router({ mergeParams: true });
const messageController = require("../Controller/messageController");

router.get("/", messageController.getMessages);

module.exports = router;
