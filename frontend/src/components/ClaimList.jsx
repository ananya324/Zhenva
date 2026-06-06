import VerdictCard from "./VerdictCard";

export default function ClaimList({ claims, language }) {
  if (!claims || claims.length === 0) return null;

  return (
    <div className="space-y-4">
      {claims.map((item, i) => (
        <VerdictCard
          key={i}
          claim={item.claim}
          verdict={item.verdict}
          explanation={item.explanation}
          confidence={item.confidence}
          sources={item.sources}
          language={language}
        />
      ))}
    </div>
  );
}