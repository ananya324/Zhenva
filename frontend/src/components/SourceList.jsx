export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  const validSources = sources.filter(
    (url) => typeof url === "string" && url.startsWith("http")
  );

  if (validSources.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        Sources
      </p>
      <ul className="space-y-1.5">
        {validSources.map((url, i) => (
          <li key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#FF6B00] hover:underline break-all font-medium"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}