import { useLanguage } from "./hooks/useLanguage";
import Landing from "./pages/Landing";
import Home from "./pages/Home";

export default function App() {
  const { language, setLanguage, clearLanguage } = useLanguage();

  // no language set → show landing
  if (!language) {
    return <Landing onSelect={setLanguage} />;
  }

  return (
    <Home
      language={language}
      onChangeLanguage={clearLanguage}   // clears localStorage → shows landing again
    />
  );
}