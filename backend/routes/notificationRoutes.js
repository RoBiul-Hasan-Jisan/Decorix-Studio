const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getMyNotifications, markRead, markAllRead } = require("../controllers/notificationController");

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markRead);
router.put("/read-all", protect, markAllRead);

module.exports = router;
