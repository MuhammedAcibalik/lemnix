/**
 * @fileoverview Session Validation Middleware
 * @module middleware/sessionValidation
 * @version 1.0.0
 *
 * 🔐 CRITICAL: Session validation and security
 * - Validates user sessions
 * - Prevents unauthorized access
 * - Maintains security standards
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { UserRole, Permission } from "./authorization";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    sessionId: string;
    permissions: Permission[];
    tokenId: string;
  };
}

/**
 * Validate user session
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function validateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Allow bypass in development and automated test environments
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test" ||
      process.env.AUTH_BYPASS === "true"
    ) {
      if (!req.user) {
        req.user = {
          userId: "test-user",
          role: UserRole.ADMIN,
          sessionId: "test-session",
          permissions: Object.values(Permission),
          tokenId: "test-token",
        };
      }
      logger.debug(
        "Session validation bypassed due to non-production environment",
      );
      next();
      return;
    }

    // Check if user is authenticated
    if (!req.user) {
      logger.warn("Session validation failed: No user in request", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(401).json({
        success: false,
        error: "Session validation failed",
        message: "User not authenticated",
      });
      return;
    }

    // Check if user has required permissions
    const requiredPermissions = [
      Permission.VIEW_CUTTING_PLANS,
      Permission.START_OPTIMIZATION,
    ];
    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      req.user?.permissions.includes(permission),
    );

    if (!hasRequiredPermissions) {
      logger.warn("Session validation failed: Insufficient permissions", {
        userId: req.user?.userId,
        userRole: req.user?.role,
        userPermissions: req.user?.permissions,
        requiredPermissions,
        ip: req.ip,
      });

      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        message: "User does not have required permissions",
      });
      return;
    }

    logger.debug("Session validation successful", {
      userId: req.user?.userId,
      userRole: req.user?.role,
      ip: req.ip,
    });

    next();
  } catch (error) {
    logger.error("Session validation error", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      ip: req.ip,
    });

    res.status(500).json({
      success: false,
      error: "Session validation failed",
      message: "Internal server error during session validation",
    });
  }
}
