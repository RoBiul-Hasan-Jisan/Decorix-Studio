const cloudinary = require("cloudinary").v2;

// Reads credentials from your Cloudinary dashboard (Settings > API Keys).
// Free tier: 25GB storage + 25GB bandwidth/month - more than enough for a
// small catalog of ~30 product images.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
