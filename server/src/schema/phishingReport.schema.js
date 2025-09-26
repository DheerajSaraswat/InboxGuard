import mongoose, { Schema } from "mongoose";

const PhishingReportSchema = new Schema({
  reportedBy: String,
  reportedAt: { type: Date, default: Date.now },
  reportType: String,
  confidence: Number,
  emailData: {
    senderDomain: String,
    subjectHash: String,
    contentSignature: String,
    urls: [String],
  },
  analysis: {
    riskScore: Number,
    detectedPatterns: [String],
    verificationStatus: { type: String, default: "pending" },
  },
  status: { type: String, default: "active" },
  updatedAt: { type: Date, default: Date.now },
});

export const PhishingReport = mongoose.model(
  "PhishingReport",
  PhishingReportSchema
);
