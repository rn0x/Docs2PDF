import React from 'react';
import { useTranslation, availableLanguages } from '../../i18n/index.jsx';
import './LanguageOnboarding.css';

export default function LanguageOnboarding() {
  const { setLang, t } = useTranslation();

  return (
    <div className="onboarding">
      <div className="onboarding-titlebar">
        <div className="onboarding-brand">
          <svg width="14" height="14" viewBox="0 0 100 100" fill="none">
            <rect x="20" y="15" width="55" height="70" rx="6" fill="var(--accent)"/>
            <path d="M35 35H60M35 47H55M35 59H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="70" cy="65" r="18" fill="var(--success)"/>
            <path d="M62 65L68 71L78 59" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="onboarding-brand-name">Docs2PDF</span>
        </div>
        <div className="onboarding-titlebar-btns">
          <button className="onboarding-titlebar-btn" onClick={() => windowControls.minimize()}>
            <svg width="11" height="11" viewBox="0 0 12 12">
              <rect x="2" y="5.5" width="8" height="1" fill="currentColor"/>
            </svg>
          </button>
          <button className="onboarding-titlebar-btn onboarding-close" onClick={() => windowControls.close()}>
            <svg width="11" height="11" viewBox="0 0 12 12">
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="onboarding-content">
        <div className="onboarding-logo">
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none">
            <rect x="20" y="15" width="55" height="70" rx="6" fill="var(--accent)"/>
            <path d="M35 35H60M35 47H55M35 59H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="70" cy="65" r="18" fill="var(--success)"/>
            <path d="M62 65L68 71L78 59" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="onboarding-title">{t('app.name')}</h1>
        <p className="onboarding-subtitle">{t('onboarding.subtitle')}</p>

        <div className="onboarding-langs">
          {availableLanguages.map((l) => (
            <button
              key={l.code}
              className="onboarding-lang-btn"
              onClick={() => setLang(l.code)}
            >
              <span className="onboarding-lang-flag">{l.flag}</span>
              <div className="onboarding-lang-info">
                <span className="onboarding-lang-native">{l.native}</span>
                <span className="onboarding-lang-name">{l.name}</span>
              </div>
              <svg className="onboarding-lang-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
