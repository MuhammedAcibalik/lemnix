/**
 * Test Helpers for Frontend Authentication
 * 
 * ⚠️ SECURITY: These helpers are ONLY for testing purposes.
 * Mock tokens are completely disabled in production code.
 * 
 * @module shared/utils/testHelpers
 */

/**
 * Set a mock auth token for testing
 * ⚠️ ONLY use in test files, never in production code
 * 
 * @param token - Mock token to set (will be prefixed with "mock-test-")
 */
export function setMockAuthToken(token?: string): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  
  const mockToken = token || `mock-test-token-${Date.now()}`;
  localStorage.setItem("auth_token", mockToken);
}

/**
 * Clear auth token (for test cleanup)
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  
  localStorage.removeItem("auth_token");
}

/**
 * Get current auth token (for test assertions)
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }
  
  return localStorage.getItem("auth_token");
}

