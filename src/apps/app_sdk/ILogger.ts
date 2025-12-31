export interface ILogger {
  fatal(log: string): void;
  error(log: string): void;
  warn(log: string): void;
  info(log: string): void;
  debug(log: string): void;
  trace(log: string): void;
}
