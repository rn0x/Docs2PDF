import React from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import LanguageSelector from '../../components/ui/LanguageSelector.jsx';
import './SettingsPanel.css';

export default function SettingsPanel({ settings, onSettingChange, onClose }) {
  const { t } = useTranslation();

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">{t('settings.title')}</h2>
        <button className="settings-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.conversion')}</h3>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.duplicateHandling')}</span>
            </div>
            <select
              className="settings-select"
              value={settings.duplicateHandling}
              onChange={(e) => onSettingChange('duplicateHandling', e.target.value)}
            >
              <option value="rename">{t('settings.duplicateRename')}</option>
              <option value="overwrite">{t('settings.duplicateOverwrite')}</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.paperSize')}</span>
            </div>
            <select
              className="settings-select"
              value={settings.paper}
              onChange={(e) => onSettingChange('paper', e.target.value)}
            >
              <option value="">{t('settings.paperDefault')}</option>
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
              <option value="legal">Legal</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.landscape')}</span>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.landscape}
                onChange={(e) => onSettingChange('landscape', e.target.checked)}
              />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">PDF/A</span>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.pdfA}
                onChange={(e) => onSettingChange('pdfA', e.target.checked)}
              />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.performance')}</h3>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.concurrency')}</span>
            </div>
            <select
              className="settings-select"
              value={settings.maxConcurrency}
              onChange={(e) => onSettingChange('maxConcurrency', parseInt(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.appearance')}</h3>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.theme')}</span>
            </div>
            <select
              className="settings-select"
              value={settings.theme}
              onChange={(e) => onSettingChange('theme', e.target.value)}
            >
              <option value="system">{t('settings.themeSystem')}</option>
              <option value="light">{t('settings.themeLight')}</option>
              <option value="dark">{t('settings.themeDark')}</option>
            </select>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.language')}</span>
            </div>
            <LanguageSelector />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.general')}</h3>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-label">{t('settings.autoOpenOutput')}</span>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.openOutputAfterConversion}
                onChange={(e) => onSettingChange('openOutputAfterConversion', e.target.checked)}
              />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('settings.about')}</h3>

          <div className="settings-about">
            <div className="settings-about-logo">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
                <rect x="20" y="15" width="55" height="70" rx="6" fill="var(--accent)"/>
                <path d="M35 35H60M35 47H55M35 59H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="70" cy="65" r="18" fill="var(--success)"/>
                <path d="M62 65L68 71L78 59" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="settings-about-info">
              <span className="settings-about-name">Docs2PDF</span>
              <span className="settings-about-desc">{t('about.description')}</span>
              <div className="settings-about-links">
                <span>{t('settings.developer')}: <strong>{t('about.developer')}</strong></span>
                <span>{t('settings.version')}: <strong>1.0.0</strong></span>
                <span>{t('settings.license')}: <strong>{t('about.license')}</strong></span>
              </div>
            </div>
          </div>

          <div className="settings-about-credit">
            <span>{t('about.poweredBy')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
