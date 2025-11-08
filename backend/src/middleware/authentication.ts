/**
 * Authentication Middleware
 * @fileoverview JWT-based authentication with session management
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../services/logger';
import { UserRole, Permission, generateToken, JWTPayload } from './authorization';

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

interface ActiveSession {
  sessionId: string;
  userId: string;
  role: UserRole;
  createdAt: number;
  lastActivity: number;
  tokenIds: Set<string>;
  isActive: boolean;
}

class SessionManager {
  private sessions = new Map<string, ActiveSession>();
  private userSessions = new Map<string, Set<string>>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  createSession(userId: string, role: UserRole): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const session: ActiveSession = {
      sessionId,
      userId,
      role,
      createdAt: now,
      lastActivity: now,
      tokenIds: new Set(),
      isActive: true
    };

    this.sessions.set(sessionId, session);

    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId)!.add(sessionId);

    logger.info('Session created', { sessionId, userId, role, totalSessions: this.sessions.size });
    return sessionId;
  }

  validateSession(sessionId: string, tokenId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive) return false;

    const now = Date.now();
    
    if (now - session.lastActivity > this.SESSION_TIMEOUT || 
        now - session.createdAt > this.ABSOLUTE_TIMEOUT) {
      this.invalidateSession(sessionId);
      return false;
    }

    session.lastActivity = now;
    session.tokenIds.add(tokenId);
    return true;
  }

  invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.isActive = false;
    this.sessions.delete(sessionId);

    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    logger.info('Session invalidated', { sessionId, userId: session.userId, totalSessions: this.sessions.size });
  }

  invalidateUserSessions(userId: string): void {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) return;

    const sessionIds = Array.from(userSessions);
    sessionIds.forEach(sessionId => this.invalidateSession(sessionId));

    logger.info('All user sessions invalidated', { userId, sessionCount: sessionIds.length });
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      if (!session.isActive || 
          now - session.lastActivity > this.SESSION_TIMEOUT ||
          now - session.createdAt > this.ABSOLUTE_TIMEOUT) {
        toRemove.push(sessionId);
      }
    }

    toRemove.forEach(sessionId => this.invalidateSession(sessionId));

    if (toRemove.length > 0) {
      logger.debug('Cleaned up inactive sessions', { removedCount: toRemove.length, activeSessions: this.sessions.size });
    }
  }

  getSessionStats(): { activeSessions: number; totalUsers: number } {
    return { activeSessions: this.sessions.size, totalUsers: this.userSessions.size };
  }
}

export const sessionManager = new SessionManager();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticate user with real user database integration
 * This will be replaced with actual database queries in production
 */
export const authenticateUser = async (username: string, password: string): Promise<{ userId: string; role: UserRole } | null> => {
  try {
    // TODO: Replace with actual database integration
    // const user = await userService.findByUsername(username);
    // if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
    //   return null;
    // }
    // return { userId: user.id, role: user.role };

    logger.warn('Authentication service not implemented', { username });
    return null;
  } catch (error) {
    logger.error('Authentication error', { error: (error as Error).message, username });
    return null;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Bad Request', message: 'Username and password are required' });
      return;
    }

    const authResult = await authenticateUser(username, password);
    if (!authResult) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
      return;
    }

    const sessionId = sessionManager.createSession(authResult.userId, authResult.role);
    const accessToken = generateToken(authResult.userId, authResult.role, sessionId);
    const refreshToken = generateToken(authResult.userId, authResult.role, sessionId);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionId,
      user: { userId: authResult.userId, role: authResult.role },
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

  } catch (error) {
    logger.error('Login error', { error: (error as Error).message });
    res.status(500).json({ error: 'Internal Server Error', message: 'Authentication service unavailable' });
  }
};

export const logout = (req: Request, res: Response): void => {
  try {
    if (req.user?.sessionId) {
      sessionManager.invalidateSession(req.user.sessionId);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: (error as Error).message });
    res.status(500).json({ error: 'Internal Server Error', message: 'Logout service unavailable' });
  }
};

export const refreshToken = (req: Request, res: Response): void => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Bad Request', message: 'Refresh token is required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(refreshToken, jwtSecret) as JWTPayload;

    if (!sessionManager.validateSession(decoded.sessionId, decoded.jti)) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session' });
      return;
    }

    const newAccessToken = generateToken(decoded.userId, decoded.role, decoded.sessionId);
    const newRefreshToken = generateToken(decoded.userId, decoded.role, decoded.sessionId);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

  } catch (error) {
    logger.error('Token refresh error', { error: (error as Error).message });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid refresh token' });
  }
};

/**
 * JWT Token Authentication Middleware
 * Parses JWT token and sets req.user
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'Access token required' });
      return;
    }

    // Development mode: Accept mock token with LIMITED permissions
    if (process.env.NODE_ENV === 'development' && token === 'mock-dev-token-lemnix-2025') {
      req.user = {
        userId: 'dev-user-123',
        role: 'planner' as UserRole, // ⚠️ ADMIN yerine PLANNER
        sessionId: 'dev-session-123',
        permissions: [Permission.VIEW_CUTTING_PLANS, Permission.VIEW_OPTIMIZATION_RESULTS], // ⚠️ Sınırlı yetkiler
        tokenId: 'dev-token-123'
      };
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Set user info on request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
      permissions: [], // TODO: Implement permissions from JWT or database
      tokenId: decoded.jti
    };

    next();
  } catch (error) {
    logger.error('Token authentication error', { error: (error as Error).message });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const validateSession = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    return;
  }

  // Development mode: Skip session validation for mock token
  if (process.env.NODE_ENV === 'development' && req.user.userId === 'dev-user-123') {
    next();
    return;
  }

  if (!sessionManager.validateSession(req.user.sessionId, req.user.tokenId)) {
    res.status(401).json({ error: 'Unauthorized', message: 'Session expired or invalid' });
    return;
  }

  next();
};