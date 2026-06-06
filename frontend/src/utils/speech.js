// speaks text out loud in the user's language using Web Speech API
//The Web Speech API expects language codes, not names.
const LANGUAGE_CODES = {
  english: "en-IN",
  hindi: "hi-IN",
  bengali: "bn-IN",
  tamil: "ta-IN",
  telugu: "te-IN",
  marathi: "mr-IN",
};

export function speak(text, language = "english") {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANGUAGE_CODES[language] || "en-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);   // ← this line was missing
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}

export function isSpeaking() {
  return window.speechSynthesis.speaking;
}