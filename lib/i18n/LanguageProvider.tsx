"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Locale } from "./index";
import { defaultLocale, getDictionary } from "./index";
import type { Dictionary } from "./dictionaries/zh-CN";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [dictionary, setDictionary] = useState<Dictionary>(getDictionary(defaultLocale));

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("locale");
    if (stored === "zh-CN" || stored === "en") {
      setLocaleState(stored);
      setDictionary(getDictionary(stored));
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setDictionary(getDictionary(newLocale));
    localStorage.setItem("locale", newLocale);
    
    // Update HTML lang attribute
    document.documentElement.lang = newLocale === "zh-CN" ? "zh-CN" : "en";
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionary }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
