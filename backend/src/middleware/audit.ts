/**
 * Audit Trail Middleware
 * @fileoverview Comprehensive audit logging for security and compliance
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../services/logger";
import { UserRole } from "./authorization";

// ============================================================================
// AUDIT EVENT TYPES
// ============================================================================

export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = "auth:login_success",
  LOGIN_FAILED = "auth:login_failed",
  LOGOUT = "auth:logout",
  TOKEN_REFRESH = "auth:token_refresh",
  TOKEN_EXPIRED = "auth:token_expired",

  // Authorization events
  PERMISSION_GRANTED = "authz:permission_granted",
  PERMISSION_DENIED = "authz:permission_denied",
  ROLE_CHANGED = "authz:role_changed",

  // Optimization events
  OPTIMIZATION_STARTED = "opt:optimization_started",
  OPTIMIZATION_COMPLETED = "opt:optimization_completed",
  OPTIMIZATION_FAILED = "opt:optimization_failed",
  OPTIMIZATION_CANCELLED = "opt:optimization_cancelled",

  // Configuration events
  CONFIG_CHANGED = "config:changed",
  POLICY_CHANGED = "config:policy_changed",

  // Quarantine events
  QUARANTINE_DECISION = "quarantine:decision",
  QUARANTINE_EXCEPTION = "quarantine:exception",

  // System events
  BACKUP_TRIGGERED = "system:backup_triggered",
  RATE_LIMIT_EXCEEDED = "system:rate_limit_exceeded",
  SECURITY_ALERT = "system:security_alert",
}

// ============================================================================
// AUDIT EVENT INTERFACE
// ============================================================================

export interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  timestamp: string;
  userId: string | undefined;
  sessionId: string | undefined;
  userRole: UserRole | undefined;
  ipAddress: string;
  userAgent: string | undefined;
  resource: string | undefined;
  action: string | undefined;
  result: "success" | "failure" | "blocked";
  details: Record<string, unknown> | undefined;
  riskLevel: "low" | "medium" | "high" | "critical";
  correlationId: string | undefined;
}

// ============================================================================
// AUDIT STORAGE
// ============================================================================

class AuditStore {
  private events: AuditEvent[] = [];
  private readonly maxEvents = 10000; // Keep last 10k events in memory
  private readonly criticalEvents: AuditEvent[] = [];

  /**
   * Store audit event
   */
  storeEvent(event: AuditEvent): void {
    // Add to main events array
    this.events.push(event);

    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store critical events separately
    if (event.riskLevel === "critical" || event.riskLevel === "high") {
      this.criticalEvents.push(event);
    }

    // Log to file/console
    this.logEvent(event);
  }

  /**
   * Log event to file system
   */
  private logEvent(event: AuditEvent): void {
    const logLevel = this.getLogLevel(event.riskLevel);

    logger[logLevel]("Audit Event", {
      eventId: event.eventId,
      eventType: event.eventType,
      userId: event.userId,
      sessionId: event.sessionId,
      userRole: event.userRole,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.resource,
      action: event.action,
      result: event.result,
      riskLevel: event.riskLevel,
      correlationId: event.correlationId,
      details: event.details,
    });
  }

  /**
   * Get log level based on risk level
   */
  private getLogLevel(riskLevel: string): "info" | "warn" | "error" {
    switch (riskLevel) {
      case "critical":
      case "high":
        return "error";
      case "medium":
        return "warn";
      default:
        return "info";
    }
  }

  /**
   * Get events by criteria
   */
  getEvents(criteria: {
    eventType?: AuditEventType;
    userId?: string;
    sessionId?: string;
    riskLevel?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
  }): AuditEvent[] {
    let filteredEvents = this.events;

    if (criteria.eventType) {
      filteredEvents = filteredEvents.filter(
        (e) => e.eventType === criteria.eventType,
      );
    }

    if (criteria.userId) {
      filteredEvents = filteredEvents.filter(
        (e) => e.userId === criteria.userId,
      );
    }

    if (criteria.sessionId) {
      filteredEvents = filteredEvents.filter(
        (e) => e.sessionId === criteria.sessionId,
      );
    }

    if (criteria.riskLevel) {
      filteredEvents = filteredEvents.filter(
        (e) => e.riskLevel === criteria.riskLevel,
      );
    }

    if (criteria.startTime) {
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp >= criteria.startTime!,
      );
    }

    if (criteria.endTime) {
      filteredEvents = filteredEvents.filter(
        (e) => e.timestamp <= criteria.endTime!,
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    if (criteria.limit) {
      filteredEvents = filteredEvents.slice(0, criteria.limit);
    }

    return filteredEvents;
  }

  /**
   * Get critical events
   */
  getCriticalEvents(limit: number = 100): AuditEvent[] {
    return this.criticalEvents
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Get audit statistics
   */
  getStats(): {
    totalEvents: number;
    criticalEvents: number;
    eventsByType: Record<string, number>;
    eventsByRisk: Record<string, number>;
    recentActivity: number; // Events in last hour
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const eventsByType: Record<string, number> = {};
    const eventsByRisk: Record<string, number> = {};

    this.events.forEach((event) => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsByRisk[event.riskLevel] = (eventsByRisk[event.riskLevel] || 0) + 1;
    });

    const recentActivity = this.events.filter(
      (event) => new Date(event.timestamp) > oneHourAgo,
    ).length;

    return {
      totalEvents: this.events.length,
      criticalEvents: this.criticalEvents.length,
      eventsByType,
      eventsByRisk,
      recentActivity,
    };
  }
}

// Global audit store
export const auditStore = new AuditStore();

// ============================================================================
// AUDIT MIDDLEWARE
// ============================================================================

/**
 * Generate unique event ID
 */
