import { existsSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { Logger } from '../utils/logger.mjs';

const logger = new Logger('Filesystem');

export class FilesystemService {
  static validateFiles(filePaths) {
    const valid = [];
    const invalid = [];

    for (const filePath of filePaths) {
      try {
        if (!existsSync(filePath)) {
          invalid.push({ path: filePath, error: 'الملف غير موجود' });
          continue;
        }

        const stat = statSync(filePath);
        if (!stat.isFile()) {
          invalid.push({ path: filePath, error: 'المسار ليس ملفًا' });
          continue;
        }

        if (stat.size === 0) {
          invalid.push({ path: filePath, error: 'الملف فارغ' });
          continue;
        }

        const ext = extname(filePath).toLowerCase();
        if (!['.docx', '.xlsx', '.pptx'].includes(ext)) {
          invalid.push({ path: filePath, error: `صيغة غير مدعومة: ${ext}` });
          continue;
        }

        valid.push(filePath);
      } catch (err) {
        invalid.push({ path: filePath, error: err.message });
      }
    }

    return { valid, invalid };
  }

  static canWriteToDirectory(dirPath) {
    try {
      if (!existsSync(dirPath)) {
        return { canWrite: false, error: 'المجلد غير موجود' };
      }

      const stat = statSync(dirPath);
      if (!stat.isDirectory()) {
        return { canWrite: false, error: 'المسار ليس مجلدًا' };
      }

      return { canWrite: true };
    } catch (err) {
      return { canWrite: false, error: err.message };
    }
  }

  static getFilesByExtension(dirPath, extensions) {
    try {
      const files = readdirSync(dirPath);
      return files.filter(f => extensions.includes(extname(f).toLowerCase()));
    } catch {
      return [];
    }
  }
}
