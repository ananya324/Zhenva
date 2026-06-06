const { searchTrustedSources } = require("../services/searchService");
const { generateVerdict } = require("../services/groqService");

async function verifyClaims(claims, language = "english") {
    if (!claims || claims.length === 0) {
        return [];
    }

    const verdicts = await Promise.all(
        claims.map(async (claim) => {
            const searchResults = await searchTrustedSources(claim);
            const verdict = await generateVerdict(claim, searchResults, language);

            return {
                claim,
                verdict: verdict.verdict,
                reason: verdict.reason,
                explanation: verdict.explanation,
                confidence: verdict.confidence,
                sources: verdict.sources || [],
            };
        })
    );
    return verdicts;
}

module.exports = {verifyClaims};