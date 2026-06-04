const crypto = require("crypto");
const { extractTextFromImageFile } = require("../adapters/imageAdapter");
const { detectClaims } = require("../pipeline/claimDetector");
const { verifyClaims } = require("../pipeline/verifier");
const { formatResult } = require("../pipeline/formatter");
const Result = require("../models/Result.model");

async function checkImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    const { language = "english" } = req.body;

    // extract text from image
    const extractedText = await extractTextFromImageFile(req.file.path);

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(422).json({ error: "Could not extract any text from this image." });
    }

    // check cache
    const inputHash = crypto.createHash("md5").update(extractedText.trim()).digest("hex");
    const cached = await Result.findOne({ inputHash, language });

    if (cached) {
      return res.json({ source: "cache", ...formatResult(
        cached.inputType,
        cached.originalInput,
        cached.language,
        cached.claims,
        cached.verdicts,
      )});
    }

    // run pipeline
    const claims = await detectClaims(extractedText);

    if (claims.length === 0) {
      return res.status(422).json({ error: "No verifiable claims found in this image." });
    }

    const verdicts = await verifyClaims(claims, language);
    const result = formatResult("image", extractedText, language, claims, verdicts);

    await Result.create({
      inputHash,
      inputType: "image",
      language,
      originalInput: extractedText,
      claims,
      verdicts,
    });

    return res.json({ source: "fresh", ...result });

  } catch (err) {
    next(err);
  }
}

module.exports = { checkImage };