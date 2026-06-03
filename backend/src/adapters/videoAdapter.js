const YTDlpWrap = require("yt-dlp-wrap").default;
const { YotubeTranscript, YoutubeTranscript } = require("youtube-transcript");
const path = require("path");
const fs = require("fs");

const ytDlp = new YTDlpWrap();

function detectPlatform(url) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
    return "unknown";
}
//yt- use transcript API (fast, no download needed)
async function getYouTubeTranscript(url) {
    try {
        const transcriptItems = await YoutubeTranscript.fetchTranscript(url);
        const fullText = transcriptItems.map((t) => t.text).join(" ");
        return fullText;
    } catch (err) {
        console.log("YouTube transcript error:", err.message);
        throw new Error("Could not fetch transcript for this video. It may not have captions enabled.");
    }
}

async function getReelTranscript(url) {
    //To save the MP3, we need a location.
    const outputPath = path.resolve("uploads", `reel_${Date.now()}.mp3`);
    try {
        // download audio only — faster than downloading full video
        await ytDlp.execPromise([
            url,
            "--extract-audio",
            "--audio-format", "mp3",
            "--output", outputPath,
            "--no-playlist",
        ]);
        // read audio file and transcribe
        const audioBuffer = fs.readFileSync(outputPath);
        const base64Audio = audioBuffer.toString("base64");

        // transcribe using Groq Whisper
        const { transcribeAudio } = require("../services/groqService");
        const transcript = await transcribeAudio(base64Audio);

        fs.unlinkSync(outputPath);
        return transcript;
    } catch (err) {
        // clean up if file was partially created
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        console.error("Reel transcript error:", err.message);
        throw new Error("Could not process this video. Please try a different link.");
    }
}

async function extractTextFromVideo(url){
    const platform = detectPlatform(url);

    switch(platform){
        case "youtube":
            return await getYouTubeTranscript(url);
        case "instagram":
        case "facebook":
            return await getReelTranscript(url);
        default:
      throw new Error("Unsupported platform. Please use YouTube, Instagram, or Facebook links.");
    }
}
module.exports = { extractTextFromVideo };
