import React, { useState, useCallback } from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import './DropZone.css';

export default function DropZone({ onFilesAdded, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validExts = ['.docx', '.xlsx', '.pptx'];
    const validFiles = droppedFiles
      .filter(f => validExts.includes(getExtension(f.name)))
      .map(f => ({
        path: f.path,
        name: f.name,
        extension: getExtension(f.name),
        format: getFormatLabel(getExtension(f.name)),
        size: f.size
      }));

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  }, [disabled, onFilesAdded]);

  const handleFileSelect = async () => {
    const selectedFiles = await window.converter.selectFiles();
    if (selectedFiles.length > 0) {
      onFilesAdded(selectedFiles);
    }
  };

  return (
    <div
      className={`dropzone ${isDragging ? 'dropzone-active' : ''} ${disabled ? 'dropzone-disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="dropzone-content">
        <div className="dropzone-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <h2 className="dropzone-title">
          {isDragging ? t('dropzone.dragActiveTitle') : t('dropzone.dragTitle')}
        </h2>

        <p className="dropzone-subtitle">
          {isDragging
            ? t('dropzone.dragActiveSubtitle')
            : t('dropzone.dragSubtitle')
          }
        </p>

        {!isDragging && (
          <button
            className="dropzone-btn"
            onClick={handleFileSelect}
            disabled={disabled}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            {t('dropzone.selectFiles')}
          </button>
        )}

        <div className="dropzone-formats">
          <span className="format-badge">DOCX</span>
          <span className="format-badge">XLSX</span>
          <span className="format-badge">PPTX</span>
        </div>
      </div>
    </div>
  );
}

function getExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.substring(idx).toLowerCase() : '';
}

function getFormatLabel(ext) {
  const labels = { '.docx': 'Word', '.xlsx': 'Excel', '.pptx': 'PowerPoint' };
  return labels[ext] || 'Unknown';
}
