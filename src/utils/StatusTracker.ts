import { WAHASessionStatus } from '../structures/enums.dto';

const STUCK_IN_STARTING_THRESHOLD = 60;

/**
 * Keeps track of session statuses (with timestamps) for the last `trackPeriodMs` milliseconds.
 */
export class StatusTracker {
  private numberOfStarting: number = 0;

  public track(status: WAHASessionStatus): void {
    if (status == WAHASessionStatus.STARTING) {
      this.numberOfStarting += 1;
    } else {
      this.numberOfStarting = 0;
    }
  }

  /**
   * Checks if the session has been continuously 'STARTING'
   */
  public isStuckInStarting(): boolean {
    return this.numberOfStarting >= STUCK_IN_STARTING_THRESHOLD;
  }
}
