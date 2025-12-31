import { OutputConfiguration } from 'commander';

export class BufferedOutput implements OutputConfiguration {
  private outBuffer: string[] = [];
  private errBuffer: string[] = [];

  writeOut = (str: string): void => {
    this.outBuffer.push(str);
  };

  writeErr = (str: string): void => {
    this.errBuffer.push(str);
  };

  outputError = (str: string, write: (s: string) => void) => {
    this.errBuffer.push(str);
  };

  get out() {
    return this.outBuffer.join('');
  }

  get err() {
    return this.errBuffer.join('');
  }
}
