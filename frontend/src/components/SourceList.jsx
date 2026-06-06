export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  // filter out anything that isn't a real URL
  const validSources = sources.filter(
    (url) => typeof url === "string" && url.startsWith("http")
  );

  if (validSources.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Sources
      </p>
      <ul className="space-y-1">
        {validSources.map((url, i) => (
          <li key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline break-all"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}