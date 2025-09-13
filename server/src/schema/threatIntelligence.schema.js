import mongoose from "mongoose";
import { Schema } from "mongoose";


const ThreatIntelligenceSchema = new Schema({
  threatType: String,
  value: String,
  valueHash: String,
  severity: String,
  confidence: Number,
  description: String,
  category: String,
  sources: [
    {
      name: String,
      reportedAt: Date,
      confidence: Number,
      url: String,
    },
  ],
  statistics: {
    detectionCount: Number,
    lastSeen: Date,
    firstSeen: Date,
    affectedUsers: Number,
  },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ThreatIntelligence = mongoose.model("ThreatIntelligence", ThreatIntelligenceSchema)