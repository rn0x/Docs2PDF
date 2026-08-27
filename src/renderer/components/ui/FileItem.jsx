import React, { useState } from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import './FileItem.css';

export default function FileItem({ file, job, index, isConverting, onRemove, onOpenFile }) {
  const [showError, setShowError] = useState(false);
  const { t } = useTranslation();
  const status = job?.status || 'queued';
  const formatIcon = getFormatIcon(file.extension);
  const formatColor = getFormatColor(file.extension);

  return (
    <div className={`file-item file-item-${status}`}>
      <div className="file-item-icon" style={{ color: formatColor }}>
        {formatIcon}
      </div>

      <div className="file-item-info">
        <div className="file-item-name" title={file.name}>
          {file.name}
        </div>
        <div className="file-item-meta">
          <span className="file-item-format" style={{ color: formatColor }}>
            {file.format}
          </span>
          {file.size && (
            <span className="file-item-size">
              {formatSize(file.size)}
            </span>
          )}
        </div>
      </div>

      <div className="file-item-status">
        <StatusBadge t={t} status={status} error={job?.error} onToggleError={() => setShowError(!showError)} />
      </div>

      <div className="file-item-actions">
        {status === 'completed' && (
          <button
            className="file-item-btn file-item-open"
            onClick={onOpenFile}
            aria-label="Open"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
        )}

        {!isConverting && (
          <button
            className="file-item-btn file-item-remove"
            onClick={onRemove}
            aria-label="Remove"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {showError && job?.error && (
        <div className="file-item-error">
          <span className="file-item-error-text">{job.error}</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ t, status, error, onToggleError }) {
  const configs = {
    queued: { label: t('fileItem.ready'), className: 'status-queued' },
    converting: { label: t('fileItem.converting'), className: 'status-converting' },
    completed: { label: t('fileItem.done'), className: 'status-completed' },
    failed: { label: t('fileItem.failed'), className: 'status-failed', clickable: true },
    cancelled: { label: t('fileItem.cancelled'), className: 'status-cancelled' }
  };

  const config = configs[status] || configs.queued;

  return (
    <span
      className={`status-badge ${config.className} ${config.clickable ? 'status-clickable' : ''}`}
      onClick={config.clickable ? onToggleError : undefined}
      title={error || ''}
    >
      {config.label}
      {config.clickable && <span className="status-info-icon">!</span>}
    </span>
  );
}

function getFormatIcon(ext) {
  const icons = {
    '.docx': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    '.xlsx': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
    '.pptx': (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    )
  };
  return icons[ext] || icons['.docx'];
}

function getFormatColor(ext) {
  const colors = {
    '.docx': '#2b579a',
    '.xlsx': '#217346',
    '.pptx': '#d24726'
  };
  return colors[ext] || '#64748b';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
