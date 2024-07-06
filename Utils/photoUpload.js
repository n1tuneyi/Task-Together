const multer = require("multer");
const cloudinary = require("cloudinary");
const AppError = require("../Utils/appError");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadToRequest = (req, res, next) => {
  upload.single("photo")(req, res, next);
};

exports.uploadPhotoToBody = async (req, res, next) => {
  try {
    if (!req.file) {
      // console.log("no file found!");
      return next();
    }

    const imageData = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${imageData}`;

    req.body.photo = dataUrl;

    next();
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.uploadPhoto = async photo => {
  try {
    const result = await cloudinary.uploader.upload(photo, {
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });
    return result.secure_url;
  } catch (err) {
    throw new AppError(err, 500);
  }
};
