const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const { getStats } = require("../controllers/dashboardController");

router.get("/stats", protect, adminOnly, getStats);

module.exports = router;
