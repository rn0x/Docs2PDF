import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';
import { Logger } from '../utils/logger.mjs';

const logger = new Logger('Settings');

const DEFAULT_SETTINGS = {
  outputDir: '',
  duplicateHandling: 'rename',
  maxConcurrency: 1,
  theme: 'system',
  openOutputAfterConversion: true,
  keepFileListAfterConversion: false,
  paper: '',
  landscape: false,
  pdfA: false
};

export class SettingsService {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.filePath = this._getSettingsPath();
    this._load();
  }

  getAll() {
    return { ...this.settings };
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this._save();
    logger.info(`Setting updated: ${key} = ${value}`);
  }

  _getSettingsPath() {
    try {
      const userDataPath = app.getPath('userData');
      return join(userDataPath, 'settings.json');
    } catch {
      return join(process.cwd(), 'settings.json');
    }
  }

  _load() {
    try {
      if (existsSync(this.filePath)) {
        const data = readFileSync(this.filePath, 'utf-8');
        const saved = JSON.parse(data);
        this.settings = { ...DEFAULT_SETTINGS, ...saved };
        logger.info('Settings loaded');
      }
    } catch (err) {
      logger.error(`Failed to load settings: ${err.message}`);
    }
  }

  _save() {
    try {
      const dir = join(this.filePath, '..');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`Failed to save settings: ${err.message}`);
    }
  }
}
