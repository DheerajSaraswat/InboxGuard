import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  platformMail: { type: String, unique: true },
  username: { type: String, required: true, unique: true },
  fullname: { type: String, default: "John Doe" },
  bio: { type: String, default: "Your bio...." },

  displayImage: {
    type: String,
    default: function () {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        this.username
      )}`;
    },
  },

  publicId: { type: String, default: null },//to delete images from cloudinary

  accountType: {
    type: String,
    enum: ["free", "professional", "enterprise"],
    default: "free",
  },

  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  securitySettings: {
    phishingDetection: {
      enabled: { type: Boolean, default: true },
      sensitivity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      customRules: [
        {
          ruleId: String,
          name: String,
          type: String,
          pattern: String,
          action: String,
          isActive: { type: Boolean, default: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },

    encryption: {
      publicKey: String,
      keyGeneratedAt: Date,
      algorithm: { type: String, default: "RSA-2048" },
    },

    blacklist: [
      { type: { type: String }, value: String, addedAt: Date, reason: String },
    ],
    whitelist: [
      { type: { type: String }, value: String, addedAt: Date, reason: String },
    ],

    notifications: {
      phishingAlerts: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      desktopNotifications: { type: Boolean, default: false },
      fcmToken: String,
    },
  },

  storage: {
    used: { type: Number, default: 0 },
    limit: { type: Number, default: 1 * 1024 * 1024 * 1024 }, // 1GB free
    lastCalculated: { type: Date, default: Date.now },
  },
});

UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.model("User", UserSchema);
