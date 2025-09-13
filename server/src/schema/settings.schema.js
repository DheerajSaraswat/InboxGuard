import mongoose from "mongoose";
import { Schema } from "mongoose";

const SystemSettingsSchema = new Schema({
  key: { type: String, unique: true },
  value: Schema.Types.Mixed,
  dataType: String,
  category: String,
  description: String,
  isPublic: Boolean,
  isUserConfigurable: Boolean,
  validation: {
    required: Boolean,
    min: Number,
    max: Number,
    allowedValues: [String],
    pattern: String,
  },
  version: Number,
  lastModifiedBy: String,
  changeReason: String,
  previousValue: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Settings = mongoose.model("Settings", SystemSettingsSchema);