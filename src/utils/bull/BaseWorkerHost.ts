import { WorkerHost } from '@nestjs/bullmq';
import { JobDetailedError } from '@waha/utils/bull/JobDetailedError';
import { DelayedError, Job } from 'bullmq';

export abstract class BaseWorkerHost extends WorkerHost {
  async process(job: Job, token?: string): Promise<any> {
    try {
      return await this.processJob(job);
    } catch (err) {
      // pass DelayedError as is
      if (err instanceof DelayedError) {
        throw err;
      }
      throw new JobDetailedError(err);
    }
  }

  abstract processJob(job: Job, token?: string): Promise<any>;
}
