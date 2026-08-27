import { EventEmitter } from 'events';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Logger } from '../utils/logger.mjs';

const logger = new Logger('ConversionQueue');

export class ConversionQueue extends EventEmitter {
  constructor(converter, settings) {
    super();
    this.converter = converter;
    this.settings = settings;
    this.jobs = new Map();
    this.queue = [];
    this.running = 0;
    this.maxConcurrency = 1;
    this.cancelled = false;
    this.currentOutputDir = null;
    this.currentOptions = {};
  }

  addJobs(jobs, outputDir, options = {}) {
    this.cancelled = false;
    this.currentOutputDir = outputDir;
    this.currentOptions = options;

    if (options.concurrency) {
      this.maxConcurrency = Math.max(1, Math.min(options.concurrency, 8));
    }

    for (const job of jobs) {
      const baseName = job.filename.replace(/\.[^/.]+$/, '');
      job.outputPath = join(outputDir, `${baseName}.pdf`);
      job.status = 'queued';
      this.jobs.set(job.id, job);
      this.queue.push(job.id);
    }

    logger.info(`Added ${jobs.length} jobs to queue`);
    this._processQueue();
  }

  cancel() {
    this.cancelled = true;
    this.converter.cancelAll();

    for (const [id, job] of this.jobs) {
      if (job.status === 'queued' || job.status === 'converting') {
        job.status = 'cancelled';
        this.emit('job:cancelled', job);
      }
    }

    this.queue = [];
    this.running = 0;
    logger.info('Queue cancelled');
  }

  retryJobs(jobIds) {
    const toRetry = [];
    for (const id of jobIds) {
      const job = this.jobs.get(id);
      if (job && (job.status === 'failed' || job.status === 'cancelled')) {
        job.status = 'queued';
        job.error = null;
        job.startedAt = null;
        job.completedAt = null;
        job.duration = null;
        const baseName = job.filename.replace(/\.[^/.]+$/, '');
        job.outputPath = join(this.currentOutputDir, `${baseName}.pdf`);
        this.queue.push(id);
        toRetry.push(id);
      }
    }

    logger.info(`Retrying ${toRetry.length} jobs`);
    if (toRetry.length > 0) {
      this._processQueue();
    }
  }

  getSummary() {
    let succeeded = 0;
    let failed = 0;
    let cancelled = 0;

    for (const job of this.jobs.values()) {
      if (job.status === 'completed') succeeded++;
      else if (job.status === 'failed') failed++;
      else if (job.status === 'cancelled') cancelled++;
    }

    return { succeeded, failed, cancelled, total: this.jobs.size };
  }

  getJobs() {
    return Array.from(this.jobs.values());
  }

  async _processQueue() {
    while (this.running < this.maxConcurrency && this.queue.length > 0 && !this.cancelled) {
      const jobId = this.queue.shift();
      const job = this.jobs.get(jobId);

      if (!job || job.status !== 'queued') continue;

      this.running++;
      this._processJob(job).finally(() => {
        this.running--;
        this._processQueue();
      });
    }

    if (this.queue.length === 0 && this.running === 0 && !this.cancelled) {
      const summary = this.getSummary();
      this.emit('queue:completed', summary);
    }
  }

  async _processJob(job) {
    job.status = 'converting';
    job.startedAt = Date.now();
    this.emit('job:started', job);

    try {
      if (this.cancelled) {
        job.status = 'cancelled';
        job.completedAt = Date.now();
        this.emit('job:cancelled', job);
        return;
      }

      const outputDir = dirname(job.outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const result = await this.converter.convert(
        job.inputPath,
        outputDir,
        this.currentOptions
      );

      if (this.cancelled) {
        job.status = 'cancelled';
        job.completedAt = Date.now();
        this.emit('job:cancelled', job);
        return;
      }

      job.status = 'completed';
      job.completedAt = Date.now();
      job.duration = job.completedAt - job.startedAt;
      job.outputPath = result.pdfPath;
      job.size = result.size;
      job.warnings = result.warnings;

      this.emit('job:completed', job);
      logger.info(`Job completed: ${job.filename} (${job.duration}ms)`);
    } catch (err) {
      if (this.cancelled) {
        job.status = 'cancelled';
        job.completedAt = Date.now();
        this.emit('job:cancelled', job);
        return;
      }

      job.status = 'failed';
      job.completedAt = Date.now();
      job.duration = job.completedAt - job.startedAt;
      job.error = err.message;

      this.emit('job:failed', job);
      logger.error(`Job failed: ${job.filename} - ${err.message}`);
    }
  }
}
