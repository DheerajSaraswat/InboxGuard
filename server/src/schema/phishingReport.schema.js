import mongoose, { Schema } from "mongoose";

const PhishingReportSchema = new Schema({
  reportedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reportedAt: { type: Date, default: Date.now },
  reportType: String,
  confidence: Number,
  email: { type: Schema.Types.ObjectId, ref: "Email" },

  analysis: {
    riskScore: Number,
    detectedPatterns: [String],
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "false_positive"],
      default: "pending",
    },
  },

  status: { type: String, default: "active" },
  updatedAt: { type: Date, default: Date.now },
});

export const PhishingReport = mongoose.model(
  "PhishingReport",
  PhishingReportSchema
);
