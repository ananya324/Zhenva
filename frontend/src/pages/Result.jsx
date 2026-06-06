import ClaimList from "../components/ClaimList";
import { t } from "../utils/translations";

const VERDICT_STYLES = {
  TRUE:       { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700" },
  FALSE:      { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700" },
  MISLEADING: { bg: "bg-orange-50", border: "border-orange-200",text: "text-orange-700" },
  UNVERIFIED: { bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-600" },
};

const EMOJI = {
  TRUE: "✅",
  FALSE: "❌",
  MISLEADING: "⚠️",
  UNVERIFIED: "🔍",
};

export default function Result({ result, language, onReset }) {
  const style = VERDICT_STYLES[result.overallVerdict] || VERDICT_STYLES.UNVERIFIED;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Zhenva</h1>
          <button
            onClick={onReset}
            className="text-sm text-blue-500 hover:underline"
          >
            {t(language, "checkAnother")}
          </button>
        </div>

        {/* Overall Verdict Banner */}
        <div className={`rounded-2xl border-2 p-6 text-center ${style.bg} ${style.border}`}>
          <p className="text-4xl mb-2">{EMOJI[result.overallVerdict]}</p>
          <p className={`text-2xl font-bold ${style.text}`}>
            {result.overallVerdict}
          </p>
          <p className="text-gray-400 text-xs mt-2">
            {t(language, "overallVerdict")}
          </p>
        </div>

        {/* Individual Claims */}
        <ClaimList claims={result.claims} language={language} />

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-300 text-xs">
            {t(language, "checkedAt")} {new Date(result.checkedAt).toLocaleTimeString()}
          </p>
          <button
            onClick={onReset}
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {t(language, "checkAnother")}
          </button>
        </div>

      </div>
    </div>
  );
}