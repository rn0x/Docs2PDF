import { spawn } from 'child_process';
import { existsSync, statSync, openSync, readSync, closeSync } from 'fs';
import { basename, dirname, join, extname } from 'path';
import { Logger } from '../utils/logger.mjs';

const logger = new Logger('Office2Pdf');

export class Office2PdfService {
  constructor(binaryPath) {
    this.binaryPath = binaryPath;
    this.version = null;
    this.runningProcesses = new Map();
  }

  async getVersion() {
    if (this.version) return this.version;
    try {
      const { execSync } = await import('child_process');
      this.version = execSync(`"${this.binaryPath}" --version`, { encoding: 'utf-8' }).trim();
    } catch {
      this.version = 'unknown';
    }
    return this.version;
  }

  async convert(inputPath, outputDir, options = {}) {
    if (!existsSync(this.binaryPath)) {
      throw new Error(`Converter binary not found: ${this.binaryPath}`);
    }

    if (!existsSync(inputPath)) {
      throw new Error('الملف غير موجود');
    }

    const inputStat = statSync(inputPath);
    if (inputStat.size === 0) {
      throw new Error('الملف فارغ');
    }

    const ext = extname(inputPath).toLowerCase();
    if (!['.docx', '.xlsx', '.pptx'].includes(ext)) {
      throw new Error(`صيغة غير مدعومة: ${ext}\nالصيغ المدعومة: .docx, .xlsx, .pptx`);
    }

    const formatError = this._checkFileFormat(inputPath, ext);
    if (formatError) {
      throw new Error(formatError);
    }

    if (!existsSync(outputDir)) {
      throw new Error(`مجلد الإخراج غير موجود: ${outputDir}`);
    }

    const args = this._buildArgs(inputPath, outputDir, options);
    const expectedOutputName = basename(inputPath).replace(/\.[^/.]+$/, '.pdf');
    const expectedOutputPath = join(outputDir, expectedOutputName);

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      logger.info(`Converting: ${basename(inputPath)}`);
      logger.info(`Command: ${this.binaryPath} ${args.join(' ')}`);

      const proc = spawn(this.binaryPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      const jobId = crypto.randomUUID();
      this.runningProcesses.set(jobId, proc);

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        this.runningProcesses.delete(jobId);
        const duration = Date.now() - startTime;

        logger.info(`Process exited with code ${code}`);
        logger.info(`stdout: ${stdout}`);
        logger.info(`stderr: ${stderr}`);

        if (code !== 0) {
          const errorMsg = this._parseError(stderr, code);
          logger.error(`Conversion failed: ${errorMsg}`);
          reject(new ConversionError(errorMsg, code, stderr));
          return;
        }

        if (!existsSync(expectedOutputPath)) {
          logger.error(`Output PDF not found at: ${expectedOutputPath}`);
          reject(new ConversionError(`Output PDF was not created at: ${expectedOutputPath}`, code, stderr));
          return;
        }

        const pdfStat = statSync(expectedOutputPath);
        if (pdfStat.size === 0) {
          reject(new ConversionError('Output PDF is empty', code, stderr));
          return;
        }

        try {
          this._validatePdf(expectedOutputPath);
        } catch (err) {
          reject(new ConversionError(`Invalid PDF output: ${err.message}`, code, stderr));
          return;
        }

        const warnings = this._parseWarnings(stderr);
        logger.info(`Converted: ${basename(inputPath)} -> ${expectedOutputName} (${duration}ms, ${pdfStat.size} bytes)`);

        resolve({
          pdfPath: expectedOutputPath,
          size: pdfStat.size,
          duration,
          warnings
        });
      });

