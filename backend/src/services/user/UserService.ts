/**
 * User Service
 * Business logic for user authentication and management
 *
 * @module services/user/UserService
 * @version 1.0.0
 */

import { User } from "@prisma/client";
import { UserRepository } from "../../repositories/UserRepository";
import { hashPassword, verifyPassword } from "../../utils/auth";
import { logger } from "../logger";
import { UserRole } from "../../middleware/authorization";

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  email: string;
  name: string | null;
}

/**
 * User Service
 * Handles user authentication and management business logic
 */
export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * Authenticate user with email and password
   * @param email - User email
   * @param password - Plain text password
   * @returns Authenticated user info or null if invalid credentials
   */
  async authenticateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        logger.warn("Authentication failed: User not found", { email });
        return null;
      }

      if (!user.isActive) {
        logger.warn("Authentication failed: User is inactive", {
          email,
          userId: user.id,
        });
        return null;
      }

      if (!user.password) {
        logger.warn("Authentication failed: User has no password", {
          email,
          userId: user.id,
        });
        return null;
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        logger.warn("Authentication failed: Invalid password", {
          email,
          userId: user.id,
        });
        return null;
      }

      // Update last login timestamp
      await this.userRepository.updateLastLogin(user.id).catch((error) => {
        logger.error("Failed to update last login", {
          error: (error as Error).message,
          userId: user.id,
        });
        // Don't fail authentication if this fails
      });

      logger.info("User authenticated successfully", {
        email,
        userId: user.id,
        role: user.role,
      });

      return {
        userId: user.id,
        role: user.role as UserRole,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      logger.error("Authentication error", {
        error: (error as Error).message,
        email,
      });
      return null;
    }
  }

  /**
   * Create new user with hashed password
   * @param data - User data
   * @returns Created user (without password)
   */
  async createUser(data: {
    email: string;
    name?: string;
    password: string;
    role?: string;
  }): Promise<Omit<User, "password">> {
    try {
      // Check if user already exists
      const exists = await this.userRepository.existsByEmail(data.email);
      if (exists) {
        throw new Error(`User with email ${data.email} already exists`);
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error("Failed to create user", {
        error: (error as Error).message,
        email: data.email,
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param id - User ID
   * @returns User (without password) or null
   */
  async getUserById(id: string): Promise<Omit<User, "password"> | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return null;
      }
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error("Failed to get user by ID", {
        error: (error as Error).message,
        id,
      });
      throw error;
    }
  }

  /**
   * Update user password
   * @param userId - User ID
   * @param newPassword - New plain text password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await hashPassword(newPassword);
      await this.userRepository.update(userId, {
        password: hashedPassword,
      });
      logger.info("Password updated successfully", { userId });
    } catch (error) {
      logger.error("Failed to update password", {
        error: (error as Error).message,
        userId,
      });
      throw error;
    }
  }
}

