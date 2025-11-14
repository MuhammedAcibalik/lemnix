import { Request } from "express";
import jwt from "jsonwebtoken";

import { JWTPayload } from "../middleware/authorization";
import { logger } from "../services/logger";

export interface RequestUserContext {
  readonly userId?: string;
  readonly anonymousUserId?: string;
}

const JWT_SECRET = process.env["JWT_SECRET"] || "default-secret-key";

function normalizeAnonymousId(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Extract user identifiers from the incoming request.
 *
 * 1. Prefer the authenticated user injected by the verifyToken middleware.
 * 2. If the middleware is not in use, attempt to validate the JWT manually.
 * 3. Fall back to optional anonymous identifiers supplied via header or body.
 */
export function resolveRequestUserContext(req: Request): RequestUserContext {
  const middlewareUserId = (req as { user?: { userId?: string } }).user?.userId;

  const anonymousFromBody = normalizeAnonymousId(req.body?.anonymousUserId);
  const anonymousFromHeader = normalizeAnonymousId(
    req.headers["x-anonymous-user-id"],
  );

  const anonymousUserId = anonymousFromBody ?? anonymousFromHeader;

  if (middlewareUserId) {
    return { userId: middlewareUserId, anonymousUserId };
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as Partial<JWTPayload>;
      const decodedUserId =
        typeof decoded.userId === "string" && decoded.userId.trim().length > 0
          ? decoded.userId.trim()
          : undefined;

      if (decodedUserId) {
        return { userId: decodedUserId, anonymousUserId };
      }
    } catch (error) {
      logger.warn("Optional JWT extraction failed", {
        error: (error as Error).message,
        path: req.path,
        method: req.method,
      });
    }
  }

  return { anonymousUserId };
}
