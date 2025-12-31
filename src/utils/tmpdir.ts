import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Logger } from 'pino';

function sanitize(input: string) {
  return input.replace(/[^a-zA-Z0-9-_]/g, '_');
}

export class TmpDir {
  private readonly prefix: string;
  constructor(
    private logger: Logger,
    prefix: string,
    private cleanupTimeout = 10_000,
  ) {
    this.prefix = sanitize(prefix);
    if (this.prefix.length > 249) {
      this.prefix = this.prefix.slice(0, 249);
    }
  }

  /**
   * Creates a temporary directory and passes it to the callback.
   * The directory is automatically cleaned up after the callback returns.
   * @param callback Function that receives the temporary directory path
   * @returns The result of the callback
   */
  public async use<T>(callback: (dir: string) => Promise<T>): Promise<T> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), this.prefix));
    try {
      return await callback(dir);
    } finally {
      setTimeout(async () => {
        fs.rm(dir, { recursive: true, force: true })
          .then(() => {
            this.logger.trace(`Cleaned up temporary directory '${dir}'`);
          })
          .catch((err) => {
            this.logger.warn(
              `Failed to clean up temporary directory '${dir}': ${err.message}`,
            );
          });
      }, this.cleanupTimeout);
    }
  }
}
