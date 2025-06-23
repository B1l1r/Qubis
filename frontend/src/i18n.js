// src/i18n.js
import tr from "./locales/tr.json";
import en from "./locales/en.json";
import { createContext, useContext, useState } from "react";

const translations = { tr, en };

export const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("tr");

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslation = () => useContext(I18nContext);