import { useState } from "react";
import { speak, stopSpeaking } from "../utils/speech";
import { t } from "../utils/translations";

export default function AudioPlayer({ text, language }) {
  const [playing, setPlaying] = useState(false);

  function handlePlay() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }

    speak(text, language);
    setPlaying(true);

    // reset button when speech ends
    const interval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setPlaying(false);
        clearInterval(interval);
      }
    }, 500);
  }

  return (
    <button
      onClick={handlePlay}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm transition-all"
    >
      {playing ? (
        <>
          <span className="w-4 h-4 flex items-center justify-center">⏹</span>
          {t(language, "stop")}
        </>
      ) : (
        <>
          <span className="w-4 h-4 flex items-center justify-center">🔊</span>
          {t(language, "listen")}
        </>
      )}
    </button>
  );
}