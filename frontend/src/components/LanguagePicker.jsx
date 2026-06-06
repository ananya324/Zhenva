const LANGUAGES = [
  { code: "english", label: "English", native: "English" },
  { code: "hindi", label: "Hindi", native: "हिंदी" },
  { code: "bengali", label: "Bengali", native: "বাংলা" },
  { code: "tamil", label: "Tamil", native: "தமிழ்" },
  { code: "telugu", label: "Telugu", native: "తెలుగు" },
  { code: "marathi", label: "Marathi", native: "मराठी" },
];

export default function LanguagePicker({ onSelect }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Zhenva</h1>
          <p className="text-gray-500 mt-2 text-lg">Fact-check anything in seconds</p>
        </div>

        {/* Prompt */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <p className="text-gray-700 text-xl font-medium mb-2">
            Choose your language
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Results and audio will be in this language
          </p>

          {/* Language Grid */}
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all duration-150 cursor-pointer group"
              >
                <span className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                  {lang.native}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-xs">
          You can change this anytime from settings
        </p>
      </div>
    </div>
  );
}