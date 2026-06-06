const YTDlpWrap = require("yt-dlp-wrap").default;
const { YoutubeTranscript } = require("youtube-transcript");
const path = require("path");
const fs = require("fs");

const ytDlp = new YTDlpWrap();

function detectPlatform(url) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
  return "unknown";
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function getYouTubeTranscript(url) {
  try {
    const videoId = extractVideoId(url);

    if (!videoId) {
      throw new Error("Could not extract video ID from URL.");
    }

    console.log("Fetching transcript for video ID:", videoId);

    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcriptItems.map((t) => t.text).join(" ");
    return fullText;

  } catch (err) {
    console.error("YouTube transcript error:", err.message);
    throw new Error("Could not fetch transcript for this video. It may not have captions enabled.");
  }
}

async function getReelTranscript(url) {
  const outputPath = path.resolve("uploads", `reel_${Date.now()}.mp3`);
  try {
    await ytDlp.execPromise([
      url,
      "--extract-audio",
      "--audio-format", "mp3",
      "--output", outputPath,
      "--no-playlist",
    ]);

    const audioBuffer = fs.readFileSync(outputPath);
    const base64Audio = audioBuffer.toString("base64");

    const { transcribeAudio } = require("../services/groqService");  // ← no S
    const transcript = await transcribeAudio(base64Audio);

    fs.unlinkSync(outputPath);
    return transcript;

  } catch (err) {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    console.error("Reel transcript error:", err.message);
    throw new Error("Could not process this video. Please try a different link.");
  }
}

async function extractTextFromVideo(url) {
  const platform = detectPlatform(url);

  switch (platform) {
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