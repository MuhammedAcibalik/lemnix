/**
 * Authentication Utilities
 * Password hashing and verification with bcrypt
 *
 * @module utils/auth
 * @version 1.0.0
 */

import bcrypt from "bcryptjs";

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // High security (2^12 iterations)
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random secure password
 * @param length - Password length (default 16)
 * @returns Random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
