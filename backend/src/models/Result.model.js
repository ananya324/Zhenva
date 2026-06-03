const mongoose = require("mongoose");

const verdictSchema = new mongoose.Schema({
  claim: String,
  verdict: {
    type: String,
    enum: ["TRUE", "FALSE", "MISLEADING", "UNVERIFIED"],
  },
  reason: String,
  explanation: String,      // in user's preferred language
  confidence: {
    type: String,
    enum: ["HIGH", "MEDIUM", "LOW"],
  },
  sources: [String],
});

const resultSchema = new mongoose.Schema({
  inputHash: { type: String, required: true, index: true },
  inputType: {
    type: String,
    enum: ["text", "image", "video"],
    required: true,
  },
  language: String,
  originalInput: String,
  claims: [String],
  verdicts: [verdictSchema],
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = mongoose.model("Result", resultSchema);