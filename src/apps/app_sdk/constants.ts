import { DefaultJobOptions } from 'bullmq';

export const JOB_DELAY = 1_000;
export const JOB_LOCK_TTL = 20_000;
export const JOB_CONCURRENCY =
  parseInt(process.env.WAHA_APPS_JOBS_CONCURRENCY) || 50;

function jobRemoveOptions() {
  // in seconds
  const HOUR = 60 * 60;
  const DAY = 24 * HOUR;
  return {
    removeOnComplete: {
      age:
        parseInt(process.env.WAHA_APPS_JOBS_REMOVE_ON_COMPLETE_AGE) || 3 * DAY,
      count:
        parseInt(process.env.WAHA_APPS_JOBS_REMOVE_ON_COMPLETE_COUNT) || 1000,
    },
    removeOnFail: {
      age: parseInt(process.env.WAHA_APPS_JOBS_REMOVE_ON_FAIL_AGE) || 31 * DAY,
      count: parseInt(process.env.WAHA_APPS_JOBS_REMOVE_ON_FAIL_COUNT) || 1000,
    },
  };
}

export const JobRemoveOptions = jobRemoveOptions();

export const ExponentialRetriesJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
};

export const NoRetriesJobOptions: DefaultJobOptions = {
  attempts: 1,
};

export function merge(...args: any[]) {
  return Object.assign({}, ...args);
}
