const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const upload = require("../middleware/upload");
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/inventory", protect, adminOnly, getInventory);
router.get("/id/:id", getProductById);
router.get("/:slug", getProductBySlug);
router.post("/", protect, adminOnly, upload.array("images", 8), createProduct);
router.put("/:id", protect, adminOnly, upload.array("images", 8), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
