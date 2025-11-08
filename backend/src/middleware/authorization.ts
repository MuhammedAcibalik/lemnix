/**
 * Authorization Middleware
 * @fileoverview Role-based access control (RBAC) implementation
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../services/logger';

// ============================================================================
// ROLE & PERMISSION DEFINITIONS
// ============================================================================

export enum UserRole {
  VIEWER = 'viewer',
  PLANNER = 'planner', 
  ADMIN = 'admin'
}

export enum Permission {
  VIEW_CUTTING_PLANS = 'view:cutting-plans',
  VIEW_OPTIMIZATION_RESULTS = 'view:optimization-results',
  VIEW_METRICS = 'view:metrics',
  VIEW_LOGS = 'view:logs',
  EXPORT_REPORTS = 'export:reports',
  START_OPTIMIZATION = 'start:optimization',
  STOP_OPTIMIZATION = 'stop:optimization',
  MANAGE_QUARANTINE = 'manage:quarantine',
  MANAGE_CONFIG = 'manage:config',
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  TRIGGER_BACKUP = 'trigger:backup',
  VIEW_SECURITY_LOGS = 'view:security-logs'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [
    Permission.VIEW_CUTTING_PLANS,
    Permission.VIEW_OPTIMIZATION_RESULTS,
    Permission.VIEW_METRICS,
    Permission.VIEW_LOGS,
    Permission.EXPORT_REPORTS
  ],
  [UserRole.PLANNER]: [
    Permission.VIEW_CUTTING_PLANS,
    Permission.VIEW_OPTIMIZATION_RESULTS,
    Permission.VIEW_METRICS,
    Permission.VIEW_LOGS,
    Permission.EXPORT_REPORTS,
    Permission.START_OPTIMIZATION,
    Permission.STOP_OPTIMIZATION,
    Permission.MANAGE_QUARANTINE
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_CUTTING_PLANS,
    Permission.VIEW_OPTIMIZATION_RESULTS,
    Permission.VIEW_METRICS,
    Permission.VIEW_LOGS,
    Permission.EXPORT_REPORTS,
    Permission.START_OPTIMIZATION,
    Permission.STOP_OPTIMIZATION,
    Permission.MANAGE_QUARANTINE,
    Permission.MANAGE_CONFIG,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.TRIGGER_BACKUP,
    Permission.VIEW_SECURITY_LOGS
  ]
};

export interface JWTPayload {
  userId: string;
  role: UserRole;
  sessionId: string;
  permissions: Permission[];
  iat: number;
  exp: number;
  jti: string;
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authorization header missing or invalid', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
      res.status(401).json({ error: 'Unauthorized', message: 'Valid authentication token required' });
      return;
    }

    const token = authHeader.substring(7);

    // ✅ SECURITY: Strict development-only mock token acceptance
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isMockToken = token.startsWith('mock-');
    
    // DEBUG: Log for troubleshooting
    logger.info('[AUTH DEBUG]', { 
      isDevelopment, 
      isMockToken, 
      tokenPrefix: token.substring(0, 15),
      nodeEnv: process.env.NODE_ENV,
      path: req.path
    });
    
    if (isDevelopment && isMockToken) {
      // ⚠️ SECURITY WARNING: Log mock token usage
      logger.warn('[AUTH] ⚠️ MOCK TOKEN USED - DEVELOPMENT MODE ONLY', { 
        token: token.substring(0, 20) + '...',
        isInternalService: token === 'mock-dev-token-internal-service',
        environment: process.env.NODE_ENV,
      });
      
      // Internal service-to-service communication
      if (token === 'mock-dev-token-internal-service') {
        req.user = {
          userId: 'internal-service',
          role: UserRole.ADMIN,
          sessionId: 'internal-service-session',
          permissions: Object.values(Permission), // Full permissions
          tokenId: 'internal-service-token'
        };
        next();
        return;
      }
      
      // Regular dev mock token
      req.user = {
        userId: 'dev-user',
        role: UserRole.ADMIN,
        sessionId: 'dev-session',
        permissions: Object.values(Permission),
        tokenId: 'dev-token-id'
      };
      next();
      return;
    }
    
    // ✅ SECURITY: Reject mock tokens in production
    if (!isDevelopment && isMockToken) {
      logger.error('[AUTH] 🚨 MOCK TOKEN REJECTED IN PRODUCTION', {
        token: token.substring(0, 10) + '...',
        environment: process.env.NODE_ENV,
        ip: req.ip,
        path: req.path,
      });
      res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid authentication token' 
      });
      return;
    }

    const jwtSecret = process.env['JWT_SECRET'] || 'default-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
      permissions: decoded.permissions,
      tokenId: decoded.jti
    };
    
    logger.info('Token verified successfully', { userId: decoded.userId, role: decoded.role, sessionId: decoded.sessionId, tokenId: decoded.jti });
    next();
  } catch (error) {
    logger.error('Token verification failed', { error: (error as Error).message, ip: req.ip, path: req.path });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('Authorization check failed - no user context', { permission, ip: req.ip, path: req.path });
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn('Permission denied', { userId: req.user.userId, role: req.user.role, permission, ip: req.ip, path: req.path });
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
      return;
    }

    logger.debug('Permission granted', { userId: req.user.userId, role: req.user.role, permission });
    next();
  };
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      logger.warn('Role check failed - no user context', { requiredRoles: roles, ip: req.ip, path: req.path });
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Role access denied', { userId: req.user.userId, userRole: req.user.role, requiredRoles: roles, ip: req.ip, path: req.path });
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient role privileges' });
      return;
    }

    logger.debug('Role access granted', { userId: req.user.userId, role: req.user.role });
    next();
  };
};

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

export const generateToken = (userId: string, role: UserRole, sessionId: string): string => {
  const jwtSecret = process.env['JWT_SECRET'] || 'default-secret-key';
  const expiresIn = process.env['JWT_EXPIRES_IN'] || '15m';
  
  const payload: JWTPayload = {
    userId,
    role,
    sessionId,
    permissions: ROLE_PERMISSIONS[role],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (parseInt(expiresIn.replace('m', '')) * 60),
    jti: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  return jwt.sign(payload, jwtSecret);
};

export const hasPermission = (userPermissions: Permission[], permission: Permission): boolean => {
  return userPermissions.includes(permission);
};

export const getPermissionsByRole = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        sessionId: string;
        permissions: Permission[];
        tokenId: string;
      };
    }
  }
}