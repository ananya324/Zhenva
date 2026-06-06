const crypto = require("crypto");
const { detectClaims } = require("../pipeline/claimDetector");
const { verifyClaims } = require("../pipeline/verifier");
const { formatResult } = require("../pipeline/formatter");
const Result = require("../models/Result.model");

async function checkText(req, res, next) {
  try {
    const { text, language = "english" } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Text is too short to fact-check." });
    }

    const inputHash = crypto.createHash("md5").update(text.trim()).digest("hex");
    const cached = await Result.findOne({ inputHash, language });

    if (cached) {
      console.log("Cache hit:", inputHash);
      const result = formatResult(
        cached.inputType,
        cached.originalInput,
        cached.language,
        cached.claims,
        cached.verdicts,
      );
      return res.json({ source: "cache", ...result });
    }

    // run pipeline
    const claims = await detectClaims(text);

    if (!claims || claims.length === 0) {
      return res.status(422).json({ error: "No verifiable claims found in this text." });
    }

    const verdicts = await verifyClaims(claims, language);
    const result = formatResult("text", text, language, claims, verdicts);

    await Result.create({
      inputHash,
      inputType: "text",
      language,
      originalInput: text,
      claims,
      verdicts,
    });

    return res.json({ source: "fresh", ...result });

  } catch (err) {
    next(err);
  }
}

module.exports = { checkText };