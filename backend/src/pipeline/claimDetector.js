const { extractClaims } = require("../services/groqService");

// split text into individual sentences
function splitIntoSentences(text) {
  return text
    .split(/(?<=[।.!?])\s+/)   // split on Hindi danda, period, !, ?
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

// pass 2 — check each sentence individually
async function classifySentences(sentences) {
  const { default: Groq } = require("groq-sdk");
  const { config } = require("../config");
  const groq = new Groq({ apiKey: config.groqKey });

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a fact-checking assistant. 
For each sentence, decide if it contains a specific verifiable factual claim.
Return ONLY a raw JSON array of sentences that ARE factual claims.
Ignore opinions, emotions, greetings, calls to action, and questions.
No explanation, no markdown, no backticks.`,
      },
      {
        role: "user",
        content: `Classify these sentences:\n${JSON.stringify(sentences)}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 500,
  });

  try {
    return JSON.parse(response.choices[0].message.content.trim());
  } catch {
    return [];
  }
}

// merge two arrays, remove duplicates and near-duplicates
function mergeClaims(claims1, claims2) {
  const all = [...claims1, ...claims2];
  const unique = [];

  for (const claim of all) {
    // skip if a very similar claim already exists (over 80% similar)
    const isDuplicate = unique.some((existing) => {
      const a = existing.toLowerCase();
      const b = claim.toLowerCase();
      // simple check — if one contains the other, it's a duplicate
      return a.includes(b) || b.includes(a);
    });

    if (!isDuplicate) unique.push(claim);
  }

  // cap at 5 claims
  return unique.slice(0, 5);
}

async function detectClaims(text) {
  if (!text || text.trim().length < 10) return [];

  // run both passes in parallel
  const sentences = splitIntoSentences(text);

  const [pass1, pass2] = await Promise.all([
    extractClaims(text),                  // pass 1 — full text
    classifySentences(sentences),         // pass 2 — sentence by sentence
  ]);

  const merged = mergeClaims(
    Array.isArray(pass1) ? pass1 : [],
    Array.isArray(pass2) ? pass2 : [],
  );

  return merged.filter((c) => typeof c === "string" && c.trim().length > 0);
}

module.exports = { detectClaims };