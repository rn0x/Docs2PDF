import React from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import './TitleBar.css';

export default function TitleBar({ onSettings, onMinimize, onClose }) {
  const { t } = useTranslation();

  return (
    <div className="titlebar" style={{ appRegion: 'drag' }}>
      <div className="titlebar-right">
        <div className="titlebar-brand">
          <svg className="titlebar-logo" width="16" height="16" viewBox="0 0 100 100" fill="none">
            <rect x="20" y="15" width="55" height="70" rx="6" fill="var(--accent)"/>
            <path d="M35 35H60M35 47H55M35 59H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="70" cy="65" r="18" fill="var(--success)"/>
            <path d="M62 65L68 71L78 59" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="titlebar-name">{t('app.name')}</span>
        </div>
      </div>

      <div className="titlebar-left">
        <button
          className="titlebar-btn titlebar-settings"
          onClick={onSettings}
          style={{ appRegion: 'no-drag' }}
          aria-label={t('settings.title')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        <button
          className="titlebar-btn"
          onClick={onMinimize}
          style={{ appRegion: 'no-drag' }}
          aria-label="Minimize"
        >
          <svg width="11" height="11" viewBox="0 0 12 12">
            <rect x="2" y="5.5" width="8" height="1" fill="currentColor"/>
          </svg>
        </button>

        <button
          className="titlebar-btn titlebar-close"
          onClick={onClose}
          style={{ appRegion: 'no-drag' }}
          aria-label="Close"
        >
          <svg width="11" height="11" viewBox="0 0 12 12">
            <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
