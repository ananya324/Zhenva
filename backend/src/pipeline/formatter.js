const VERDICT_EMOJI = {
    TRUE: "✅",
    FALSE: "❌",
    MISLEADING: "⚠️",
    UNVERIFIED: "🔍",
};
const VERDICT_COLOR = {
    TRUE: "green",
    FALSE: "red",
    MISLEADING: "orange",
    UNVERIFIED: "grey",
};

function formatResult(inputType, originalInput, language, claims, verdicts, audiourl = null) {
    // overall verdict = worst verdict across all claims
    // if any claim is FALSE, overall is FALSE
    // if any is MISLEADING, overall is MISLEADING
    // if all are TRUE, overall is TRUE

    const priority = ["FALSE", "MISLEADING", "UNVERIFIED", "TRUE"];
    const overallVerdict = verdicts.reduce((worst, v) => {
        return priority.indexOf(v.verdict) < priority.indexOf(worst)
            ? v.verdict
            : worst;
    }, "TRUE");

    return {
        overallVerdict,
        emoji: VERDICT_EMOJI[overallVerdict],
        color: VERDICT_COLOR[overallVerdict],
        language,
        inputType,
        claims: verdicts.map((v) => ({
            claim: v.claim,
            verdict: v.verdict,
            emoji: VERDICT_EMOJI[v.verdict],
            color: VERDICT_COLOR[v.verdict],
            explanation: v.explanation,       // in user's language
            confidence: v.confidence,
            sources: v.sources,
        })),
        audioUrl,                           // full explanation audio
        checkedAt: new Date().toISOString(),
    };

}
module.exports = { formatResult };
