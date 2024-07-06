const express = require("express");
const authController = require("../Controller/authController");
const photoUpload = require("../Utils/photoUpload");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

// router.patch("/:userID", authController.updateUser);

module.exports = router;
