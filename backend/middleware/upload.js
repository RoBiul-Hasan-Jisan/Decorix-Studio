const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Uploads go straight to Cloudinary instead of the server's local disk, so
// images survive redeploys/restarts on any host (Render, Railway, Vercel,
// etc. all wipe local disk on redeploy - Cloudinary doesn't).
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "homedecor", // everything lands in this Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1600, crop: "limit" }], // cap size, keep aspect ratio
  }),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
