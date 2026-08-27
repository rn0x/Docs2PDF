import React from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import './SplashScreen.css';

export default function SplashScreen() {
  const { t } = useTranslation();

  return (
    <div className="splash">
      <div className="splash-content">
        <div className="splash-logo">
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="8" width="55" height="70" rx="6" fill="var(--accent)" opacity="0.15"/>
            <rect x="35" y="22" width="55" height="70" rx="6" fill="var(--accent)" opacity="0.35"/>
            <rect x="20" y="15" width="55" height="70" rx="6" fill="var(--accent)"/>
            <path d="M35 35H60M35 47H55M35 59H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="70" cy="65" r="18" fill="var(--success)"/>
            <path d="M62 65L68 71L78 59" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="splash-title">{t('app.name')}</h1>
        <p className="splash-subtitle">{t('app.subtitle')}</p>

        <div className="splash-loader">
          <div className="splash-loader-bar"></div>
        </div>

        <p className="splash-loading-text">{t('splash.loading')}</p>
      </div>
    </div>
  );
}
