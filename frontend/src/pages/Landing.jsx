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
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF6B00] mb-4 shadow-lg">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Zhenva</h1>
          <p className="text-[#FF6B00] mt-2 font-medium">
            Fact-check anything in seconds
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
          <p className="text-gray-800 text-lg font-bold mb-1 text-center">
            अपनी भाषा चुनें
          </p>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Choose your language
          </p>

          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-orange-100 hover:border-[#FF6B00] hover:bg-orange-50 active:bg-orange-100 transition-all duration-150 cursor-pointer group"
              >
                <span className="text-2xl font-bold text-gray-800 group-hover:text-[#FF6B00]">
                  {lang.native}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-300 text-xs mt-6">
          No account needed · Free to use
        </p>
      </div>
    </div>
  );
}