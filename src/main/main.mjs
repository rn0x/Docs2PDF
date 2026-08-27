import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import { join, extname, basename } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { platform, arch } from 'os';
import { fileURLToPath } from 'url';
import { ConversionQueue } from './services/conversion-queue.mjs';
import { Office2PdfService } from './services/office2pdf.mjs';
import { FilesystemService } from './services/filesystem.mjs';
import { SettingsService } from './services/settings.mjs';
import { Logger } from './utils/logger.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const logger = new Logger('Main');

let mainWindow = null;
let conversionQueue = null;
let office2pdfService = null;
let settingsService = null;

const SUPPORTED_FORMATS = ['.docx', '.xlsx', '.pptx'];

function getConverterPath() {
  const plat = platform();
  const archName = arch();

  let platformDir;
  let binaryName;

  if (plat === 'win32') {
    platformDir = 'win-x64';
    binaryName = 'office2pdf.exe';
  } else if (plat === 'darwin') {
    platformDir = archName === 'arm64' ? 'mac-arm64' : 'mac-x64';
    binaryName = 'office2pdf';
  } else {
    platformDir = archName === 'arm64' ? 'linux-arm64' : 'linux-x64';
    binaryName = 'office2pdf';
  }

  const devPath = join(__dirname, '..', '..', 'vendor', 'office2pdf', 'binaries', platformDir, binaryName);
  const prodPath = join(process.resourcesPath, 'converter', 'binaries', platformDir, binaryName);

  return existsSync(prodPath) ? prodPath : devPath;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 700,
    minWidth: 700,
    minHeight: 700,
    maxWidth: 700,
    maxHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    resizable: false,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: join(__dirname, '..', 'preload', 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: join(__dirname, '..', '..', 'public', 'icon.png')
  });

  let shown = false;
  const showWindow = () => {
    if (!shown && mainWindow && !mainWindow.isDestroyed()) {
      shown = true;
      logger.info('Showing window');
      mainWindow.show();
    }
  };

  mainWindow.once('ready-to-show', showWindow);
  setTimeout(showWindow, 5000);

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  Menu.setApplicationMenu(null);

  const isDev = process.env.ELECTRON_IS_DEV === '1' || (!app.isPackaged && existsSync(join(__dirname, '..', '..', 'dist', 'index.html')));

  if (isDev && process.env.ELECTRON_IS_DEV !== '0') {
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      mainWindow.loadFile(join(__dirname, '..', '..', 'dist', 'index.html'));
    });
  } else {
    mainWindow.loadFile(join(__dirname, '..', '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIPC() {
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow?.close());
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized());

  ipcMain.handle('dialog:selectFiles', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'اختر الملفات',
      filters: [
        { name: 'ملفات المستندات', extensions: ['docx', 'xlsx', 'pptx'] },
        { name: 'Word', extensions: ['docx'] },
        { name: 'Excel', extensions: ['xlsx'] },
        { name: 'PowerPoint', extensions: ['pptx'] }
      ],
      properties: ['openFile', 'multiSelections']
    });

    if (result.canceled) return [];

    return result.filePaths.map(filePath => ({
      path: filePath,
      name: basename(filePath),
      extension: extname(filePath).toLowerCase(),
      format: getFormatLabel(extname(filePath))
    }));
  });

  ipcMain.handle('dialog:selectOutputDir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'اختر مجلد الحفظ',
      properties: ['openDirectory']
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('converter:start', async (event, { files, outputDir, options }) => {
    if (!conversionQueue) return { error: 'Queue not initialized' };

    const jobs = files.map(file => ({
      id: crypto.randomUUID(),
      inputPath: file.path,
      filename: file.name,
      extension: file.extension,
      format: file.format,
      outputPath: null,
      status: 'queued',
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null,
      duration: null
    }));

    conversionQueue.addJobs(jobs, outputDir, options);
    return { queued: jobs.length };
  });

  ipcMain.handle('converter:cancel', async () => {
    if (conversionQueue) {
      conversionQueue.cancel();
    }
    return { cancelled: true };
  });

  ipcMain.handle('converter:retry', async (event, { jobIds }) => {
    if (conversionQueue) {
      conversionQueue.retryJobs(jobIds);
    }
    return { retried: jobIds.length };
  });

  ipcMain.handle('converter:openOutputFolder', async (event, { path: dirPath }) => {
    if (existsSync(dirPath)) {
      await shell.openPath(dirPath);
    }
  });

  ipcMain.handle('converter:openFile', async (event, { path: filePath }) => {
    if (existsSync(filePath)) {
      await shell.openPath(filePath);
    }
  });

  ipcMain.handle('converter:getVersion', () => {
    return office2pdfService?.getVersion() || 'unknown';
  });

  ipcMain.handle('settings:get', () => {
    return settingsService?.getAll() || {};
  });

  ipcMain.handle('settings:set', (event, { key, value }) => {
    settingsService?.set(key, value);
    return { success: true };
  });
}

function getFormatLabel(ext) {
  const labels = {
    '.docx': 'Word',
    '.xlsx': 'Excel',
    '.pptx': 'PowerPoint'
  };
  return labels[ext] || 'Unknown';
}

app.whenReady().then(async () => {
  logger.info('App starting...');

  const converterPath = getConverterPath();
  logger.info(`Converter path: ${converterPath}`);

  office2pdfService = new Office2PdfService(converterPath);
  settingsService = new SettingsService();
  conversionQueue = new ConversionQueue(office2pdfService, settingsService);

  conversionQueue.on('job:started', (job) => {
    mainWindow?.webContents.send('conversion:started', job);
  });

  conversionQueue.on('job:completed', (job) => {
    mainWindow?.webContents.send('conversion:completed', job);
  });

  conversionQueue.on('job:failed', (job) => {
    mainWindow?.webContents.send('conversion:failed', job);
  });

  conversionQueue.on('job:progress', (job) => {
    mainWindow?.webContents.send('conversion:progress', job);
  });

  conversionQueue.on('queue:completed', (summary) => {
    mainWindow?.webContents.send('queue:completed', summary);
  });

  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (conversionQueue) {
    conversionQueue.cancel();
  }
  if (platform() !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (conversionQueue) {
    conversionQueue.cancel();
  }
});
