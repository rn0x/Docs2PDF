import React from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import './ActionBar.css';

export default function ActionBar({
  files,
  outputDir,
  isConverting,
  onSelectOutputDir,
  onStart,
  onCancel,
  onClear
}) {
  const { t } = useTranslation();

  return (
    <div className="action-bar">
      <div className="action-bar-output">
        <button className="output-dir-btn" onClick={onSelectOutputDir} disabled={isConverting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="output-dir-label">
            {outputDir ? t('actionBar.selectedDir') : t('actionBar.selectOutputDir')}
          </span>
        </button>
        {outputDir && (
          <span className="output-dir-path" title={outputDir}>
            {outputDir}
          </span>
        )}
      </div>

      <div className="action-bar-actions">
        <button
          className="action-btn action-clear"
          onClick={onClear}
          disabled={isConverting}
        >
          {t('actionBar.clearList')}
        </button>

        {isConverting ? (
          <button className="action-btn action-cancel" onClick={onCancel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            {t('actionBar.cancel')}
          </button>
        ) : (
          <button
            className="action-btn action-convert"
            onClick={onStart}
            disabled={files.length === 0 || !outputDir}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {t('actionBar.convertAll')} ({files.length})
          </button>
        )}
      </div>
    </div>
  );
}
