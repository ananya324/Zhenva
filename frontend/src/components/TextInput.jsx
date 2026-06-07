import { useState } from "react";
import { t } from "../utils/translations";

export default function TextInput({ onSubmit, loading, language }) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (text.trim().length < 10) return;
    onSubmit(text.trim());
  }

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t(language, "textPlaceholder")}
        rows={6}
        className="w-full p-4 rounded-2xl border-2 border-orange-100 focus:border-[#FF6B00] focus:outline-none resize-none text-gray-700 text-sm bg-orange-50 placeholder-gray-300"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">
          {text.length} {t(language, "characters")}
        </span>

        <button
          onClick={handleSubmit}
          disabled={text.trim().length < 10 || loading}
          className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E05A00] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-sm shadow-orange-200"
        >
          {loading ? t(language, "checking") : t(language, "checkNow")}
        </button>
      </div>
    </div>
  );
}