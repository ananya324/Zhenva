import { t } from "../utils/translations";

const LANGUAGES = [
  { code: "english", native: "English", label: "English" },
  { code: "hindi", native: "हिंदी", label: "Hindi" },
  { code: "bengali", native: "বাংলা", label: "Bengali" },
  { code: "tamil", native: "தமிழ்", label: "Tamil" },
  { code: "telugu", native: "తెలుగు", label: "Telugu" },
  { code: "marathi", native: "मराठी", label: "Marathi" },
];

export default function Landing({ onSelect }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Zhenva
          </h1>
          <p className="text-gray-400 mt-3 text-base">
            {/* show in all languages since user hasn't picked yet */}
            Fact-check anything in seconds
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-gray-800 text-lg font-semibold mb-1">
            अपनी भाषा चुनें / Choose your language
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Results and audio will be in this language
          </p>

          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all duration-150 cursor-pointer group"
              >
                <span className="text-2xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {lang.native}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-gray-300 text-xs mt-6">
          No account needed. Free to use.
        </p>
      </div>
    </div>
  );
}