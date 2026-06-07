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

function formatResult(inputType, originalInput, language, claims, verdicts) {
  const priority = ["FALSE", "MISLEADING", "UNVERIFIED", "TRUE"];

  const overallVerdict = verdicts.reduce((worst, v) => {
    return priority.indexOf(v.verdict) < priority.indexOf(worst)
      ? v.verdict
      : worst;
  }, "TRUE");

  // combine all explanations into one paragraph
  const overallExplanation = verdicts
    .map((v) => v.explanation)
    .join(" ");

  // collect all unique sources
  const allSources = [...new Set(
    verdicts.flatMap((v) => v.sources || [])
  )].filter((url) => typeof url === "string" && url.startsWith("http"));

  return {
    overallVerdict,
    emoji: VERDICT_EMOJI[overallVerdict],
    color: VERDICT_COLOR[overallVerdict],
    language,
    inputType,
    overallExplanation,
    sources: allSources,
    checkedAt: new Date().toISOString(),
  };
}

module.exports = { formatResult };