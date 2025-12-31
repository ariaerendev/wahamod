import { sleep, waitUntil } from '@waha/utils/promiseTimeout';
import { spawn } from 'child_process';
import { Logger } from 'pino';

export class GowsSubprocess {
  private checkIntervalMs: number = 100;
  private readyDelayMs: number = 1_000;
  private readyText = 'gRPC server started!';

  private child: any;
  private ready: boolean = false;

  constructor(
    private logger: Logger,
    readonly path: string,
    readonly socket: string,
    readonly pprof: boolean = false,
  ) {}

  start(onExit: (code: number) => void) {
    this.logger.info('Starting GOWS subprocess...');
    this.logger.debug(`GOWS path '${this.path}', socket: '${this.socket}'...`);

    const args = ['--socket', this.socket];
    if (this.pprof) {
      this.logger.info('Debug mode enabled, adding pprof flags');
      args.push('--pprof');
      args.push('--pprof-port=6060');
      args.push('--pprof-host=0.0.0.0');
    }

    this.child = spawn(this.path, args, {
      detached: true,
    });
    this.logger.debug(`GOWS started with PID: ${this.child.pid}`);
    this.child.on('close', async (code, singal) => {
      const msg = code
        ? `GOWS subprocess closed with code ${code}`
        : `GOWS subprocess closed by signal ${singal}`;
      this.logger.debug(msg);
      onExit(code);
    });
    this.child.on('error', (err) => {
      this.logger.error(`GOWS subprocess error: ${err}`);
    });

    this.child.stderr.setEncoding('utf8');
    this.child.stderr.on('data', (data) => {
      this.logger.error(data);
    });

    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', async (data) => {
      // remove empty line at the end, split by \n
      const lines = data.trim().split('\n');
      lines.forEach((line) => this.log(line));
    });
    this.listenReady();
  }

  listenReady() {
    this.child.stdout.on('data', async (data) => {
      if (this.ready) {
        return;
      }
      if (!data.includes(this.readyText)) {
        return;
      }
      await sleep(this.readyDelayMs);
      this.ready = true;
      this.logger.info('GOWS is ready');
    });
  }

  async waitWhenReady(timeout: number) {
    const started = await waitUntil(
      async () => this.ready,
      this.checkIntervalMs,
      timeout,
    );
    if (!started) {
      const msg = 'GOWS did not start after 10 seconds';
      this.logger.error(msg);
      throw new Error(msg);
    }
  }

  async stop() {
    this.logger.info('Stopping GOWS subprocess...');
    this.child?.kill('SIGTERM');
    this.logger.info('GOWS subprocess stopped');
  }

  private log(msg) {
    if (msg.startsWith('ERROR | ')) {
      this.logger.error(msg.slice(8));
    } else if (msg.startsWith('WARN | ')) {
      this.logger.warn(msg.slice(7));
    } else if (msg.startsWith('INFO | ')) {
      this.logger.info(msg.slice(7));
    } else if (msg.startsWith('DEBUG | ')) {
      this.logger.debug(msg.slice(8));
    } else if (msg.startsWith('TRACE | ')) {
      this.logger.trace(msg.slice(8));
    } else {
      this.logger.info(msg);
    }
  }
}
