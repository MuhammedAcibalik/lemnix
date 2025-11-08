/**
 * @fileoverview Enterprise Structured Logger
 * @module Logger
 * @version 2.0.0 - Enterprise Compliance
 */

export interface LogContext {
  readonly [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error | unknown, context?: LogContext): void;
}

/**
 * Structured Console Logger
 * Format: [LEVEL] [TIMESTAMP] [CONTEXT] message { data }
 */
export class ConsoleLogger implements ILogger {
  constructor(private readonly verbose: boolean = false) {}

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${level}] [${timestamp}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.verbose) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };
    console.error(this.formatMessage('ERROR', message, errorContext));
  }
}

export class NoOpLogger implements ILogger {
  debug(_message: string, _context?: LogContext): void {}
  info(_message: string, _context?: LogContext): void {}
  warn(_message: string, _context?: LogContext): void {}
  error(_message: string, _error?: Error | unknown, _context?: LogContext): void {}
}

// Default logger instance - Always verbose for debugging
export const logger = new ConsoleLogger(true);