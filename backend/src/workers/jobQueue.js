const Bull = require("bull");
const Redis = require("ioredis");
const { config } = require("../config");
const { extractTextFromVideo } = require("../adapters/videoAdapter");
const { detectClaims } = require("../pipeline/claimDetector");
const { verifyClaims } = require("../pipeline/verifier");
const { formatResult } = require("../pipeline/formatter");
const Job = require("../models/Job.model");


const redisOptions = {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const subscriber = new Redis(config.redisUrl, redisOptions);
const client = new Redis(config.redisUrl, redisOptions);
const bclient = new Redis(config.redisUrl, redisOptions);


const videoQueue = new Bull("video-jobs", {
  createClient: (type) => {
    switch (type) {
      case "client":    return client;
      case "subscriber": return subscriber;
      case "bclient":   return bclient;
      default:          return new Redis(config.redisUrl, redisOptions);
    }
  },
});


videoQueue.process(async (job) => {
  const { jobId, url, language } = job.data;

  try {
    await Job.findByIdAndUpdate(jobId, { status: "processing" });

    const transcript = await extractTextFromVideo(url);
    const truncated = transcript.slice(0, 3000);

    if (!truncated || truncated.trim().length < 10) {
      throw new Error("Could not extract any text from this video.");
    }

    const claims = await detectClaims(truncated);

    if (claims.length === 0) {
      throw new Error("No verifiable claims found in this video.");
    }

    const verdicts = await verifyClaims(claims, language);
    const result = formatResult("video", url, language, claims, verdicts);

    await Job.findByIdAndUpdate(jobId, { status: "done", result });

  } catch (err) {
    console.error("Job failed:", err.message);
    await Job.findByIdAndUpdate(jobId, { status: "failed", error: err.message });
  }
});

videoQueue.on("completed", (job) => {
  console.log(`Job ${job.data.jobId} completed`);
});

videoQueue.on("failed", (job, err) => {
  console.error(`Job ${job.data.jobId} failed:`, err.message);
});

module.exports = { videoQueue };