/**
 * @fileoverview Audit Service for comprehensive audit trail
 * @module AuditService
 * @version 1.0.0
 */

import { prisma } from '../../config/database';
import { logger } from '../logger';
import type { Prisma } from '@prisma/client';

/**
 * Audit log entry interface
 */
interface AuditEntry {
  userId: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Service for tracking all database modifications
 */
export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an audit entry
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          tableName: entry.tableName,
          operation: entry.operation,
          recordId: entry.recordId,
          oldData: entry.oldData ? (entry.oldData as Prisma.InputJsonValue) : undefined,
          newData: entry.newData ? (entry.newData as Prisma.InputJsonValue) : undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });

      logger.debug('[Audit] Log entry created', {
        table: entry.tableName,
        operation: entry.operation,
        recordId: entry.recordId,
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      logger.error('[Audit] Failed to log entry', { entry, error });
    }
  }

  /**
   * Log INSERT operation
   */
  async logInsert(params: {
    userId: string;
    tableName: string;
    recordId: string;
    data: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      tableName: params.tableName,
      operation: 'INSERT',
      recordId: params.recordId,
      newData: params.data,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Log UPDATE operation
   */
  async logUpdate(params: {
    userId: string;
    tableName: string;
    recordId: string;
    oldData: Record<string, unknown>;
    newData: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      tableName: params.tableName,
      operation: 'UPDATE',
      recordId: params.recordId,
      oldData: params.oldData,
      newData: params.newData,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Log DELETE operation
   */
  async logDelete(params: {
    userId: string;
    tableName: string;
    recordId: string;
    data: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      userId: params.userId,
      tableName: params.tableName,
      operation: 'DELETE',
      recordId: params.recordId,
      oldData: params.data,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /**
   * Get audit trail for a specific record
   */
  async getAuditTrail(params: {
    tableName?: string;
    recordId?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { tableName, recordId, userId, limit = 100, offset = 0 } = params;

    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          ...(tableName && { tableName }),
          ...(recordId && { recordId }),
          ...(userId && { userId }),
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });

      const totalCount = await prisma.auditLog.count({
        where: {
          ...(tableName && { tableName }),
          ...(recordId && { recordId }),
          ...(userId && { userId }),
        },
      });

      return {
        logs,
        totalCount,
        hasMore: offset + logs.length < totalCount,
      };
    } catch (error) {
      logger.error('[Audit] Failed to get audit trail', { params, error });
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getStatistics(params: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalOperations: number;
    operationsByType: Record<string, number>;
    operationsByTable: Record<string, number>;
  }> {
    const { userId, startDate, endDate } = params;

    try {
      // Total operations
      const totalOperations = await prisma.auditLog.count({
        where: {
          ...(userId && { userId }),
          ...(startDate && { timestamp: { gte: startDate } }),
          ...(endDate && { timestamp: { lte: endDate } }),
        },
      });

      // Operations by type
      const byOperation = await prisma.auditLog.groupBy({
        by: ['operation'],
        where: {
          ...(userId && { userId }),
          ...(startDate && { timestamp: { gte: startDate } }),
          ...(endDate && { timestamp: { lte: endDate } }),
        },
        _count: true,
      });

      const operationsByType = byOperation.reduce((acc, { operation, _count }) => {
        acc[operation] = _count;
        return acc;
      }, {} as Record<string, number>);

      // Operations by table
      const byTable = await prisma.auditLog.groupBy({
        by: ['tableName'],
        where: {
          ...(userId && { userId }),
          ...(startDate && { timestamp: { gte: startDate } }),
          ...(endDate && { timestamp: { lte: endDate } }),
        },
        _count: true,
      });

      const operationsByTable = byTable.reduce((acc, { tableName, _count }) => {
        acc[tableName] = _count;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalOperations,
        operationsByType,
        operationsByTable,
      };
    } catch (error) {
      logger.error('[Audit] Failed to get statistics', { params, error });
      throw error;
    }
  }

  /**
   * Purge old audit logs (retention policy)
   */
  async purgeOldLogs(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info('[Audit] Purged old logs', {
        count: result.count,
        cutoffDate: cutoffDate.toISOString(),
      });

      return result.count;
    } catch (error) {
      logger.error('[Audit] Failed to purge old logs', { error });
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const auditService = AuditService.getInstance();

