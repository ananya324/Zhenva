import { useState } from "react";
const STORAGE_KEY = "zhenva_language";

export function useLanguage() {
    const [language, setLanguageState] = useState(
        () => localStorage.getItem(STORAGE_KEY) || null
    );

    function setLanguage(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        setLanguageState(lang);
    }

    function clearLanguage() {
        localStorage.removeItem(STORAGE_KEY);
        setLanguageState(null);
    }
    return { language, setLanguage, clearLanguage };


}