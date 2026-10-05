const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lost-and-found", // all uploads land in this Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    // Cloudinary auto-generates a unique public_id, so no filename collisions
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const isValidMime = allowedTypes.test(file.mimetype);
  if (isValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp, gif) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;