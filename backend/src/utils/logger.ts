/**
 * @fileoverview Logger Utility
 * @module utils/logger
 * @version 1.0.0
 */

interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

class Logger {
  private log(level: keyof LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (LOG_LEVELS[level] <= currentLevel) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        level,
        message,
        timestamp,
        ...meta
      };
      
      if (level === 'ERROR') {
        console.error(`[${timestamp}] [${level}]`, message, meta || '');
      } else if (level === 'WARN') {
        console.warn(`[${timestamp}] [${level}]`, message, meta || '');
      } else {
        console.log(`[${timestamp}] [${level}]`, message, meta || '');
      }
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('ERROR', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('WARN', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('INFO', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('DEBUG', message, meta);
  }
}

export const logger = new Logger();
