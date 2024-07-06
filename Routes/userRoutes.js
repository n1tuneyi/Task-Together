const express = require("express");
const authController = require("../Controller/authController");
const photoUpload = require("../Utils/photoUpload");

const router = express.Router();

router.post("/login", authController.login);

router.post(
  "/signup",
  photoUpload.uploadToRequest,
  photoUpload.uploadPhotoToBody,
  authController.signup
);

module.exports = router;
