/**
 * Structured application logger with environment-aware log levels.
 */

import { env } from '../config/env';

export interface LogContext {
  readonly [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error | unknown, context?: LogContext): void;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levelOrder: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const nativeConsole = { ...console };

export class ConsoleLogger implements ILogger {
  constructor(private readonly level: LogLevel) {}

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${level}] [${timestamp}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      nativeConsole.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      nativeConsole.info(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      nativeConsole.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name
          }
          : error
      };
      nativeConsole.error(this.formatMessage('ERROR', message, errorContext));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return levelOrder[level] <= levelOrder[this.level];
  }
}

export class NoOpLogger implements ILogger {
  debug(_message: string, _context?: LogContext): void {}
  info(_message: string, _context?: LogContext): void {}
  warn(_message: string, _context?: LogContext): void {}
  error(_message: string, _error?: Error | unknown, _context?: LogContext): void {}
}

const configuredLevel: LogLevel = ((): LogLevel => {
  switch (env.LOG_LEVEL) {
    case 'error':
    case 'warn':
    case 'info':
      return env.LOG_LEVEL;
    case 'verbose':
      return 'debug';
    default:
      return 'debug';
  }
})();

export const logger = new ConsoleLogger(configuredLevel);

configureConsoleProxy(logger);

function configureConsoleProxy(activeLogger: ILogger): void {
  console.debug = (message?: any, ...optionalParams: any[]) => {
    activeLogger.debug(String(message), optionalParams.length ? { params: optionalParams } : undefined);
  };
  console.info = (message?: any, ...optionalParams: any[]) => {
    activeLogger.info(String(message), optionalParams.length ? { params: optionalParams } : undefined);
  };
  console.warn = (message?: any, ...optionalParams: any[]) => {
    activeLogger.warn(String(message), optionalParams.length ? { params: optionalParams } : undefined);
  };
  console.error = (message?: any, ...optionalParams: any[]) => {
    const error = optionalParams.find(param => param instanceof Error) ?? optionalParams[0];
    activeLogger.error(String(message), error instanceof Error ? error : undefined, optionalParams.length ? { params: optionalParams } : undefined);
  };

}
