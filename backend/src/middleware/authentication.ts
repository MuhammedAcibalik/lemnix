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
  InMemorySessionStore,
  SessionRecord,
  SessionStore,
} from "./sessionStore";
import { RedisSessionStore } from "./sessionStore/RedisSessionStore";
import { UserService } from "../services/user/UserService";

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

class SessionManager {
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly activeSessionIds = new Set<string>();
  private readonly activeUsers = new Map<string, number>();

  constructor(
    private readonly store: SessionStore = new InMemorySessionStore(),
  ) {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupInactiveSessions();
      },
      5 * 60 * 1000,
    );
  }

  createSession(userId: string, role: UserRole): string {
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

    this.store.create(session);
    this.activeSessionIds.add(sessionId);
    this.activeUsers.set(userId, (this.activeUsers.get(userId) ?? 0) + 1);

    logger.info("Session created", { sessionId, userId, role });
    return sessionId;
  }

  validateSession(sessionId: string, tokenId: string): boolean {
    const session = this.store.find(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    const now = Date.now();

    if (
      now - session.lastActivity > this.SESSION_TIMEOUT ||
      now - session.createdAt > this.ABSOLUTE_TIMEOUT
    ) {
      this.invalidateSession(sessionId);
      return false;
    }

    session.lastActivity = now;
    session.tokenIds.add(tokenId);
    this.store.update(sessionId, session);
    return true;
  }

  invalidateSession(sessionId: string): void {
    const session = this.store.find(sessionId);
    if (!session) {
      return;
    }

    session.isActive = false;
    this.store.update(sessionId, session);
    this.store.delete(sessionId);
    this.activeSessionIds.delete(sessionId);

    const userCount = this.activeUsers.get(session.userId) ?? 0;
    if (userCount <= 1) {
      this.activeUsers.delete(session.userId);
    } else {
      this.activeUsers.set(session.userId, userCount - 1);
    }

    logger.info("Session invalidated", { sessionId, userId: session.userId });
  }

  invalidateUserSessions(userId: string): void {
    const sessions = this.store.findByUser(userId);
    sessions.forEach((session) => this.invalidateSession(session.sessionId));
    logger.info("All user sessions invalidated", {
      userId,
      sessionCount: sessions.length,
    });
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const sessionId of Array.from(this.activeSessionIds)) {
      const session = this.store.find(sessionId);
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

    expiredSessions.forEach((id) => this.invalidateSession(id));

    if (expiredSessions.length > 0) {
      logger.debug("Cleaned up inactive sessions", {
        removedCount: expiredSessions.length,
      });
    }
  }

  getSessionStats(): { activeSessions: number; totalUsers: number } {
    return {
      activeSessions: this.activeSessionIds.size,
      totalUsers: this.activeUsers.size,
    };
  }
}

/**
 * Create session store based on environment variable
 * Production requires Redis, development can use in-memory fallback
 */
function createSessionStore(): SessionStore {
  const isProduction = process.env.NODE_ENV === "production";
  const storeType = process.env.SESSION_STORE || (isProduction ? "redis" : "memory");

  if (storeType === "redis" || isProduction) {
    try {
      // Check Redis connection
      const { isRedisConnected } = require("../config/redis");
      if (!isRedisConnected() && isProduction) {
        logger.error(
          "Redis is required for production session store. Application cannot start without Redis.",
        );
        throw new Error(
          "Redis connection failed. Production requires Redis for session management.",
        );
      }
      logger.info("Using Redis session store");
      return new RedisSessionStore();
    } catch (error) {
      if (isProduction) {
        logger.error(
          "Redis is required for production session store. Application cannot start without Redis.",
          error as Error,
        );
        throw new Error(
          "Redis connection failed. Production requires Redis for session management.",
        );
      }
      logger.warn(
        "Redis session store failed, falling back to in-memory store",
        { error: (error as Error).message },
      );
      return new InMemorySessionStore();
    }
  }

  logger.info("Using in-memory session store");
  return new InMemorySessionStore();
}

export const sessionManager = new SessionManager(createSessionStore());

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * User service instance for authentication
 */
const userService = new UserService();

/**
 * Authenticate user with real user database integration
 * Uses UserService to verify credentials against database
 */
export const authenticateUser = async (
  username: string,
  password: string,
): Promise<{ userId: string; role: UserRole } | null> => {
  try {
    // Use email as username (username field accepts email)
    const authenticatedUser = await userService.authenticateUser(
      username,
      password,
    );

    if (!authenticatedUser) {
      return null;
    }

    return {
      userId: authenticatedUser.userId,
      role: authenticatedUser.role,
    };
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

    const sessionId = sessionManager.createSession(
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

export const logout = (req: Request, res: Response): void => {
  try {
    if (req.user?.sessionId) {
      sessionManager.invalidateSession(req.user.sessionId);
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

export const refreshToken = (req: Request, res: Response): void => {
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

    if (!sessionManager.validateSession(decoded.sessionId, decoded.jti)) {
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

    // Set user context for Prisma security middleware
    const { setUserContext } = await import("./prismaSecurity");
    setUserContext({
      userId: decoded.userId,
      role: decoded.role,
      permissions: [],
    });

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

export const validateSession = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  if (!sessionManager.validateSession(req.user.sessionId, req.user.tokenId)) {
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Session expired or invalid" });
    return;
  }

  next();
};
