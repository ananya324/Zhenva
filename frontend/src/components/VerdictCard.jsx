import AudioPlayer from "./AudioPlayer";
import SourceList from "./SourceList";

const STYLES = {
  TRUE:       { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  FALSE:      { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",   badge: "bg-red-100 text-red-700" },
  MISLEADING: { bg: "bg-orange-50", border: "border-orange-200",text: "text-orange-700",badge: "bg-orange-100 text-orange-700" },
  UNVERIFIED: { bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-700",  badge: "bg-gray-100 text-gray-700" },
};

const EMOJI = {
  TRUE: "✅",
  FALSE: "❌",
  MISLEADING: "⚠️",
  UNVERIFIED: "🔍",
};

export default function VerdictCard({ claim, verdict, explanation, confidence, sources, language }) {
  const style = STYLES[verdict] || STYLES.UNVERIFIED;

  return (
    <div className={`rounded-2xl border-2 p-5 ${style.bg} ${style.border}`}>

      {/* Verdict badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${style.badge}`}>
          {EMOJI[verdict]} {verdict}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white bg-opacity-60 ${style.text}`}>
          Confidence: {confidence}
        </span>
      </div>

      {/* Claim */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Claim</p>
      <p className="text-gray-600 text-sm mb-4 italic leading-relaxed">"{claim}"</p>

      {/* Explanation */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Explanation</p>
      <p className={`text-base font-semibold ${style.text} mb-4 leading-relaxed`}>
        {explanation}
      </p>

      {/* Audio + Sources */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <AudioPlayer text={explanation} language={language} />
        <SourceList sources={sources} />
      </div>

    </div>
  );
}