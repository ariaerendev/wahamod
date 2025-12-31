import { JOB_DELAY, JOB_LOCK_TTL } from '@waha/apps/app_sdk/constants';
import { JobLoggerWrapper } from '@waha/apps/app_sdk/JobLoggerWrapper';
import { RMutexService } from '@waha/modules/rmutex/rmutex.service';
import { BaseWorkerHost } from '@waha/utils/bull/BaseWorkerHost';
import { Job } from 'bullmq';
import { DelayedError } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { Logger } from 'pino';

export interface JobDataTimeout {
  timeout?: {
    job?: number;
  };
}

/**
 * Base class for app consumers that provides common functionality
 * like mutex locking, logging setup, and error handling.
 */
export abstract class AppConsumer extends BaseWorkerHost {
  protected readonly logger: Logger;

  constructor(
    appName: string,
    componentName: string,
    log: PinoLogger,
    protected readonly rmutex: RMutexService,
  ) {
    super();
    this.logger = log.logger.child({
      app: appName,
      component: componentName,
    });
  }

  protected signal(job) {
    if (job.data?.timeout?.job != null) {
      return AbortSignal.timeout(job.data?.timeout?.job);
    }
    // Aka never abort
    return new AbortController().signal;
  }

  /**
   * Executes a job with mutex locking to ensure only one job processes a specific resource at a time.
   * @param job The job to process
   * @param mutexKey The key to use for mutex locking
   * @param processor The function that processes the job
   * @returns The result of the processor function
   */
  protected async withMutex<T, R>(
    job: Job<T, R, any>,
    mutexKey: string,
    processor: () => Promise<R>,
  ): Promise<R> {
    const mutex = this.rmutex.get(mutexKey, JOB_LOCK_TTL);
    const lock = await mutex.lock();

    if (!lock) {
      const logger = new JobLoggerWrapper(job, this.logger);
      logger.debug(
        `Postponing job '${job.id}' for ${JOB_DELAY}ms, another job is already running the mutex.key='${mutexKey}'`,
      );
      await job.moveToDelayed(Date.now() + JOB_DELAY);
      throw new DelayedError();
    }

    try {
      return await processor();
    } finally {
      await lock.release();
    }
  }
}
