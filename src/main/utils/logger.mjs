import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), 'logs');

export class Logger {
  constructor(context) {
    this.context = context;
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  info(message) {
    this._log('INFO', message);
  }

  error(message) {
    this._log('ERROR', message);
  }

  warn(message) {
    this._log('WARN', message);
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      this._log('DEBUG', message);
    }
  }

  _log(level, message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] [${this.context}] ${message}`;

    console.log(logLine);

    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = join(LOG_DIR, `${date}.log`);
      appendFileSync(logFile, logLine + '\n');
    } catch {}
  }
}
