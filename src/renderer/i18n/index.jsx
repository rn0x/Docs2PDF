import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const localeFiles = import.meta.glob('./locales/*.json', { eager: true });

const translations = {};
const availableLanguages = [];

for (const [path, mod] of Object.entries(localeFiles)) {
  const match = path.match(/\/([^/]+)\.json$/);
  if (match) {
    const code = match[1];
    const data = mod.default || mod;
    translations[code] = data;
    if (data.meta) {
      availableLanguages.push({ code, ...data.meta });
    }
  }
}

availableLanguages.sort((a, b) => a.code.localeCompare(b.code));

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('fc-lang') || '';
  });

  const [onboardingDone, setOnboardingDone] = useState(() => {
    return localStorage.getItem('fc-lang-done') === 'true';
  });

  useEffect(() => {
    if (lang && translations[lang]?.meta) {
      document.documentElement.lang = lang;
      document.documentElement.dir = translations[lang].meta.dir || 'ltr';
    }
  }, [lang]);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem('fc-lang', newLang);
    localStorage.setItem('fc-lang-done', 'true');
    document.documentElement.lang = newLang;
    const meta = translations[newLang]?.meta;
    document.documentElement.dir = meta?.dir || 'ltr';
    setOnboardingDone(true);
  }, []);

  const t = useCallback((path) => {
    if (!lang || !translations[lang]) return path;
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      result = result?.[key];
    }
    return result || path;
  }, [lang]);

  const needsOnboarding = !lang || !onboardingDone;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, needsOnboarding }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}

export { availableLanguages };
