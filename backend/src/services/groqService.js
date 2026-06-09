const Groq = require("groq-sdk");
const { config } = require("../config");

const groq = new Groq({ apiKey: config.groqKey });

async function extractClaims(text) {
  return withRetry(async () => {
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
  })
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

Verdict rules — follow these strictly:
- TRUE: claim is fully accurate with strong evidence. No important context missing.
- FALSE: claim is factually wrong according to evidence.
- MISLEADING: claim has some truth but omits important context, exaggerates, oversimplifies, or could cause harm if believed without qualification. Use this when something is "partially true but dangerous to believe as stated."
- UNVERIFIED: no reliable evidence found either way.

Examples of MISLEADING:
- "Energy drinks improve performance" → MISLEADING (true for some people in some situations, but hides risks)
- "Hot water kills viruses" → FALSE
- "Vaccines cause autism" → FALSE
- "The government announced ₹5000 for citizens" → needs verification

Claim: "${claim}"

Return a JSON object with exactly these keys:
{
  "verdict": "TRUE" or "FALSE" or "MISLEADING" or "UNVERIFIED",
  "reason": "one clear sentence in simple English explaining the verdict. If MISLEADING, explain what context is missing.",
  "confidence": "HIGH" or "MEDIUM" or "LOW",
  "sources": ["url1", "url2"]
}

IMPORTANT: verdict and reason must ALWAYS be in English regardless of anything else.`,
      },
    ],
    temperature: 0.1,
    max_tokens: 800,
  });

  const raw = response.choices[0].message.content.trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
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

  // separate call to translate reason into user's language
  let explanation = parsed.reason;

  if (language !== "english") {
    const translateResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Translate this text into ${language} language only. 
Use proper ${language} script only — no Roman letters, no English words mixed in.
Keep it simple and easy to understand for a common person.
Return ONLY the translated text, nothing else.

Text: "${parsed.reason}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 400,
    });

    explanation = translateResponse.choices[0].message.content.trim();
  }

  return {
    verdict: parsed.verdict,
    reason: parsed.reason,
    explanation,
    confidence: parsed.confidence,
    sources: parsed.sources || [],
  };
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
// retry with delay on rate limit
async function withRetry(fn, retries = 3, delayMs = 20000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit = err?.message?.includes("rate_limit_exceeded") ||
        err?.message?.includes("429");
      if (isRateLimit && i < retries - 1) {
        console.log(`Rate limited. Waiting ${delayMs / 1000}s before retry ${i + 1}...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw err;
      }
    }
  }
}

module.exports = {
  extractClaims,
  generateVerdict,
  extractTextFromImage,
  transcribeAudio,

};