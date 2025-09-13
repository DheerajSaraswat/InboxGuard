import mongoose from "mongoose";
import { Schema } from "mongoose";

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
    attachmentHashes: [String],
  },
  analysis: {
    riskScore: Number,
    detectedPatterns: [String],
    similarReports: Number,
    verificationStatus: { type: String, default: "pending" },
    verifiedBy: String,
    verifiedAt: Date,
  },
  impact: {
    affectedUsers: Number,
    blockedAttempts: Number,
    updatedRules: [String],
  },
  status: { type: String, default: "active" },
  updatedAt: { type: Date, default: Date.now },
});

export const PhishingReport = mongoose.model("PhishingReport", PhishingReportSchema);