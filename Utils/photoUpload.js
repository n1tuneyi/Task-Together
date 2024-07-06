const multer = require("multer");
const cloudinary = require("cloudinary");

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

exports.uploadToRequest = upload.single("photo");

exports.uploadPhotoToBody = async (req, res, next) => {
  try {
    if (!req.file) {
      // console.log("no file found!");
      return next();
    }

    const imageData = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${imageData}`;

    req.body.photo = dataUrl;

    const result = await cloudinary.uploader.upload(dataUrl, {
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    req.body.photo = result.secure_url;

    next();
  } catch (err) {
    return next(new AppError(err, 500));
  }
};

exports.uploadPhoto = async photo => {
  try {
    if (!file) {
      // console.log("no file found!");
      return null;
    }

    const result = await cloudinary.uploader.upload(photo.path, {
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    req.body.photo = result.secure_url;
  } catch (err) {
    return next(new AppError(err, 500));
  }
};
