import * as util from 'node:util';

export class JobDetailedError extends Error {
  originalError: unknown;

  constructor(err: unknown) {
    const inspected = util.inspect(err, {
      showHidden: false,
      depth: 2,
      colors: false,
    });
    super(inspected);
    this.name = 'JobDetailedError';
    this.originalError = err;

    // Ensure the stack trace is captured properly
    if (err instanceof Error && err.stack) {
      this.stack = `${this.name}:\n${inspected}`;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
