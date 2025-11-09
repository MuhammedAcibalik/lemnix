/**
 * @fileoverview Audit Middleware
 * @module middleware/auditMiddleware
 * @version 1.0.0
 *
 * 📝 CRITICAL SECURITY: This middleware handles automatic audit logging
 * - Logs all data modifications automatically
 * - Tracks user actions and system events
 * - Provides comprehensive security monitoring
 * - Maintains compliance requirements
 */

import { Request, Response, NextFunction } from "express";
import {
  auditService,
  AuditOperation,
  AuditSeverity,
} from "../services/auditService";
import { logger } from "../services/logger";
import { auditQueue } from "../services/auditQueue";

// ============================================================================
// AUDIT CONFIGURATION
// ============================================================================

interface AuditConfig {
  enabled: boolean;
  logReads: boolean;
  logWrites: boolean;
  logAuth: boolean;
  logSystem: boolean;
  excludePaths: string[];
  sensitiveOperations: string[];
}

const AUDIT_CONFIG: AuditConfig = {
  enabled: process.env.AUDIT_ENABLED !== "false",
  logReads: process.env.AUDIT_LOG_READS === "true",
  logWrites: process.env.AUDIT_LOG_WRITES !== "false",
  logAuth: process.env.AUDIT_LOG_AUTH !== "false",
  logSystem: process.env.AUDIT_LOG_SYSTEM !== "false",
  excludePaths: ["/health", "/metrics", "/favicon.ico", "/static", "/assets"],
  sensitiveOperations: [
    "DELETE",
    "POST /production-plan/upload",
    "POST /cutting-list",
    "PUT /user",
    "DELETE /user",
  ],
};

// ============================================================================
// AUDIT MIDDLEWARE
// ============================================================================

/**
 * Main audit middleware that logs all requests
 */
