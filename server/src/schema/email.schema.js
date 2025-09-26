import mongoose, { Schema } from "mongoose";

const EmailSchema = new Schema({
  messageId: { type: String, unique: true },
  from: {
    userId: String,
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
  subject: String,
  body: String,
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
        recipientId: String,
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
  status: {
    type: String,
    enum: ["draft", "sent", "delivered", "failed", "blocked"],
    default: "sent",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Email = mongoose.model("Email", EmailSchema);