      proc.on('error', (err) => {
        this.runningProcesses.delete(jobId);
        logger.error(`Process error: ${err.message}`);
        reject(new ConversionError(`Failed to start converter: ${err.message}`, -1, ''));
      });
    });
  }

  cancelAll() {
    for (const [id, proc] of this.runningProcesses) {
      try {
        proc.kill('SIGTERM');
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill('SIGKILL');
          }
        }, 3000);
      } catch (err) {
        logger.error(`Failed to kill process ${id}: ${err.message}`);
      }
    }
    this.runningProcesses.clear();
  }

  _buildArgs(inputPath, outputDir, options) {
    const args = [inputPath, '--outdir', outputDir];

    if (options.paper) {
      args.push('--paper', options.paper);
    }

    if (options.landscape) {
      args.push('--landscape');
    }

    if (options.pdfA) {
      args.push('--pdf-a');
    }

    if (options.tagged) {
      args.push('--tagged');
    }

    if (options.pdfUA) {
      args.push('--pdf-ua');
    }

    if (options.sheets) {
      args.push('--sheets', options.sheets);
    }

    if (options.slides) {
      args.push('--slides', options.slides);
    }

    if (options.fontPath) {
      args.push('--font-path', options.fontPath);
    }

    if (options.streaming) {
      args.push('--streaming');
    }

    return args;
  }

  _validatePdf(pdfPath) {
    const buffer = Buffer.alloc(5);
    const fd = openSync(pdfPath, 'r');
    try {
      readSync(fd, buffer, 0, 5, 0);
      const header = buffer.toString('ascii', 0, 5);
      if (!header.startsWith('%PDF')) {
        throw new Error('Invalid PDF signature');
      }
    } finally {
      closeSync(fd);
    }
  }

  _checkFileFormat(filePath, ext) {
    try {
      const buffer = Buffer.alloc(8);
      const fd = openSync(filePath, 'r');
      try {
        readSync(fd, buffer, 0, 8, 0);
      } finally {
        closeSync(fd);
      }

      const signature = buffer.toString('hex', 0, 8);

      const OOXML_SIGNATURES = [
        '504b0304',
        '504b0506',
        '504b0607'
      ];

      const OLE2_SIGNATURES = [
        'd0cf11e0a1b11ae1'
      ];

      const ZIP_SIGNATURE = OOXML_SIGNATURES.some(s => signature.startsWith(s));
      const OLE2_SIGNATURE = OLE2_SIGNATURES.some(s => signature.startsWith(s));

      if (OLE2_SIGNATURE) {
        const formatName = {
          '.docx': 'Word',
          '.xlsx': 'Excel',
          '.pptx': 'PowerPoint'
        }[ext] || 'Office';

        return `الملف بصيغة قديمة (${formatName} 97-2003) وليس OOXML.\n\nالصيغة المدعومة فقط: ${ext.replace('.', '').toUpperCase()} (2007+)\n\nلتحويل هذا الملف:\n• افتحه في Microsoft Word\n• اختر "حفظ باسم" → اختر ${ext.replace('.', '').toUpperCase()}\n• ثم حاول التحويل مرة أخرى`;
      }

      if (!ZIP_SIGNATURE && !ext.match(/\.docx|\.xlsx|\.pptx/)) {
        return `الملف ليس بصيغة OOXML صحيحة.\nالامتداد: ${ext} لكن المحتوى لا يتطابق.`;
      }

      return null;
    } catch {
      return null;
    }
  }

  _parseError(stderr, code) {
    if (code === null || code === undefined) {
      return 'تم إيقاف التحويل';
    }

    const lowerStderr = stderr.toLowerCase();

    if (lowerStderr.includes('encrypted') || lowerStderr.includes('password-protected')) {
      return 'الملف محمي بكلمة مرور.\nلا يمكن تحويل الملفات المحمية.';
    }

    if (lowerStderr.includes('corrupt') || lowerStderr.includes('invalid')) {
      return 'الملف تالف أو غير صالح.';
    }

    if (lowerStderr.includes('failed to read from zip') || lowerStderr.includes('parse error')) {
      return 'الملف تالف أو ليس بصيغة OOXML صحيحة.\nتأكد من أن الملف ليس قديماً (.doc) وأنه لم يُتلف.';
    }

    const lines = stderr.split('\n').filter(l => l.trim());
    const errorLine = lines.find(l => l.includes('Error') || l.includes('error') || l.includes('Failed'));
    if (errorLine) {
      const cleanError = errorLine
        .replace(/^Error:\s*/i, '')
        .replace(/^Failed:\s*"[^"]*":\s*/i, '')
        .replace(/^Converting\s+"[^"]*":\s*/i, '')
        .replace(/^parse error:\s*/i, '')
        .trim();
      return cleanError || errorLine.trim();
    }

    if (lines.length > 0) return lines[lines.length - 1].trim();
    return `خطأ في التحويل (رمز: ${code})`;
  }

  _parseWarnings(stderr) {
    const warnings = [];
    const lines = stderr.split('\n');
    for (const line of lines) {
      if (line.includes('Warning:')) {
        warnings.push(line.replace('Warning:', '').trim());
      }
    }
    return warnings;
  }
}

export class ConversionError extends Error {
  constructor(message, exitCode, stderr) {
    super(message);
    this.name = 'ConversionError';
    this.exitCode = exitCode;
    this.stderr = stderr;
  }
}
