import { EngineBootstrap } from '@waha/core/abc/EngineBootstrap';
import { GowsSubprocess } from '@waha/core/engines/gows/GowsSubprocess';
import { promises as fs } from 'fs';
import { Logger } from 'pino';

export async function isUnixSocket(socketPath: string): Promise<boolean> {
  try {
    // Get the file stats
    const stats = await fs.lstat(socketPath);
    // Check if the path is a socket
    return stats.isSocket();
  } catch (error) {
    // Handle errors (e.g., file does not exist)
    if (error.code === 'ENOENT') {
      return false; // Path does not exist
    }
    // Re-throw other errors for debugging purposes
    throw error;
  }
}

export interface BootstrapConfig {
  path: string;
  socket: string;
  pprof?: boolean;
}

export class GowsBootstrap implements EngineBootstrap {
  private gows: GowsSubprocess;

  constructor(
    private logger: Logger,
    private config: BootstrapConfig,
  ) {}

  async bootstrap(): Promise<void> {
    if (!this.config.path) {
      this.logger.warn('GOWS path is not set, skipping GOWS initialization.');
      this.logger.warn('Make sure to run GOWS manually.');
      this.checkSocket(this.config.socket);
      return;
    }

    this.gows = new GowsSubprocess(
      this.logger,
      this.config.path,
      this.config.socket,
      this.config.pprof,
    );
    this.gows.start(() => {
      this.logger.info(`GOWS stopped, exiting...`);
      process.kill(process.pid, 'SIGTERM');
    });
    await this.gows.waitWhenReady(10_000);
    await this.checkSocket(this.config.socket);
    return;
  }

  async shutdown(): Promise<void> {
    if (this.gows) {
      await this.gows.stop();
    }
  }

  /**
   * Check the provided path exists and is a socket
   * @param path
   */
  async checkSocket(path: string) {
    if (!(await isUnixSocket(path))) {
      throw new Error(`Invalid socket path: ${path}`);
    }
  }
}
