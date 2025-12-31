import { Backoffs, Job } from 'bullmq';
import { FlowJob } from 'bullmq/dist/esm/interfaces';

/**
 * Calculates the delay until the next attempt for a job.
 *
 * @param job The job to calculate the next attempt delay for
 * @returns The delay in milliseconds, or null if there is no next attempt or backoff is not set
 */
export function NextAttemptDelayInMs(job: Job): number | null {
  const attemptsMade = job.attemptsMade + 1;
  const maxAttempts = job.opts?.attempts || 1;
  // If this is the last attempt, return null
  if (attemptsMade >= maxAttempts) {
    return null;
  }
  // Normalize the backoff options
  const backoff = Backoffs.normalize(job.opts.backoff);
  if (!backoff) {
    return null;
  }
  // Calculate the delay using Backoffs.calculate
  const delay = Backoffs.calculate(backoff, attemptsMade, new Error(), job);
  // The delay can be a Promise, a number, or undefined
  if (delay === undefined) {
    return null;
  }
  // If it's a Promise, we can't handle it synchronously, so return null
  if (delay instanceof Promise) {
    return null;
  }
  return delay;
}

export function NextAttemptDelayInWholeSeconds(job: Job) {
  const delay = NextAttemptDelayInMs(job);
  if (delay == null) {
    return null;
  }
  return Math.round(delay / 1000);
}

/**
 * Checks if a job has been retried (not on its first attempt).
 *
 * @param job The job to check
 * @returns True if the job has been retried (attemptsMade > 1), false otherwise
 */
export function HasBeenRetried(job: Job): boolean {
  const attemptsMade = job.attemptsMade + 1;
  return attemptsMade > 1;
}

/**
 * Hide chatwoot and waha from queue name for user faced messages
 */
export function QueueNameRepr(name: string): string {
  // No "chatwoot" in the name always (it start with chatwoot)
  name = name.replace('chatwoot.', '');
  // Replace "waha" with "whatsapp"
  name = name.replace('waha |', 'whatsapp |');
  return name;
}

let base =
  process.env.WAHA_PUBLIC_URL ||
  process.env.WAHA_BASE_URL ||
  'http://localhost:3000';
// cut / at the end
base = base.replace(/\/+$/, '');

export function JobLink(job: Job): { text: string; url: string } {
  // Use repr name for text
  const name = QueueNameRepr(job.queueName);
  const text = `${name} => ${job.id}`;
  // Use original queue name in the URL
  const queue = encodeURIComponent(job.queueName);
  const id = encodeURIComponent(job.id);
  const url = `${base}/jobs/queue/${queue}/${id}`;
  return { text: text, url: url };
}

/**
 * Chain jobs so that they run one at a time
 * A | B | C
 * to
 * A -> B -> C
 */
export function ChainJobsOneAtATime(jobs: FlowJob[]): FlowJob {
  if (jobs.length == 0) {
    throw new Error('No jobs provided');
  }

  for (const job of jobs) {
    if (job.children.length != 0) {
      throw new Error('Jobs with children are not supported');
    }
  }
  const left = [...jobs];
  const root = left.pop();
  let parent = root;
  while (left.length != 0) {
    const job = left.pop();
    parent.children = [job];
    parent = job;
  }
  return root;
}
