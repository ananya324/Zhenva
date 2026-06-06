const Groq = require("groq-sdk");
const { config } = require("../config");

const groq = new Groq({ apiKey: config.groqKey });

async function extractClaims(text) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a fact-checking assistant. Your only job is to extract specific, verifiable factual claims from content.
Rules:
- Only extract concrete facts that can be verified (not opinions, not feelings)
- Maximum 5 claims
- If no verifiable claims exist, return empty array
- Return ONLY a raw JSON array of strings, no explanation, no markdown, no backticks`,
      },
      {
        role: "user",
        content: `Extract all verifiable factual claims from this content:\n\n${text}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 500,
  });

  const raw = response.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch {
    console.error("extractClaims parse error:", raw);
    return [];
  }
}

async function generateVerdict(claim, searchResults, language = "english") {
  const evidence = searchResults
    .map((r, i) => `[${i + 1}] ${r.title}: ${r.content}`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a professional fact-checker. Analyze claims against evidence and return accurate verdicts.
Return ONLY a raw JSON object, no markdown, no backticks, no explanation outside the JSON.`,
      },
      {
        role: "user",
        content: `Claim: "${claim}"

Evidence from trusted sources:
${evidence || "No evidence found."}

Return a JSON object with exactly these keys:
{
  "verdict": "TRUE" or "FALSE" or "MISLEADING" or "UNVERIFIED",
  "reason": "one clear sentence in simple English explaining the verdict",
  "explanation": "same reason explained in ${language} language. STRICT RULES: If language is hindi, write ONLY in Devanagari script (हिंदी), no Roman/English words at all. If language is tamil, write ONLY in Tamil script. If language is telugu, write ONLY in Telugu script. If language is bengali, write ONLY in Bengali script. If language is marathi, write ONLY in Devanagari script. If language is english, write in simple English. Never mix scripts.",
  "confidence": "HIGH" or "MEDIUM" or "LOW",
  "sources": ["url1", "url2"]
}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 800,
  });

  const raw = response.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch {
    console.error("generateVerdict parse error:", raw);
    return {
      verdict: "UNVERIFIED",
      reason: "Could not analyze this claim at the moment.",
      explanation: "Could not analyze this claim at the moment.",
      confidence: "LOW",
      sources: [],
    };
  }
}

async function extractTextFromImage(base64Image, mediaType = "image/jpeg") {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",

    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mediaType};base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: "Extract all visible text from this image. Return only the text exactly as it appears, nothing else.",
          },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  return response.choices[0].message.content.trim();
}

async function transcribeAudio(base64Audio) {
  const audioBuffer = Buffer.from(base64Audio, "base64");

  const response = await groq.audio.transcriptions.create({
    file: new File([audioBuffer], "audio.mp3", { type: "audio/mp3" }),
    model: "whisper-large-v3",
    response_format: "text",
  });

  return response;
}

module.exports = {
  extractClaims,
  generateVerdict,
  extractTextFromImage,
  transcribeAudio,
};