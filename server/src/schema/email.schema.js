import mongoose from "mongoose";
import { Schema } from "mongoose";

const EmailSchema = new Schema({
  messageId: { type: String, unique: true },

  from: {
    userId: String, // Firebase UID
    email: String,
    username: String,
    publicKey: String,
  },
  to: [
    {
      userId: String,
      email: String,
      username: String,
      publicKey: String,
      deliveryStatus: {
        type: String,
        enum: ["pending", "delivered", "failed"],
        default: "pending",
      },
      readAt: Date,
      decryptedAt: Date,
    },
  ],

  // Encrypted Content
  subject: String,
  body: String,
  attachments: [
    {
      fileName: String,
      fileSize: Number,
      mimeType: String,
      cloudflareId: String, // Cloudflare R2 object ID
      cloudflareUrl: String, // Signed URL reference
      checksum: String,
    },
  ],

  encryption: {
    algorithm: { type: String, default: "AES-256-GCM" },
    keyExchange: { type: String, default: "RSA-2048" },
    encryptedKeys: [
      {
        recipientId: String,
        encryptedAESKey: String,
        iv: String,
      },
    ],
  },

  // Security
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
    analysisVersion: String,
    analyzedAt: Date,
    bypassedByUser: Boolean,
    bypassReason: String,
  },

  // Metadata
  status: {
    type: String,
    enum: ["draft", "sent", "delivered", "failed", "blocked"],
    default: "sent",
  },
  priority: {
    type: String,
    enum: ["low", "normal", "high"],
    default: "normal",
  },
  isStarred: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,

  createdAt: { type: Date, default: Date.now },
  sentAt: Date,
  deliveredAt: Date,
  updatedAt: { type: Date, default: Date.now },

  threadId: String,
  inReplyTo: String,
  references: [String],

  labels: [String],
  folder: { type: String, default: "inbox" },

  sizeBytes: Number,
  processingTime: Number,
});

EmailSchema.index({ subject: "text", "from.username": "text" });
EmailSchema.index({ "to.userId": 1, createdAt: -1 });
EmailSchema.index({ folder: 1, isDeleted: 1 });

export const Email = mongoose.model("Email",EmailSchema);