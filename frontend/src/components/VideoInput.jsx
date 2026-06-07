import { useState } from "react";

const SUPPORTED = ["youtube.com", "youtu.be", "instagram.com", "facebook.com", "fb.watch"];

export default function VideoInput({ onSubmit, loading }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function validate(value) {
    const isSupported = SUPPORTED.some((domain) => value.includes(domain));
    if (!isSupported) {
      setError("Only YouTube, Instagram, and Facebook links are supported.");
      return false;
    }
    setError("");
    return true;
  }

  function handleSubmit() {
    if (!url.trim()) return;
    if (validate(url.trim())) {
      onSubmit(url.trim());
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center bg-orange-50 border-2 border-orange-100 focus-within:border-[#FF6B00] rounded-2xl px-4 py-3 transition-all">
        <span className="text-lg">🔗</span>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) validate(e.target.value);
          }}
          placeholder="Paste YouTube, Instagram, or Facebook link..."
          className="flex-1 text-sm text-gray-700 placeholder-gray-300 focus:outline-none bg-transparent"
        />
        {url && (
          <button
            onClick={() => { setUrl(""); setError(""); }}
            className="text-gray-300 hover:text-gray-500 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      {/* Supported platforms */}
      <div className="flex gap-2 flex-wrap">
        {["YouTube", "Instagram Reels", "Facebook"].map((p) => (
          <span
            key={p}
            className="text-xs px-3 py-1 bg-orange-50 text-[#FF6B00] border border-orange-200 rounded-full font-medium"
          >
            {p}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-300">
        ⏳ Videos may take 20–40 seconds to process
      </p>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!url.trim() || loading}
          className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E05A00] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-sm shadow-orange-200"
        >
          {loading ? "Processing..." : "Check Now"}
        </button>
      </div>
    </div>
  );
}