/**
 * Authentication Middleware
 * @fileoverview JWT-based authentication with session management
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../services/logger";
import {
  UserRole,
  Permission,
  generateToken,
  JWTPayload,
} from "./authorization";
import {
  createSessionStore,
  SessionRecord,
  SessionStore,
} from "./sessionStore";

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export class SessionManager {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly activeSessionIds = new Set<string>();
  private readonly activeUsers = new Map<string, number>();

  constructor(private readonly store: SessionStore = createSessionStore()) {
    this.cleanupInterval = setInterval(
      () => {
        void this.cleanupInactiveSessions();
      },
      5 * 60 * 1000,
    );
    this.cleanupInterval.unref?.();
  }

  async createSession(userId: string, role: UserRole): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = Date.now();

    const session: SessionRecord = {
      sessionId,
      userId,
      role,
      createdAt: now,
      lastActivity: now,
      tokenIds: new Set(),
      isActive: true,
    };

    await this.store.create(session);
    this.trackSession(session);

    logger.info("Session created", { sessionId, userId, role });
    return sessionId;
  }

  async validateSession(sessionId: string, tokenId: string): Promise<boolean> {
    const session = await this.store.find(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    const now = Date.now();

    if (
      now - session.lastActivity > this.SESSION_TIMEOUT ||
      now - session.createdAt > this.ABSOLUTE_TIMEOUT
    ) {
      await this.invalidateSession(sessionId);
      return false;
    }

    session.lastActivity = now;
    session.tokenIds.add(tokenId);
    await this.store.update(sessionId, session);

    if (!this.activeSessionIds.has(sessionId)) {
      this.trackSession(session);
    }
    return true;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = await this.store.find(sessionId);
    if (!session) {
      this.activeSessionIds.delete(sessionId);
      return;
    }

    session.isActive = false;
    await this.store.update(sessionId, session);
    await this.store.delete(sessionId);
    this.untrackSession(session);

    logger.info("Session invalidated", { sessionId, userId: session.userId });
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    const sessions = await this.store.findByUser(userId);
    await Promise.all(
      sessions.map((session) => this.invalidateSession(session.sessionId)),
    );
    logger.info("All user sessions invalidated", {
      userId,
      sessionCount: sessions.length,
    });
  }

  private async cleanupInactiveSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const sessionId of Array.from(this.activeSessionIds)) {
      const session = await this.store.find(sessionId);
      if (!session) {
        this.activeSessionIds.delete(sessionId);
        continue;
      }

      if (
        !session.isActive ||
        now - session.lastActivity > this.SESSION_TIMEOUT ||
        now - session.createdAt > this.ABSOLUTE_TIMEOUT
      ) {
        expiredSessions.push(sessionId);
      }
    }

    await Promise.all(expiredSessions.map((id) => this.invalidateSession(id)));

    if (expiredSessions.length > 0) {
      logger.debug("Cleaned up inactive sessions", {
        removedCount: expiredSessions.length,
      });
    }
  }

  private trackSession(session: SessionRecord): void {
    this.activeSessionIds.add(session.sessionId);
    this.activeUsers.set(
      session.userId,
      (this.activeUsers.get(session.userId) ?? 0) + 1,
    );
  }

  private untrackSession(session: SessionRecord): void {
    this.activeSessionIds.delete(session.sessionId);

    const userCount = this.activeUsers.get(session.userId) ?? 0;
    if (userCount <= 1) {
      this.activeUsers.delete(session.userId);
    } else {
      this.activeUsers.set(session.userId, userCount - 1);
    }
  }

  getSessionStats(): { activeSessions: number; totalUsers: number } {
    return {
      activeSessions: this.activeSessionIds.size,
      totalUsers: this.activeUsers.size,
    };
  }
}

const defaultSessionStore = createSessionStore();
export const sessionManager = new SessionManager(defaultSessionStore);

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticate user with real user database integration
 * This will be replaced with actual database queries in production
 */
export const authenticateUser = async (
  username: string,
  password: string,
): Promise<{ userId: string; role: UserRole } | null> => {
  try {
    // TODO: Replace with actual database integration
    // const user = await userService.findByUsername(username);
    // if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
    //   return null;
    // }
    // return { userId: user.id, role: user.role };

    logger.warn("Authentication service not implemented", { username });
    return null;
  } catch (error) {
    logger.error("Authentication error", {
      error: (error as Error).message,
      username,
    });
    return null;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: "Bad Request",
        message: "Username and password are required",
      });
      return;
    }

    const authResult = await authenticateUser(username, password);
    if (!authResult) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid credentials" });
      return;
    }

    const sessionId = await sessionManager.createSession(
      authResult.userId,
      authResult.role,
    );
    const accessToken = generateToken(
      authResult.userId,
      authResult.role,
      sessionId,
    );
    const refreshToken = generateToken(
      authResult.userId,
      authResult.role,
      sessionId,
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionId,
      user: { userId: authResult.userId, role: authResult.role },
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (error) {
    logger.error("Login error", { error: (error as Error).message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication service unavailable",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.sessionId) {
      await sessionManager.invalidateSession(req.user.sessionId);
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Logout error", { error: (error as Error).message });
    res.status(500).json({
      error: "Internal Server Error",
      message: "Logout service unavailable",
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res
        .status(400)
        .json({ error: "Bad Request", message: "Refresh token is required" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
    const decoded = jwt.verify(refreshToken, jwtSecret) as JWTPayload;

    if (
      !(await sessionManager.validateSession(decoded.sessionId, decoded.jti))
    ) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "Invalid or expired session" });
      return;
    }

    const newAccessToken = generateToken(
      decoded.userId,
      decoded.role,
      decoded.sessionId,
    );
    const newRefreshToken = generateToken(
      decoded.userId,
      decoded.role,
      decoded.sessionId,
    );

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (error) {
    logger.error("Token refresh error", { error: (error as Error).message });
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid refresh token" });
  }
};

/**
 * JWT Token Authentication Middleware
 * Parses JWT token and sets req.user
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "Access token required" });
      return;
    }

    // Development mode: Accept mock token with LIMITED permissions
    if (
      process.env.NODE_ENV === "development" &&
      token === "mock-dev-token-lemnix-2025"
    ) {
      req.user = {
        userId: "dev-user-123",
        role: "planner" as UserRole, // ⚠️ ADMIN yerine PLANNER
        sessionId: "dev-session-123",
        permissions: [
          Permission.VIEW_CUTTING_PLANS,
          Permission.VIEW_OPTIMIZATION_RESULTS,
          Permission.START_OPTIMIZATION,
        ], // ⚠️ Sınırlı yetkiler
        tokenId: "dev-token-123",
      };
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "default-secret-key";
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Set user info on request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      sessionId: decoded.sessionId,
      permissions: [], // TODO: Implement permissions from JWT or database
      tokenId: decoded.jti,
    };

    next();
  } catch (error) {
    logger.error("Token authentication error", {
      error: (error as Error).message,
    });
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid or expired token" });
  }
};

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  // Development mode: Skip session validation for mock token
  if (
    process.env.NODE_ENV === "development" &&
    req.user.userId === "dev-user-123"
  ) {
    next();
    return;
  }

  try {
    const isValid = await sessionManager.validateSession(
      req.user.sessionId,
      req.user.tokenId,
    );

    if (!isValid) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "Session expired or invalid" });
      return;
    }

    next();
  } catch (error) {
    logger.error("Session validation error", {
      error: (error as Error).message,
    });
    res
      .status(500)
      .json({
        error: "Internal Server Error",
        message: "Session validation failed",
      });
  }
};
