const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { syncUser, getMe } = require("../controllers/authController");

router.post("/sync", protect, syncUser);
router.get("/me", protect, getMe);

module.exports = router;
