const Bull = require("bull");
const { config } = require("../config");
const { extractTextFromVideo } = require("../adapters/videoAdapter");
const { detectClaims } = require("../pipeline/claimDetector");
const { verifyClaims } = require("../pipeline/verifier");
const { formatResult } = require("../pipeline/formatter");
const Job = require("../models/Job.model");

//Create Queue - and store it into redis
const videoQueue = new Bull("video-jobs", {
    redis: config.redisUrl,
});

videoQueue.process(async (job) => {
    const { jobId, url, language } = job.data;

    try {
        await Job.findByIdAndUpdate(jobId, { status: "processing" });

        const transcript = await extractTextFromVideo(url);

        if (!transcript || transcript.trim().length < 10) {
            throw new Error("Could not extract any text from this video.");
        }

        const claims = await detectClaims(transcript);

        if (claims.length === 0) {
            throw new Error("No verifiable claims found in this video.");
        }

        const verdicts = await verifyClaims(claims, language);

        const result = formatResult(
            "video",
            url,
            language,
            claims,
            verdicts,
        );

        await Job.findByIdAndUpdate(jobId,{
            status: "done",
            result,
        });
    }catch(err){
        console.err("Job failed:",err.message);
        await Job.findByIdAndUpdate(jobId,{
            status:"failed",
            error:err.message,
        });
    }
});

videoQueue.on("completed",(job)=>{
    console.log(`Job ${job.data.jobId} completed`);
});

videoQueue.on("failed",(job,err)=>{
    console.error(`Job ${job.data.jobId} failed:`, err.message);
});

module.exports = {videoQueue};