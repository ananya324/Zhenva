require("dotenv").config();

const required = [
  "MONGODB_URI",
  "ANTHROPIC_API_KEY",
  "TAVILY_API_KEY",
];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
});

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  tavilyKey: process.env.TAVILY_API_KEY,
  googleTtsKey: process.env.GOOGLE_TTS_API_KEY || null,
};

module.exports = { config };