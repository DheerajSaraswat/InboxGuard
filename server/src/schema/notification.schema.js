import mongoose from "mongoose";
import { Schema } from "mongoose";

const NotificationSchema = new Schema({
  userId: String,
  type: String,
  title: String,
  message: String,
  priority: {
    type: String,
    enum: ["low", "normal", "high", "urgent"],
    default: "normal",
  },
  data: {
    emailId: String,
    actionUrl: String,
    actionText: String,
    additionalInfo: {},
  },
  channels: {
    inApp: { sent: Boolean, read: Boolean, readAt: Date },
    email: {
      sent: Boolean,
      sentAt: Date,
      delivered: Boolean,
      deliveredAt: Date,
    },
    push: { sent: Boolean, sentAt: Date, fcmMessageId: String },
  },
  status: { type: String, default: "pending" },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model("Notification", NotificationSchema);