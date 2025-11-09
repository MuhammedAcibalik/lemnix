/**
 * @fileoverview Audit Logging Service
 * @module services/auditService
 * @version 1.0.0
 *
 * 📝 CRITICAL SECURITY: This service handles comprehensive audit logging
 * - Tracks all data modifications (CREATE, UPDATE, DELETE)
 * - Records user actions and system events
 * - Provides compliance and security monitoring
 * - Supports data retention policies
 */

import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import { logger } from "./logger";
import { Request } from "express";

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export enum AuditOperation {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  READ = "READ",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  UPLOAD = "UPLOAD",
  DOWNLOAD = "DOWNLOAD",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
  SEARCH = "SEARCH",
  FILTER = "FILTER",
  AUTHENTICATE = "AUTHENTICATE",
  AUTHORIZE = "AUTHORIZE",
  SYSTEM = "SYSTEM",
}

export enum AuditSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AuditLogData {
  userId: string;
  operation: AuditOperation;
  tableName: string;
  recordId?: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: AuditSeverity;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditQuery {
  userId?: string;
  operation?: AuditOperation;
  tableName?: string;
  recordId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditSeverity;
  limit?: number;
  offset?: number;
}

// ============================================================================
// AUDIT SERVICE CLASS
// ============================================================================

export class AuditService {
  private readonly retentionDays: number;
  private readonly maxLogSize: number;

  constructor() {
    this.retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || "365");
    this.maxLogSize = parseInt(process.env.AUDIT_MAX_LOG_SIZE || "10000");

    logger.info("Audit service initialized", {
      retentionDays: this.retentionDays,
      maxLogSize: this.maxLogSize,
    });
  }

  /**
   * Create audit log entry
   */
  public async log(data: AuditLogData): Promise<void> {
    try {
      // Validate required fields
      if (!data.userId || !data.operation || !data.tableName) {
        logger.error("Invalid audit log data", { data });
        return;
      }

      // Sanitize data to prevent sensitive information leakage
      const sanitizedOldData = this.sanitizeData(data.oldData);
      const sanitizedNewData = this.sanitizeData(data.newData);

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          tableName: data.tableName,
          operation: data.operation,
          recordId: data.recordId || "unknown",
          oldData: sanitizedOldData
            ? JSON.stringify(sanitizedOldData)
            : undefined,
          newData: sanitizedNewData
            ? JSON.stringify(sanitizedNewData)
            : undefined,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          timestamp: new Date(),
        },
      });

      // Log to application logger for immediate monitoring
      logger.info("Audit log created", {
        userId: data.userId,
        operation: data.operation,
        tableName: data.tableName,
        recordId: data.recordId,
        severity: data.severity || AuditSeverity.LOW,
      });
    } catch (error) {
      logger.error("Failed to create audit log", {
        error: (error as Error).message,
        data: {
          userId: data.userId,
          operation: data.operation,
          tableName: data.tableName,
        },
      });
    }
  }

  /**
   * Log user action with request context
   */
  public async logUserAction(
    req: Request,
    operation: AuditOperation,
    tableName: string,
    recordId?: string,
    oldData?: Record<string, unknown> | null,
    newData?: Record<string, unknown> | null,
    description?: string,
  ): Promise<void> {
    const userId = (req as Request & { user?: { userId?: string; sessionId?: string } }).user?.userId || "anonymous";
    const sessionId = (req as Request & { user?: { userId?: string; sessionId?: string } }).user?.sessionId || undefined;
    const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    await this.log({
      userId,
      operation,
      tableName,
      recordId,
      oldData,
      newData,
      ipAddress,
      userAgent,
      sessionId,
      description,
    });
  }

  /**
   * Log system event
   */
  public async logSystemEvent(
    operation: AuditOperation,
    description: string,
    severity: AuditSeverity = AuditSeverity.MEDIUM,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId: "system",
      operation,
      tableName: "system",
      description,
      severity,
      metadata,
    });
  }

  /**
   * Log security event
   */
  public async logSecurityEvent(
    userId: string,
    operation: AuditOperation,
    description: string,
    severity: AuditSeverity = AuditSeverity.HIGH,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.log({
      userId,
      operation,
      tableName: "security",
      description,
      severity,
      ipAddress,
      userAgent,
      metadata,
    });
  }

  /**
   * Query audit logs
   */
  public async queryAuditLogs(query: AuditQuery): Promise<Prisma.AuditLogGetPayload<Record<string, never>>[]> {
    try {
      const where: Prisma.AuditLogWhereInput = {};

      if (query.userId) where.userId = query.userId;
      if (query.operation) where.operation = query.operation;
      if (query.tableName) where.tableName = query.tableName;
      if (query.recordId) where.recordId = query.recordId;

      if (query.startDate || query.endDate) {
        where.timestamp = {};
        if (query.startDate) where.timestamp.gte = query.startDate;
        if (query.endDate) where.timestamp.lte = query.endDate;
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

      return logs.map((log) => ({
        ...log,
        oldData: log.oldData ? JSON.parse(String(log.oldData)) : null,
        newData: log.newData ? JSON.parse(String(log.newData)) : null,
      }));
    } catch (error) {
      logger.error("Failed to query audit logs", {
        error: (error as Error).message,
        query,
      });
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  public async getAuditStatistics(days: number = 30): Promise<{
    period: string;
    totalLogs: number;
    operations: Array<{
      operation: string;
      tableName: string;
      _count: { id: number };
    }>;
    generatedAt: string;
  } | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await prisma.auditLog.groupBy({
        by: ["operation", "tableName"],
        where: {
          timestamp: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      });

      const totalLogs = await prisma.auditLog.count({
        where: {
          timestamp: {
            gte: startDate,
          },
        },
      });

      return {
        period: `${days} days`,
        totalLogs,
        operations: stats,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Failed to get audit statistics", {
        error: (error as Error).message,
        days,
      });
      return null;
    }
  }

  /**
   * Clean up old audit logs
   */
  public async cleanupOldLogs(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info("Audit logs cleaned up", {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
        retentionDays: this.retentionDays,
      });

      return result.count;
    } catch (error) {
      logger.error("Failed to cleanup audit logs", {
        error: (error as Error).message,
        retentionDays: this.retentionDays,
      });
      return 0;
    }
  }

  /**
   * Sanitize data to remove sensitive information
   */
  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== "object") {
      return data;
    }

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "auth",
      "credential",
      "ssn",
      "socialSecurityNumber",
      "creditCard",
      "bankAccount",
    ];

    const sanitized = { ...(data as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const auditService = new AuditService();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create audit log for data modification
 */
export async function auditDataChange(
  req: Request,
  operation: AuditOperation,
  tableName: string,
  recordId: string,
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null,
  description?: string,
): Promise<void> {
  await auditService.logUserAction(
    req,
    operation,
    tableName,
    recordId,
    oldData,
    newData,
    description,
  );
}

/**
 * Create audit log for user action
 */
export async function auditUserAction(
  req: Request,
  operation: AuditOperation,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await auditService.logUserAction(
    req,
    operation,
    "user_actions",
    undefined,
    undefined,
    undefined,
    description,
  );
}

/**
 * Create audit log for security event
 */
export async function auditSecurityEvent(
  userId: string,
  operation: AuditOperation,
  description: string,
  severity: AuditSeverity = AuditSeverity.HIGH,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await auditService.logSecurityEvent(
    userId,
    operation,
    description,
    severity,
    ipAddress,
    userAgent,
    metadata,
  );
}
