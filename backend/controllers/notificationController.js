const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  const filter =
    req.user.role === "admin" ? { audience: "admin" } : { audience: "user", user: req.user._id };
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
};

const markRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
  res.json(notification);
};

const markAllRead = async (req, res) => {
  const filter =
    req.user.role === "admin" ? { audience: "admin" } : { audience: "user", user: req.user._id };
  await Notification.updateMany(filter, { isRead: true });
  res.json({ message: "All marked as read" });
};

module.exports = { getMyNotifications, markRead, markAllRead };
