const Notification = require("../models/Notification");

// Small helper used across controllers to create notifications.
// Admin notifications: audience "admin" (shown to every admin in the dashboard).
// User notifications: audience "user" + user id.
async function notifyAdmin(type, title, message, link) {
  return Notification.create({ audience: "admin", type, title, message, link });
}

async function notifyUser(userId, type, title, message, link) {
  return Notification.create({ audience: "user", user: userId, type, title, message, link });
}

module.exports = { notifyAdmin, notifyUser };
