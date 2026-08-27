import React, { useState } from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import './Summary.css';

export default function Summary({ summary, outputDir, hasFailed, completedCount, failedCount, failedJobs, allJobs, onOpenOutput, onRetry, onNewConversion }) {
  const [showAllFiles, setShowAllFiles] = useState(false);
  const { t } = useTranslation();

  const completedFiles = allJobs.filter(j => j.status === 'completed');

  return (
    <div className="summary">
      <div className="summary-icon">
        {failedCount === 0 ? (
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        ) : (
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        )}
      </div>

      <h2 className="summary-title">
        {failedCount === 0 ? t('summary.successTitle') : hasFailed && completedCount === 0 ? t('summary.failedTitle') : t('summary.partialTitle')}
      </h2>

      <div className="summary-stats">
        {completedCount > 0 && (
          <div className="summary-stat summary-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>{completedCount} {t('summary.successCount')}</span>
          </div>
        )}

        {failedCount > 0 && (
          <div className="summary-stat summary-fail">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{failedCount} {t('summary.failedCount')}</span>
          </div>
        )}
      </div>

      <div className="summary-files">
        <button 
          className="summary-files-toggle"
          onClick={() => setShowAllFiles(!showAllFiles)}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
            style={{ transform: showAllFiles ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          {t('summary.showAllFiles')} ({completedCount + failedCount})
        </button>
        
        {showAllFiles && (
          <div className="summary-files-list">
            {completedFiles.map((job, i) => (
              <div key={`ok-${i}`} className="summary-file-item summary-file-ok">
                <div className="summary-file-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="summary-file-info">
                  <span className="summary-file-name">{job.filename}</span>
                  <span className="summary-file-status summary-status-ok">{t('summary.conversionSuccess')}</span>
                </div>
              </div>
            ))}
            {failedJobs.map((job, i) => (
              <div key={`fail-${i}`} className="summary-file-item summary-file-fail">
                <div className="summary-file-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className="summary-file-info">
                  <span className="summary-file-name">{job.filename}</span>
                  <span className="summary-file-status summary-status-fail">{job.error}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="summary-actions">
        {outputDir && (
          <button className="summary-btn summary-btn-primary" onClick={onOpenOutput}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            {t('summary.openOutputFolder')}
          </button>
        )}

        {hasFailed && (
          <button className="summary-btn summary-btn-retry" onClick={onRetry}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {t('summary.retryFailed')}
          </button>
        )}

        <button className="summary-btn summary-btn-secondary" onClick={onNewConversion}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {t('summary.convertNew')}
        </button>
      </div>
    </div>
  );
}
