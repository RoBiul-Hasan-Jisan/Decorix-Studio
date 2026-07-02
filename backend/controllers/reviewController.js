const Review = require("../models/Review");
const Product = require("../models/Product");

const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: "approved" } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { rating: Math.round(avg * 10) / 10, numReviews: count });
};

const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: "approved" })
    .populate("user", "name photoURL")
    .sort({ createdAt: -1 });
  res.json(reviews);
};

const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) return res.status(400).json({ message: "You already reviewed this product" });

  const review = await Review.create({ product: productId, user: req.user._id, rating, comment });
  await recalcProductRating(productId);
  res.status(201).json(review);
};

// Admin
const getAllReviews = async (req, res) => {
  const reviews = await Review.find().populate("user", "name email").populate("product", "name slug").sort({ createdAt: -1 });
  res.json(reviews);
};

const setReviewStatus = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!review) return res.status(404).json({ message: "Review not found" });
  await recalcProductRating(review.product);
  res.json(review);
};

const replyToReview = async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { adminReply: req.body.adminReply }, { new: true });
  if (!review) return res.status(404).json({ message: "Review not found" });
  res.json(review);
};

const deleteReview = async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  await recalcProductRating(review.product);
  res.json({ message: "Review deleted" });
};

module.exports = { getProductReviews, createReview, getAllReviews, setReviewStatus, replyToReview, deleteReview };