const generateEventId = (): string => {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Determine risk level based on event type and context
 */
const determineRiskLevel = (
  eventType: AuditEventType,
  result: string,
): "low" | "medium" | "high" | "critical" => {
  // Critical events
  if (
    eventType === AuditEventType.SECURITY_ALERT ||
    eventType === AuditEventType.PERMISSION_DENIED ||
    eventType === AuditEventType.RATE_LIMIT_EXCEEDED
  ) {
    return "critical";
  }

  // High risk events
  if (
    eventType === AuditEventType.LOGIN_FAILED ||
    eventType === AuditEventType.ROLE_CHANGED ||
    eventType === AuditEventType.CONFIG_CHANGED ||
    eventType === AuditEventType.OPTIMIZATION_FAILED
  ) {
    return "high";
  }

  // Medium risk events
  if (
    eventType === AuditEventType.OPTIMIZATION_STARTED ||
    eventType === AuditEventType.QUARANTINE_DECISION ||
    result === "failure"
  ) {
    return "medium";
  }

  // Low risk events (default)
  return "low";
};

/**
 * Create audit event
 */
export const createAuditEvent = (
  eventType: AuditEventType,
  req: Request,
  result: "success" | "failure" | "blocked",
  details?: Record<string, any>,
  correlationId?: string,
): AuditEvent => {
  return {
    eventId: generateEventId(),
    eventType,
    timestamp: new Date().toISOString(),
    userId: req.user?.userId,
    sessionId: req.user?.sessionId,
    userRole: req.user?.role,
    ipAddress: req.ip || "unknown",
    userAgent: req.get("User-Agent"),
    resource: req.path,
    action: req.method,
    result,
    details,
    riskLevel: determineRiskLevel(eventType, result),
    correlationId,
  };
};

/**
 * Audit middleware factory
 */
export const createAuditMiddleware = (eventType: AuditEventType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Store original end function
    const originalEnd = res.end.bind(res);
    res.end = function (
      chunk?: unknown,
      encoding?: unknown,
      cb?: unknown,
    ): Response {
      const duration = Date.now() - startTime;
      const result =
        res.statusCode >= 200 && res.statusCode < 400 ? "success" : "failure";

      // Create audit event
      const event = createAuditEvent(eventType, req, result, {
        statusCode: res.statusCode,
        duration,
        responseSize: chunk
          ? typeof chunk === "string"
            ? chunk.length
            : Buffer.isBuffer(chunk)
              ? chunk.length
              : 0
          : 0,
      });

      // Store event
      auditStore.storeEvent(event);

      // Call original end function with proper parameters
      return originalEnd(
        chunk,
        encoding as BufferEncoding,
        cb as (() => void) | undefined,
      );
    };

    next();
  };
};

/**
 * Specialized audit middleware for authentication
 */
export const auditAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const originalJson = res.json;

  res.json = function (obj: unknown) {
    let eventType: AuditEventType;
    let result: "success" | "failure" | "blocked";

    if (res.statusCode === 200 && (obj as { success?: boolean }).success) {
      eventType = AuditEventType.LOGIN_SUCCESS;
      result = "success";
    } else if (res.statusCode === 401) {
      eventType = AuditEventType.LOGIN_FAILED;
      result = "failure";
    } else {
      eventType = AuditEventType.LOGIN_FAILED;
      result = "failure";
    }

    const event = createAuditEvent(eventType, req, result, {
      username: req.body?.username,
      statusCode: res.statusCode,
    });

    auditStore.storeEvent(event);

    return originalJson.call(this, obj);
  };

  next();
};

/**
 * Audit middleware for optimization operations
 */
export const auditOptimization = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const originalJson = res.json;

  res.json = function (obj: unknown) {
    let eventType: AuditEventType;

    if (req.method === "POST" && req.path.includes("/optimize")) {
      eventType = AuditEventType.OPTIMIZATION_STARTED;
    } else if (req.method === "DELETE" && req.path.includes("/optimize")) {
      eventType = AuditEventType.OPTIMIZATION_CANCELLED;
    } else {
      return originalJson.call(this, obj);
    }

    const result =
      res.statusCode >= 200 && res.statusCode < 400 ? "success" : "failure";

    const event = createAuditEvent(eventType, req, result, {
      algorithm: req.body?.algorithm,
      itemCount: req.body?.items?.length,
      statusCode: res.statusCode,
    });

    auditStore.storeEvent(event);

    return originalJson.call(this, obj);
  };

  next();
};

// ============================================================================
// AUDIT UTILITIES
// ============================================================================

/**
 * Log security alert
 */
export const logSecurityAlert = (
  req: Request,
  alertType: string,
  details: Record<string, any>,
): void => {
  const event = createAuditEvent(
    AuditEventType.SECURITY_ALERT,
    req,
    "blocked",
    {
      alertType,
      ...details,
    },
  );

  auditStore.storeEvent(event);
};

/**
 * Log permission denied event
 */
export const logPermissionDenied = (
  req: Request,
  permission: string,
  resource: string,
): void => {
  const event = createAuditEvent(
    AuditEventType.PERMISSION_DENIED,
    req,
    "blocked",
    {
      permission,
      resource,
      attemptedAction: req.method,
    },
  );

  auditStore.storeEvent(event);
};

/**
 * Log rate limit exceeded
 */
export const logRateLimitExceeded = (
  req: Request,
  limitType: string,
  retryAfter: number,
): void => {
  const event = createAuditEvent(
    AuditEventType.RATE_LIMIT_EXCEEDED,
    req,
    "blocked",
    {
      limitType,
      retryAfter,
      userAgent: req.get("User-Agent"),
    },
  );

  auditStore.storeEvent(event);
};
