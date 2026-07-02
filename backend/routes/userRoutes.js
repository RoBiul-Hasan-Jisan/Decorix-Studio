const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  getUsers,
  getUserDetail,
  setUserDisabled,
  deleteUser,
  makeAdmin,
} = require("../controllers/userController");

// Customer routes
router.put("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.post("/wishlist/:productId", protect, toggleWishlist);
router.get("/wishlist", protect, getWishlist);

// Admin routes
router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, adminOnly, getUserDetail);
router.put("/:id/disable", protect, adminOnly, setUserDisabled);
router.put("/:id/make-admin", protect, adminOnly, makeAdmin);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
