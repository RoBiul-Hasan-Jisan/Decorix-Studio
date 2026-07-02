const Banner = require("../models/Banner");

const getActiveBanners = async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $or: [{ startDate: null }, { startDate: { $lte: now } }],
  }).sort({ order: 1 });
  const filtered = banners.filter((b) => !b.endDate || b.endDate >= now);
  res.json(filtered);
};

const getAllBanners = async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json(banners);
};

const createBanner = async (req, res) => {
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  const banner = await Banner.create({ ...req.body, image });
  res.status(201).json(banner);
};

const updateBanner = async (req, res) => {
  const body = { ...req.body };
  if (req.file) body.image = `/uploads/${req.file.filename}`;
  const banner = await Banner.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  res.json(banner);
};

const deleteBanner = async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  res.json({ message: "Banner deleted" });
};

module.exports = { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner };
