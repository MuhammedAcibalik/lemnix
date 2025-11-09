/**
 * LEMNİX Error Handler Middleware
 * Centralized error handling with taxonomy, masking, and monitoring
 */

import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  ErrorClass,
  ErrorSeverity,
  StructuredError,
  ERROR_CODES,
  ERROR_SEVERITY_MAP,
  HTTP_STATUS_MAP,
  RETRY_POLICY_MAP,
  USER_MESSAGES,
  ErrorContext,
} from "../types/errorTypes";
import { ILogger } from "../services/logger";

interface ErrorHandlerOptions {
  logger: ILogger;
  enableStackTrace: boolean;
  enableDetailedErrors: boolean;
  maxErrorRate: number; // errors per minute before throttling
}

export class ErrorHandler {
  private logger: ILogger;
  private enableStackTrace: boolean;
  private enableDetailedErrors: boolean;
  private maxErrorRate: number;
  private errorCounts: Map<string, number> = new Map();
  private lastResetTime: number = Date.now();

  constructor(options: ErrorHandlerOptions) {
    this.logger = options.logger;
    this.enableStackTrace = options.enableStackTrace;
    this.enableDetailedErrors = options.enableDetailedErrors;
    this.maxErrorRate = options.maxErrorRate;
  }

  /**
   * Main error handling middleware
   */
  public handleError = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    try {
      // Generate correlation ID if not present
      const correlationId =
        (req.headers["x-correlation-id"] as string) || uuidv4();

      // Create error context
      const context: ErrorContext = {
        requestId: (req.headers["x-request-id"] as string) || uuidv4(),
        // correlationId,
        timestamp: new Date().toISOString(),
        endpoint: req.path,
        method: req.method,
        userAgent: req.headers["user-agent"],
        ipAddress: this.maskIpAddress(
          req.ip || req.connection.remoteAddress || "unknown",
        ),
      };

      // Classify error
      const errorClass = this.classifyError(error);
      const structuredError = this.createStructuredError(
        error,
        errorClass,
        context,
      );

      // Log error with appropriate level
      this.logError(structuredError, error);

      // Update metrics
      this.updateErrorMetrics(errorClass, structuredError.severity);

      // Send response
      this.sendErrorResponse(res, structuredError);
    } catch (handlerError) {
      // Fallback error handling
      this.logger.error("Error in error handler", {
        originalError: error.message,
        handlerError: (handlerError as Error).message,
      });

      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        correlationId: req.headers["x-correlation-id"] || uuidv4(),
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Classify error into appropriate class
   */
  private classifyError(error: Error): ErrorClass {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Business logic errors
    if (
      errorMessage.includes("optimization") ||
      errorMessage.includes("cutting") ||
      errorMessage.includes("profile") ||
      errorMessage.includes("stock") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("business rule")
    ) {
      return ErrorClass.BUSINESS;
    }

    // Integration errors
    if (
      errorMessage.includes("database") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("api") ||
      errorMessage.includes("external") ||
      errorMessage.includes("third party")
    ) {
      return ErrorClass.INTEGRATION;
    }

    // Client errors
    if (
      errorMessage.includes("validation") ||
      errorMessage.includes("required") ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("missing") ||
      errorMessage.includes("format") ||
      errorName.includes("validation")
    ) {
      return ErrorClass.CLIENT;
    }

    // Default to system error
    return ErrorClass.SYSTEM;
  }

  /**
   * Create structured error response
   */
  private createStructuredError(
    error: Error,
    errorClass: ErrorClass,
    context: ErrorContext,
  ): StructuredError {
    const errorId = uuidv4();
    const severity = ERROR_SEVERITY_MAP[errorClass];
    const code = this.getErrorCode(error, errorClass);
    const userMessage = USER_MESSAGES[errorClass];
    const retryPolicy = RETRY_POLICY_MAP[errorClass];

    return {
      errorId,
      correlationId: context.requestId,
      class: errorClass,
      severity,
      code,
      message: this.sanitizeErrorMessage(error.message),
      userMessage,
      context,
      details: this.extractErrorDetails(error),
      recoverable: this.isRecoverable(errorClass),
      retryAfter: this.getRetryAfter(errorClass),
      retryPolicy,
      timestamp: context.timestamp,
      service: "lemnix-backend",
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  /**
   * Sanitize error message to remove sensitive information
   */
  private sanitizeErrorMessage(message: string): string {
    let sanitized = message;

    // Remove sensitive patterns
    const sensitivePatterns = [
      /password[=:]\s*\w+/gi,
      /token[=:]\s*[\w-]+/gi,
      /secret[=:]\s*\w+/gi,
      /key[=:]\s*[\w-]+/gi,
      /auth[=:]\s*[\w-]+/gi,
      /bearer\s+[\w.-]+/gi,
      /jwt\s+[\w.-]+/gi,
      /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, // Credit card numbers
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
    ];

    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    });

    return sanitized;
  }

  /**
   * Extract error details (sanitized)
   */
  private extractErrorDetails(error: Error): StructuredError["details"] {
    if (!this.enableDetailedErrors) {
      return undefined;
    }

    const details: StructuredError["details"] = {};

    // Extract validation errors
    if (error.message.includes("validation")) {
      const match = error.message.match(/field\s+['"]?(\w+)['"]?/i);
      if (match) {
        details.field = match[1];
      }
    }

    // Extract constraint violations
    if (error.message.includes("constraint")) {
      const match = error.message.match(/constraint\s+['"]?(\w+)['"]?/i);
      if (match) {
        details.constraint = match[1];
      }
    }

    return Object.keys(details).length > 0 ? details : undefined;
  }

  /**
   * Get appropriate error code
   */
  private getErrorCode(error: Error, errorClass: ErrorClass): string {
    // Map common error types to specific codes
    const message = error.message.toLowerCase();

    switch (errorClass) {
      case ErrorClass.CLIENT:
        if (message.includes("validation"))
          return ERROR_CODES.CLIENT.VALIDATION_FAILED;
        if (message.includes("auth"))
          return ERROR_CODES.CLIENT.AUTHENTICATION_REQUIRED;
        if (message.includes("rate limit"))
          return ERROR_CODES.CLIENT.RATE_LIMIT_EXCEEDED;
        return ERROR_CODES.CLIENT.INVALID_REQUEST_FORMAT;

      case ErrorClass.BUSINESS:
        if (message.includes("optimization"))
          return ERROR_CODES.BUSINESS.OPTIMIZATION_FAILED;
        if (message.includes("stock"))
          return ERROR_CODES.BUSINESS.INSUFFICIENT_STOCK;
        if (message.includes("profile"))
          return ERROR_CODES.BUSINESS.PROFILE_NOT_FOUND;
        return ERROR_CODES.BUSINESS.BUSINESS_RULE_VIOLATION;

      case ErrorClass.INTEGRATION:
        if (message.includes("database"))
          return ERROR_CODES.INTEGRATION.DATABASE_CONNECTION_FAILED;
        if (message.includes("timeout"))
          return ERROR_CODES.INTEGRATION.EXTERNAL_API_TIMEOUT;
        return ERROR_CODES.INTEGRATION.EXTERNAL_API_ERROR;

      case ErrorClass.SYSTEM:
        if (message.includes("memory")) return ERROR_CODES.SYSTEM.OUT_OF_MEMORY;
        if (message.includes("unavailable"))
          return ERROR_CODES.SYSTEM.SERVICE_UNAVAILABLE;
        return ERROR_CODES.SYSTEM.INTERNAL_SERVER_ERROR;

      default:
        return ERROR_CODES.SYSTEM.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverable(errorClass: ErrorClass): boolean {
    return (
      errorClass === ErrorClass.INTEGRATION || errorClass === ErrorClass.SYSTEM
    );
  }

  /**
   * Get retry after time in seconds
   */
  private getRetryAfter(errorClass: ErrorClass): number | undefined {
    switch (errorClass) {
      case ErrorClass.INTEGRATION:
        return 30; // 30 seconds
      case ErrorClass.SYSTEM:
        return 60; // 1 minute
      default:
        return undefined;
    }
  }

  /**
   * Mask IP address for privacy
   */
  private maskIpAddress(ip: string): string {
    if (!ip || ip === "unknown") return "unknown";

    // IPv4: 192.168.1.1 -> 192.168.1.***
    if (ip.includes(".")) {
      const parts = ip.split(".");
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
      }
    }

    // IPv6: 2001:db8::1 -> 2001:db8::***
    if (ip.includes(":")) {
      const parts = ip.split(":");
      if (parts.length > 2) {
        return `${parts.slice(0, -1).join(":")}:***`;
      }
    }

    return ip;
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    structuredError: StructuredError,
    originalError: Error,
  ): void {
    const logData = {
      errorId: structuredError.errorId,
      correlationId: structuredError.correlationId,
      class: structuredError.class,
      severity: structuredError.severity,
      code: structuredError.code,
      message: structuredError.message,
      context: structuredError.context,
      stack: this.enableStackTrace ? originalError.stack : undefined,
    };

    switch (structuredError.severity) {
      case ErrorSeverity.LOW:
        this.logger.info("Client error occurred", logData);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn("Business logic error occurred", logData);
        break;
      case ErrorSeverity.HIGH:
        this.logger.error("Integration error occurred", logData);
        break;
      case ErrorSeverity.CRITICAL:
        this.logger.error("Critical system error occurred", logData);
        break;
    }
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(
    errorClass: ErrorClass,
    severity: ErrorSeverity,
  ): void {
    const key = `${errorClass}:${severity}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);

    // Reset counters every minute
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.errorCounts.clear();
      this.lastResetTime = now;
    }
  }

  /**
   * Send error response to client
   */
  private sendErrorResponse(
    res: Response,
    structuredError: StructuredError,
  ): void {
    const httpStatus = HTTP_STATUS_MAP[structuredError.class];

    // Create client-safe response (no sensitive data)
    const clientResponse = {
      error: {
        id: structuredError.errorId,
        correlationId: structuredError.correlationId,
        class: structuredError.class,
        code: structuredError.code,
        message: structuredError.userMessage,
        recoverable: structuredError.recoverable,
        retryAfter: structuredError.retryAfter,
        timestamp: structuredError.timestamp,
      },
    };

    res.status(httpStatus).json(clientResponse);
  }

  /**
   * Get current error metrics
   */
  public getErrorMetrics(): Map<string, number> {
    return new Map(this.errorCounts);
  }

  /**
   * Reset error metrics
   */
  public resetErrorMetrics(): void {
    this.errorCounts.clear();
    this.lastResetTime = Date.now();
  }
}

/**
 * Express error handling middleware factory
 */
export function createErrorHandler(options: ErrorHandlerOptions) {
  const errorHandler = new ErrorHandler(options);
  return errorHandler.handleError;
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
