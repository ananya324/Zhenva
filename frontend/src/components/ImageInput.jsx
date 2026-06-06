import { useState, useRef } from "react";
import { t } from "../utils/translations";

export default function ImageInput({ onSubmit, loading, language }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  function handleFile(selected) {
    if (!selected) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(selected.type)) {
      alert(t(language, "imageTypeError"));
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert(t(language, "imageSizeError"));
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  function handleClear() {
    setFile(null);
    setPreview(null);
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onClick={() => inputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <span className="text-3xl mb-3">🖼️</span>

          <p className="text-gray-500 text-sm font-medium">
            {t(language, "clickOrDrag")}
          </p>

          <p className="text-gray-300 text-xs mt-1">
            {t(language, "imageFormats")}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-100">
          <img
            src={preview}
            alt="preview"
            className="w-full max-h-64 object-contain bg-gray-50"
          />

          <button
            onClick={handleClear}
            className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-gray-400 hover:text-red-500 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => onSubmit(file)}
          disabled={!file || loading}
          className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
        >
          {loading
            ? t(language, "checking")
            : t(language, "checkNow")}
        </button>
      </div>
    </div>
  );
}