export const auditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!AUDIT_CONFIG.enabled) {
    next();
    return;
  }

  // Skip excluded paths
  if (AUDIT_CONFIG.excludePaths.some((path) => req.path.startsWith(path))) {
    next();
    return;
  }

  const startTime = Date.now();
  const userId = (req as any).user?.userId || "anonymous";
  const sessionId = (req as any).user?.sessionId || null;

  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Override response methods to capture response data
  res.send = function (data: unknown) {
    enqueueAuditEvent(req, res, startTime, data);
    return originalSend.call(this, data);
  };

  res.json = function (data: unknown) {
    enqueueAuditEvent(req, res, startTime, data);
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Log audit event after response is sent
 */
function enqueueAuditEvent(
  req: Request,
  res: Response,
  startTime: number,
  responseData: unknown,
): void {
  auditQueue.enqueue(async () => {
    const duration = Date.now() - startTime;
    const operation = getOperationFromRequest(req);
    const tableName = getTableNameFromPath(req.path);
    const severity = getSeverityFromRequest(req);

    // Determine if this is a sensitive operation
    const isSensitive = AUDIT_CONFIG.sensitiveOperations.some(
      (op) => req.path.includes(op) || `${req.method} ${req.path}`.includes(op),
    );

    // Log based on operation type
    if (shouldLogOperation(req, operation)) {
      await auditService.logUserAction(
        req,
        operation,
        tableName || "unknown",
        getRecordIdFromRequest(req),
        getOldDataFromRequest(req),
        getNewDataFromRequest(req, responseData),
        `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      );
    }

    // Log security events for sensitive operations
    if (isSensitive && res.statusCode >= 400) {
      await auditService.logSecurityEvent(
        (req as any).user?.userId || "anonymous",
        operation,
        `Sensitive operation failed: ${req.method} ${req.path} - ${res.statusCode}`,
        severity,
        req.ip,
        req.headers["user-agent"] as string,
        {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          error: responseData?.error || responseData?.message,
        },
      );
    }

    // Log authentication events
    if (AUDIT_CONFIG.logAuth && isAuthOperation(req)) {
      await auditService.logUserAction(
        req,
        operation,
        "authentication",
        undefined,
        undefined,
        undefined,
        `Auth operation: ${req.method} ${req.path} - ${res.statusCode}`,
      );
    }

    logger.debug("Audit event logged", {
      userId: (req as any).user?.userId || "anonymous",
      operation,
      tableName,
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      isSensitive,
    });
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine if operation should be logged
 */
function shouldLogOperation(req: Request, operation: AuditOperation): boolean {
  // Always log writes
  if (
    AUDIT_CONFIG.logWrites &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    return true;
  }

  // Log reads if enabled
  if (AUDIT_CONFIG.logReads && req.method === "GET") {
    return true;
  }

  // Always log authentication operations
  if (AUDIT_CONFIG.logAuth && isAuthOperation(req)) {
    return true;
  }

  return false;
}

/**
 * Get operation type from request
 */
function getOperationFromRequest(req: Request): AuditOperation {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  // Authentication operations
  if (path.includes("/login") || path.includes("/auth")) {
    return AuditOperation.AUTHENTICATE;
  }

  if (path.includes("/logout")) {
    return AuditOperation.LOGOUT;
  }

  // Upload operations
  if (path.includes("/upload")) {
    return AuditOperation.UPLOAD;
  }

  // Download/Export operations
  if (path.includes("/download") || path.includes("/export")) {
    return AuditOperation.DOWNLOAD;
  }

  // Search operations
  if (path.includes("/search") || req.query.search) {
    return AuditOperation.SEARCH;
  }

  // Filter operations
  if (Object.keys(req.query).length > 0) {
    return AuditOperation.FILTER;
  }

  // Standard CRUD operations
  switch (method) {
    case "GET":
      return AuditOperation.READ;
    case "POST":
      return AuditOperation.CREATE;
    case "PUT":
    case "PATCH":
      return AuditOperation.UPDATE;
    case "DELETE":
      return AuditOperation.DELETE;
    default:
      return AuditOperation.SYSTEM;
  }
}

/**
 * Get table name from request path
 */
function getTableNameFromPath(path: string): string | null {
  const pathToTableMap: Record<string, string> = {
    "/production-plan": "production_plans",
    "/production-plan/upload": "production_plan_items",
    "/cutting-list": "cutting_lists",
    "/optimization": "optimizations",
    "/user": "users",
    "/material-profile-mapping": "material_profile_mappings",
    "/audit": "audit_logs",
  };

  for (const [apiPath, tableName] of Object.entries(pathToTableMap)) {
    if (path.startsWith(apiPath)) {
      return tableName;
    }
  }

  return null;
}

/**
 * Get record ID from request
 */
function getRecordIdFromRequest(req: Request): string | undefined {
  // Try to get ID from URL parameters
  const idFromParams = req.params.id || req.params.recordId;
  if (idFromParams) {
    return idFromParams;
  }

  // Try to get ID from request body
  if (req.body && typeof req.body === "object") {
    return req.body.id || req.body.recordId;
  }

  return undefined;
}

/**
 * Get old data from request (for updates)
 */
function getOldDataFromRequest(req: Request): Record<string, unknown> | null {
  if (req.method === "PUT" || req.method === "PATCH") {
    return (req.body.oldData as Record<string, unknown>) || null;
  }
  return null;
}

/**
 * Get new data from request/response
 */
function getNewDataFromRequest(req: Request, responseData: unknown): Record<string, unknown> | null {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    return {
      requestData: req.body,
      responseData: responseData,
    };
  }
  return null;
}

/**
 * Get severity level from request
 */
function getSeverityFromRequest(req: Request): AuditSeverity {
  const method = req.method.toUpperCase();
  const path = req.path.toLowerCase();

  // Critical operations
  if (method === "DELETE" || path.includes("/delete")) {
    return AuditSeverity.CRITICAL;
  }

  // High severity operations
  if (path.includes("/upload") || path.includes("/auth") || method === "POST") {
    return AuditSeverity.HIGH;
  }

  // Medium severity operations
  if (method === "PUT" || method === "PATCH") {
    return AuditSeverity.MEDIUM;
  }

  // Low severity operations
  return AuditSeverity.LOW;
}

/**
 * Check if request is authentication related
 */
function isAuthOperation(req: Request): boolean {
  const path = req.path.toLowerCase();
  return (
    path.includes("/login") ||
    path.includes("/logout") ||
    path.includes("/auth") ||
    path.includes("/token") ||
    path.includes("/session")
  );
}

// ============================================================================
// SPECIALIZED AUDIT MIDDLEWARES
// ============================================================================

/**
 * Audit middleware specifically for data modifications
 */
export const auditDataModificationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!AUDIT_CONFIG.logWrites) {
    next();
    return;
  }

  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data: unknown) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logDataModification(req, data);
    }
    return originalSend.call(this, data);
  };

  res.json = function (data: unknown) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logDataModification(req, data);
    }
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Log data modification event
 */
async function logDataModification(
  req: Request,
  responseData: unknown,
): Promise<void> {
  try {
    const operation = getOperationFromRequest(req);
    const tableName = getTableNameFromPath(req.path);

    if (tableName && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      await auditService.logUserAction(
        req,
        operation,
        tableName,
        getRecordIdFromRequest(req),
        getOldDataFromRequest(req),
        getNewDataFromRequest(req, responseData),
        `Data modification: ${req.method} ${req.path}`,
      );
    }
  } catch (error) {
    logger.error("Failed to log data modification", {
      error: (error as Error).message,
      path: req.path,
      method: req.method,
    });
  }
}

/**
 * Audit middleware specifically for security events
 */
export const auditSecurityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!AUDIT_CONFIG.logAuth) {
    next();
    return;
  }

  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function (data: unknown) {
    if (isAuthOperation(req)) {
      logSecurityEvent(req, data, res.statusCode);
    }
    return originalSend.call(this, data);
  };

  res.json = function (data: unknown) {
    if (isAuthOperation(req)) {
      logSecurityEvent(req, data, res.statusCode);
    }
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Log security event
 */
async function logSecurityEvent(
  req: Request,
  responseData: unknown,
  statusCode: number,
): Promise<void> {
  try {
    const operation = getOperationFromRequest(req);
    const severity =
      statusCode >= 400 ? AuditSeverity.HIGH : AuditSeverity.MEDIUM;

    await auditService.logSecurityEvent(
      ((req as Request & { user?: { userId?: string } }).user?.userId) || "anonymous",
      operation,
      `Security event: ${req.method} ${req.path} - ${statusCode}`,
      severity,
      req.ip,
      req.headers["user-agent"] as string,
      {
        path: req.path,
        method: req.method,
        statusCode,
        success: statusCode < 400,
        responseData: responseData?.success || false,
      },
    );
  } catch (error) {
    logger.error("Failed to log security event", {
      error: (error as Error).message,
      path: req.path,
      method: req.method,
    });
  }
}
