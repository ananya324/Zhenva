import { useState } from "react";
import InputTabs from "../components/InputTabs";
import Loader from "../components/Loader";
import Result from "./Result";
import { checkText, checkImage, checkVideo } from "../services/api";
import { useJobPoller } from "../hooks/useJobPoller";
import { t } from "../utils/translations";

export default function Home({ language, onChangeLanguage }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);

  // polls backend every 3s when jobId is set (video only)
  const { status, result: jobResult, error: jobError } = useJobPoller(jobId);

  // when video job finishes, set result
  if (jobResult && !result) {
    setResult(jobResult);
    setJobId(null);
  }

  async function handleSubmit(type, value) {
    setLoading(true);
    setError(null);
    setResult(null);
    setJobId(null);

    try {
      if (type === "text") {
        const data = await checkText(value, language);
        setResult(data);
      }

      if (type === "image") {
        const data = await checkImage(value, language);
        setResult(data);
      }

      if (type === "video") {
        const data = await checkVideo(value, language);
        setJobId(data.jobId);   // start polling
        setLoading(false);
        return;                 // result comes via poller
      }

    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setJobId(null);
    setLoading(false);
  }

  // ── Show result page ───────────────────────────────────────────────────────
  if (result) {
    return <Result result={result} language={language} onReset={handleReset} />;
  }

  // ── Show video processing state ────────────────────────────────────────────
 if (jobId) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Loader
          language={language}
          messageKey={status === "processing" ? "loaderVideo" : "loaderText"}
        />
        {jobError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600 text-sm">{jobError}</p>
            <button
              onClick={handleReset}
              className="mt-3 text-sm text-blue-500 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

  // ── Main home page ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zhenva</h1>
            <p className="text-gray-400 text-sm">{t(language, "tagline")}</p>
          </div>
          <button
            onClick={onChangeLanguage}
            className="text-xs text-gray-400 hover:text-blue-500 border border-gray-200 rounded-lg px-3 py-1.5 transition-all"
          >
            🌐 {language.charAt(0).toUpperCase() + language.slice(1)}
          </button>
        </div>

        {/* Input */}
        {loading ? (
          <Loader message={t(language, "loaderText")} />
        ) : (
          <InputTabs onSubmit={handleSubmit} loading={loading} language={language} />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-300 text-xs">
          Powered by Groq · Verified by trusted sources
        </p>

      </div>
    </div>
  );
}