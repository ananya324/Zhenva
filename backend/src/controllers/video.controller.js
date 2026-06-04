const { videoQueue } = require("../workers/jobQueue");
const Job = require("../models/Job.model");

async function checkVideo(req, res, next) {
  try {
    const { url, language = "english" } = req.body;

    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "Invalid URL." });
    }

    
    const supported = ["youtube.com", "youtu.be", "instagram.com", "facebook.com", "fb.watch"];
    const isSupported = supported.some((domain) => url.includes(domain));

    if (!isSupported) {
      return res.status(400).json({ error: "Only YouTube, Instagram, and Facebook links are supported." });
    }

    // create job in DB
    const job = await Job.create({ inputType: "video", input: url, language });

    // add to Bull queue
    await videoQueue.add({ jobId: job._id.toString(), url, language });

    // return jobId immediately — frontend will poll for result
    return res.json({
      jobId: job._id.toString(),
      status: "pending",
      message: "Video is being processed. Poll /api/check/video/job/:jobId for result.",
    });

  } catch (err) {
    next(err);
  }
}

async function getJobStatus(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }

    // if done or failed, return full details
    if (job.status === "done") {
      return res.json({ status: "done", result: job.result });
    }

    if (job.status === "failed") {
      return res.json({ status: "failed", error: job.error });
    }

    // still processing
    return res.json({ status: job.status });

  } catch (err) {
    next(err);
  }
}

module.exports = { checkVideo, getJobStatus };