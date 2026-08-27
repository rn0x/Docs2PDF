import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import TitleBar from '../components/layout/TitleBar.jsx';
import DropZone from '../components/ui/DropZone.jsx';
import FileList from '../components/ui/FileList.jsx';
import ActionBar from '../components/ui/ActionBar.jsx';
import Summary from '../components/ui/Summary.jsx';
import SplashScreen from '../components/ui/SplashScreen.jsx';
import LanguageOnboarding from '../components/ui/LanguageOnboarding.jsx';
import SettingsPanel from '../features/settings/SettingsPanel.jsx';
import Toast from '../components/ui/Toast.jsx';

export default function App() {
  const { t, needsOnboarding } = useTranslation();
  const [theme, setTheme] = useState('system');
  const [files, setFiles] = useState([]);
  const [outputDir, setOutputDir] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const [failedJobs, setFailedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettingsState] = useState({
    duplicateHandling: 'rename',
    maxConcurrency: 1,
    openOutputAfterConversion: true,
    keepFileListAfterConversion: false,
    paper: '',
    landscape: false,
    pdfA: false
  });

  const failedJobsAccumulator = useRef([]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    loadSettings();
    return () => {
      window.converter?.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (!window.converter) return;

    window.converter.onJobStarted((job) => {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'converting' } : j));
    });

    window.converter.onJobCompleted((job) => {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', outputPath: job.outputPath } : j));
    });

    window.converter.onJobFailed((job) => {
      failedJobsAccumulator.current.push({ filename: job.filename, error: job.error });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'failed', error: job.error } : j));
    });

    window.converter.onQueueCompleted((result) => {
      setIsConverting(false);
      setFailedJobs([...failedJobsAccumulator.current]);
      setSummary(result);
    });

    return () => {
      window.converter?.removeAllListeners();
    };
  }, []);

  const applyTheme = (t) => {
    if (t === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
  };

  const loadSettings = async () => {
    const startTime = Date.now();
    const minDuration = 300;
    try {
      const saved = await window.settings.get();
      if (saved) {
        setSettingsState(prev => ({ ...prev, ...saved }));
        if (saved.theme) setTheme(saved.theme);
        if (saved.outputDir) setOutputDir(saved.outputDir);
      }
    } catch {}
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);
    setTimeout(() => setIsLoading(false), remaining);
  };

  const handleFilesAdded = useCallback((newFiles) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.path));
      const unique = newFiles.filter(f => !existing.has(f.path));
      return [...prev, ...unique];
    });
    setSummary(null);
    setFailedJobs([]);
    failedJobsAccumulator.current = [];

    if (!outputDir && newFiles.length > 0) {
      const firstFileDir = newFiles[0].path.substring(0, newFiles[0].path.lastIndexOf('/'));
      if (firstFileDir) {
        setOutputDir(firstFileDir);
      }
    }
  }, [outputDir]);

  const handleRemoveFile = useCallback((path) => {
    setFiles(prev => prev.filter(f => f.path !== path));
  }, []);

  const handleClearFiles = useCallback(() => {
    setFiles([]);
    setJobs([]);
    setSummary(null);
    setFailedJobs([]);
    failedJobsAccumulator.current = [];
  }, []);

  const handleSelectOutputDir = async () => {
    const dir = await window.converter.selectOutputDir();
    if (dir) {
      setOutputDir(dir);
      window.settings.set('outputDir', dir);
    }
  };

  const handleStartConversion = async () => {
    if (files.length === 0) return;
    if (!outputDir) {
      showToast(t('errors.selectOutputDir'), 'warning');
      return;
    }

    setSummary(null);
    setFailedJobs([]);
    failedJobsAccumulator.current = [];

    const result = await window.converter.start({
      files,
      outputDir,
      options: {
        concurrency: settings.maxConcurrency,
        paper: settings.paper || undefined,
        landscape: settings.landscape,
        pdfA: settings.pdfA
      }
    });

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    setJobs(files.map((f, i) => ({
      id: crypto.randomUUID(),
      filename: f.name,
      format: f.format,
      status: 'queued',
      error: null
    })));
    setIsConverting(true);
  };

  const handleCancel = async () => {
    await window.converter.cancel();
    setIsConverting(false);
    showToast(t('toast.cancelled'), 'info');
  };

  const handleRetry = async () => {
    const failedIds = jobs.filter(j => j.status === 'failed').map(j => j.id);
    if (failedIds.length === 0) return;

    setSummary(null);
    setFailedJobs([]);
    failedJobsAccumulator.current = [];
    await window.converter.retry(failedIds);
    setIsConverting(true);
  };

  const handleOpenOutput = () => {
    if (outputDir) {
      window.converter.openOutputFolder(outputDir);
    }
  };

  const handleOpenFile = (path) => {
    window.converter.openFile(path);
  };

  const handleSettingChange = (key, value) => {
    setSettingsState(prev => ({ ...prev, [key]: value }));
    window.settings.set(key, value);
    if (key === 'theme') setTheme(value);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hasFailed = failedJobs.length > 0;
  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const failedCount = failedJobs.length;
  const allJobs = jobs;

  return (
    <div className="app-container">
      {needsOnboarding ? (
        <LanguageOnboarding />
      ) : isLoading ? (
        <SplashScreen />
      ) : (
        <div className="app-content-fade">
          <TitleBar
            onSettings={() => setShowSettings(!showSettings)}
            onMinimize={() => windowControls.minimize()}
            onClose={() => windowControls.close()}
          />

          <div className="main-content">
            {showSettings ? (
              <SettingsPanel
                settings={settings}
                onSettingChange={handleSettingChange}
                onClose={() => setShowSettings(false)}
              />
            ) : summary ? (
              <Summary
                summary={summary}
                outputDir={outputDir}
                hasFailed={hasFailed}
                completedCount={completedCount}
                failedCount={failedCount}
                failedJobs={failedJobs}
                allJobs={allJobs}
                onOpenOutput={handleOpenOutput}
                onRetry={handleRetry}
                onNewConversion={handleClearFiles}
              />
            ) : (
              <>
                <DropZone onFilesAdded={handleFilesAdded} disabled={isConverting} />

                {files.length > 0 && (
                  <>
                    <FileList
                      files={files}
                      jobs={jobs}
                      isConverting={isConverting}
                      onRemove={handleRemoveFile}
                      onOpenFile={handleOpenFile}
                    />

                    <ActionBar
                      files={files}
                      outputDir={outputDir}
                      isConverting={isConverting}
                      onSelectOutputDir={handleSelectOutputDir}
                      onStart={handleStartConversion}
                      onCancel={handleCancel}
                      onClear={handleClearFiles}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
