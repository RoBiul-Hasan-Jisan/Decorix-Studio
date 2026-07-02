const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const {
  getProductReviews,
  createReview,
  getAllReviews,
  setReviewStatus,
  replyToReview,
  deleteReview,
} = require("../controllers/reviewController");

router.get("/product/:productId", getProductReviews);
router.post("/", protect, createReview);

router.get("/", protect, adminOnly, getAllReviews);
router.put("/:id/status", protect, adminOnly, setReviewStatus);
router.put("/:id/reply", protect, adminOnly, replyToReview);
router.delete("/:id", protect, adminOnly, deleteReview);

module.exports = router;
