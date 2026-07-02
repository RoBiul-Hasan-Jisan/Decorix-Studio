const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ["admin", "user"], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // set when audience = user
    type: {
      type: String,
      enum: [
        "order_status",
        "new_order",
        "low_stock",
        "new_user",
        "contact_message",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
