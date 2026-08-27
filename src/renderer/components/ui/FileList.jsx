import React from 'react';
import { useTranslation } from '../../i18n/index.jsx';
import FileItem from './FileItem.jsx';
import './FileList.css';

export default function FileList({ files, jobs, isConverting, onRemove, onOpenFile }) {
  const { t } = useTranslation();

  if (files.length === 0) return null;

  return (
    <div className="filelist">
      <div className="filelist-header">
        <span className="filelist-count">{files.length} {files.length === 1 ? t('fileList.file') : t('fileList.files')}</span>
      </div>
      <div className="filelist-items">
        {files.map((file, index) => {
          const job = jobs.find(j => j.filename === file.name);
          return (
            <FileItem
              key={file.path}
              file={file}
              job={job}
              index={index}
              isConverting={isConverting}
              onRemove={() => onRemove(file.path)}
              onOpenFile={() => onOpenFile(file.path)}
            />
          );
        })}
      </div>
    </div>
  );
}
