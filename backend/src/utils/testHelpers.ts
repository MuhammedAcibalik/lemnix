/**
 * Test Helpers
 * Utility functions for testing, including mock authentication tokens
 * 
 * @module utils/testHelpers
 * @description Mock token helpers for testing purposes only
 * SECURITY: These should NEVER be used in production code
 */

import { UserRole, Permission } from "../middleware/authorization";

/**
 * Mock token for testing purposes
 * SECURITY WARNING: Only use in test environment
 */
export const MOCK_TEST_TOKEN = "mock-test-token-lemnix-2025";

/**
 * Create mock user object for testing
 * SECURITY WARNING: Only use in test environment
 */
export function createMockTestUser(overrides?: {
  userId?: string;
  role?: UserRole;
  permissions?: Permission[];
}): {
  userId: string;
  role: UserRole;
  sessionId: string;
  permissions: Permission[];
  tokenId: string;
} {
  return {
    userId: overrides?.userId || "test-user-123",
    role: overrides?.role || UserRole.PLANNER,
    sessionId: "test-session-123",
    permissions: overrides?.permissions || [
      Permission.VIEW_CUTTING_PLANS,
      Permission.VIEW_OPTIMIZATION_RESULTS,
      Permission.START_OPTIMIZATION,
    ],
    tokenId: "test-token-123",
  };
}

/**
 * Create mock admin user for testing
 * SECURITY WARNING: Only use in test environment
 */
export function createMockAdminUser(): {
  userId: string;
  role: UserRole;
  sessionId: string;
  permissions: Permission[];
  tokenId: string;
} {
  return {
    userId: "test-admin-123",
    role: UserRole.ADMIN,
    sessionId: "test-admin-session-123",
    permissions: Object.values(Permission),
    tokenId: "test-admin-token-123",
  };
}

