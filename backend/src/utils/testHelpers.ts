/**
 * Test Helpers for Authentication
 * 
 * ⚠️ SECURITY: These helpers are ONLY for testing purposes.
 * Mock tokens are completely disabled in production code.
 * 
 * @module utils/testHelpers
 */

import { UserRole, Permission } from "../middleware/authorization";

/**
 * Create a mock user object for testing
 * ⚠️ ONLY use in test files, never in production code
 */
export function createMockUser(overrides?: {
  userId?: string;
  role?: UserRole;
  sessionId?: string;
  permissions?: Permission[];
  tokenId?: string;
}) {
  return {
    userId: overrides?.userId || "test-user-id",
    role: overrides?.role || UserRole.ADMIN,
    sessionId: overrides?.sessionId || "test-session-id",
    permissions: overrides?.permissions || Object.values(Permission),
    tokenId: overrides?.tokenId || "test-token-id",
  };
}

/**
 * Create a mock JWT token payload for testing
 * ⚠️ ONLY use in test files, never in production code
 */
export function createMockJWTPayload(overrides?: {
  userId?: string;
  role?: UserRole;
  sessionId?: string;
  permissions?: Permission[];
  jti?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    userId: overrides?.userId || "test-user-id",
    role: overrides?.role || UserRole.ADMIN,
    sessionId: overrides?.sessionId || "test-session-id",
    permissions: overrides?.permissions || Object.values(Permission),
    iat: now,
    exp: now + 3600, // 1 hour
    jti: overrides?.jti || "test-token-id",
  };
}
