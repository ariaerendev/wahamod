import { ILogger } from '@waha/apps/app_sdk/ILogger';

export function JestLogger(): ILogger {
  return {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };
}
