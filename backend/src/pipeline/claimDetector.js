const { extractClaims } = require("../services/groqServices");

async function detectClaims(text) {
    if (!text || text.trim().length < 10) {
        return [];
    }

    const claims = await extractClaims(text);

    // make sure we always return an array no matter what
    if (!Array.isArray(claims)) return [];

    // filter out empty strings
    return claims.filter((c) => typeof c === "string" && c.trim().length > 0);

}

module.exports = { detectClaims };