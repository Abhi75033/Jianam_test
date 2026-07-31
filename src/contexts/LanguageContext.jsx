import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "@/locales/en";
import hi from "@/locales/hi";
import gu from "@/locales/gu";

const LanguageContext = createContext(null);
const STORAGE_KEY = "jinanam_language";

const DICTIONARIES = {
  en,
  hi,
  gu,
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
];

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && DICTIONARIES[saved]) return saved;
    } catch {}
    return "en";
  });

  const setLanguage = useCallback((langCode) => {
    if (DICTIONARIES[langCode]) {
      setCurrentLanguageState(langCode);
      try {
        localStorage.setItem(STORAGE_KEY, langCode);
      } catch {}
    }
  }, []);

  /**
   * t(key)                     -> translated string, falls back to the key itself
   * t(key, "fallback")         -> legacy form, used by the dotted-key call sites
   * t(key, [a, b])             -> interpolates {0}/{1} placeholders
   * t(key, { name: "Anil" })   -> interpolates {name} placeholders
   *
   * Keys are either dotted ("action.save") or the English source string itself.
   * Anything not found in a dictionary is returned unchanged, so runtime values
   * (member names, temple names) pass through safely.
   */
  const t = useCallback(
    (key, arg = "") => {
      if (key == null) return "";
      if (typeof key !== "string") return key;

      const dict = DICTIONARIES[currentLanguage] || DICTIONARIES.en;
      let out = dict[key] || DICTIONARIES.en[key];

      if (out == null) {
        out = typeof arg === "string" && arg ? arg : key;
      }

      if (arg && typeof arg === "object") {
        out = out.replace(/\{(\w+)\}/g, (match, token) => {
          const value = Array.isArray(arg) ? arg[Number(token)] : arg[token];
          return value === undefined || value === null ? match : String(value);
        });
      }

      return out;
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Return fallback context if used outside Provider
    return {
      currentLanguage: "en",
      setLanguage: () => {},
      t: (key, arg) => (typeof arg === "string" && arg ? arg : key),
      languages: SUPPORTED_LANGUAGES,
    };
  }
  return ctx;
}
