import React from 'react';
import { useTranslation, availableLanguages } from '../../i18n/index.jsx';
import './LanguageSelector.css';

export default function LanguageSelector() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="lang-selector">
      <select
        className="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        {availableLanguages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.native}
          </option>
        ))}
      </select>
      <svg className="lang-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}
