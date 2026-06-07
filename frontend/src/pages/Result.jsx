import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Search } from "lucide-react";
import AudioPlayer from "../components/AudioPlayer";
import SourceList from "../components/SourceList";
import { t } from "../utils/translations";

const VERDICT_STYLES = {
  TRUE:       { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700",  pill: "bg-green-100 text-green-700" },
  FALSE:      { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",    pill: "bg-red-100 text-red-700" },
  MISLEADING: { bg: "bg-orange-50", border: "border-orange-200",text: "text-orange-700", pill: "bg-orange-100 text-orange-700" },
  UNVERIFIED: { bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-600",   pill: "bg-gray-100 text-gray-600" },
};

const VERDICT_ICON = {
  TRUE:       <CheckCircle   className="w-16 h-16 text-green-500" />,
  FALSE:      <XCircle       className="w-16 h-16 text-red-500" />,
  MISLEADING: <AlertTriangle className="w-16 h-16 text-orange-500" />,
  UNVERIFIED: <HelpCircle    className="w-16 h-16 text-gray-400" />,
};

const VERDICT_MESSAGE = {
  TRUE:       { en: "This is True",       hi: "यह सच है" },
  FALSE:      { en: "This is False",      hi: "यह झूठ है" },
  MISLEADING: { en: "This is Misleading", hi: "यह भ्रामक है" },
  UNVERIFIED: { en: "Could not verify",   hi: "सत्यापित नहीं हो सका" },
};

export default function Result({ result, language, onReset }) {
  const style = VERDICT_STYLES[result.overallVerdict] || VERDICT_STYLES.UNVERIFIED;
  const msg = VERDICT_MESSAGE[result.overallVerdict];

  return (
    <div className="min-h-screen bg-[#FFF8F0]">

      {/* Header */}
      <div className="bg-white border-b border-orange-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md shadow-orange-200">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Zhenva</h1>
          </div>
          <button
            onClick={onReset}
            className="text-xs font-semibold text-[#FF6B00] border border-orange-200 rounded-xl px-3 py-1.5 bg-orange-50 transition-all hover:bg-orange-100"
          >
            {t(language, "checkAnother")}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Single Result Box */}
        <div className={`rounded-3xl border-2 p-6 ${style.bg} ${style.border}`}>

          {/* Icon + Verdict */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              {VERDICT_ICON[result.overallVerdict]}
            </div>
            <p className={`text-3xl font-bold ${style.text}`}>
              {msg?.en}
            </p>
            {language !== "english" && (
              <p className={`text-lg font-medium ${style.text} mt-1 opacity-80`}>
                {msg?.hi}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className={`border-t ${style.border} mb-5`} />

          {/* Combined Explanation */}
          <p className={`text-base font-medium ${style.text} leading-relaxed mb-5`}>
            {result.overallExplanation}
          </p>

          {/* Audio */}
          <div className="mb-5">
            <AudioPlayer text={result.overallExplanation} language={language} />
          </div>

          {/* Sources */}
          <SourceList sources={result.sources} />

        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-gray-300 text-xs mb-4">
            {t(language, "checkedAt")} {new Date(result.checkedAt).toLocaleTimeString()}
          </p>
          <button
            onClick={onReset}
            className="w-full py-4 bg-[#FF6B00] hover:bg-[#E05A00] text-white font-bold rounded-2xl transition-all shadow-md shadow-orange-200"
          >
            {t(language, "checkAnother")}
          </button>
        </div>

      </div>
    </div>
  );
}