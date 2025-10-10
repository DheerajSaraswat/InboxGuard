import mongoose, { Schema } from "mongoose";

const EmailSchema = new Schema({
  messageId: { type: String, unique: true, sparse: true },

  from: { type: Schema.Types.ObjectId, ref: "User", required: true },

  to: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      deliveryStatus: {
        type: String,
        enum: ["pending", "delivered", "failed"],
        default: "pending",
      },
      readAt: Date,
      decryptedAt: Date,
    },
  ],

  subject: String,
  body: String,
  bodyChecksum: String,
  attachments: [
    {
      fileName: String,
      fileSize: Number,
      mimeType: String,
      cloudinaryUrl: String,
      checksum: String,
    },
  ],

  encryption: {
    algorithm: { type: String, default: "AES-256-GCM" },
    keyExchange: { type: String, default: "RSA-2048" },
    encryptedKeys: [
      {
        recipient: { type: Schema.Types.ObjectId, ref: "User" },
        encryptedAESKey: String,
        iv: String,
      },
    ],
  },

  securityAnalysis: {
    riskScore: Number,
    riskLevel: {
      type: String,
      enum: ["safe", "low", "medium", "high", "critical"],
    },
    indicators: [
      {
        type: String,
        severity: String,
        description: String,
        detected: Boolean,
      },
    ],
    analyzedAt: Date,
    bypassedByUser: Boolean,
  },

  threadId: { type: String }, // for grouping emails
  mailbox: {
    type: String,
    enum: ["inbox", "sent", "spam", "trash"],
    default: "inbox",
  },

  status: {
    type: String,
    enum: ["draft", "sent", "delivered", "failed", "blocked"],
    default: "sent",
  },

  createdAt: { type: Date, default: Date.now },
});

EmailSchema.index({ "to.user": 1 });
EmailSchema.index({ from: 1 });

export const Email = mongoose.model("Email", EmailSchema);
