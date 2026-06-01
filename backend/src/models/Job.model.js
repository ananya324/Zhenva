const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "processing", "done", "failed"],
    default: "pending",
  },
  inputType: { type: String, enum: ["video", "audio"] },
  input: String,
  language: String,
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
});

module.exports = mongoose.model("Job", jobSchema);