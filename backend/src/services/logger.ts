/**
 * @fileoverview Simple Logger Interface
 * @module Logger
 */

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error | unknown): void;
}

export class ConsoleLogger implements ILogger {
  constructor(private readonly verbose: boolean = false) {}

  debug(message: string, ...args: unknown[]): void {
    if (this.verbose) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.verbose) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, error?: Error | unknown): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

export class NoOpLogger implements ILogger {
  debug(_message: string, ..._args: unknown[]): void {}
  info(_message: string, ..._args: unknown[]): void {}
  warn(_message: string, ..._args: unknown[]): void {}
  error(_message: string, _error?: Error | unknown): void {}
}
