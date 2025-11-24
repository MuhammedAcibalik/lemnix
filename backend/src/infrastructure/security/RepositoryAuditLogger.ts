/**
 * Repository Audit Logger
 *
 * Logs all repository operations for audit purposes
 *
 * @module infrastructure/security/RepositoryAuditLogger
 * @version 1.0.0
 */

import { logger } from "../../services/logger";

export interface AuditContext {
  readonly userId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly operation: string;
  readonly model: string;
  readonly resourceId?: string;
  readonly changes?: Record<string, unknown>;
}

/**
 * Repository Audit Logger
 */
export class RepositoryAuditLogger {
  /**
   * Log repository operation
   */
  public static logOperation(context: AuditContext): void {
    logger.info("Repository operation", {
      operation: context.operation,
      model: context.model,
      resourceId: context.resourceId,
      userId: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log create operation
   */
  public static logCreate(
    model: string,
    resourceId: string,
    userId?: string,
    changes?: Record<string, unknown>,
  ): void {
    this.logOperation({
      operation: "CREATE",
      model,
      resourceId,
      userId,
      changes,
    });
  }

  /**
   * Log update operation
   */
  public static logUpdate(
    model: string,
    resourceId: string,
    userId?: string,
    changes?: Record<string, unknown>,
  ): void {
    this.logOperation({
      operation: "UPDATE",
      model,
      resourceId,
      userId,
      changes,
    });
  }

  /**
   * Log delete operation
   */
  public static logDelete(
    model: string,
    resourceId: string,
    userId?: string,
  ): void {
    this.logOperation({
      operation: "DELETE",
      model,
      resourceId,
      userId,
    });
  }

  /**
   * Log read operation (for sensitive data)
   */
  public static logRead(
    model: string,
    resourceId: string,
    userId?: string,
  ): void {
    this.logOperation({
      operation: "READ",
      model,
      resourceId,
      userId,
    });
  }

  /**
   * Log security violation
   */
  public static logSecurityViolation(
    model: string,
    resourceId: string,
    userId: string,
    reason: string,
  ): void {
    logger.warn("Security violation in repository", {
      operation: "SECURITY_VIOLATION",
      model,
      resourceId,
      userId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}
