/**
 * User Repository
 * Database operations for User entity
 *
 * @module repositories/UserRepository
 * @version 1.0.0
 */

import { PrismaClient, User } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { logger } from "../services/logger";

/**
 * User Repository
 * Handles all database operations for User entity
 */
export class UserRepository extends BaseRepository {
  constructor(client?: PrismaClient) {
    super(client);
  }

  /**
   * Find user by email
   * @param email - User email address
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      logger.error("Failed to find user by email", {
        error: (error as Error).message,
        email,
      });
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      logger.error("Failed to find user by ID", {
        error: (error as Error).message,
        id,
      });
      throw error;
    }
  }

  /**
   * Create new user
   * @param data - User data
   * @returns Created user
   */
  async create(data: {
    email: string;
    name?: string;
    password: string;
    role?: string;
  }): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: data.password, // Should be hashed before calling this method
          role: data.role || "planner",
          isActive: true,
        },
      });
      return user;
    } catch (error) {
      logger.error("Failed to create user", {
        error: (error as Error).message,
        email: data.email,
      });
      throw error;
    }
  }

  /**
   * Update user
   * @param id - User ID
   * @param data - Partial user data
   * @returns Updated user
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      password: string;
      role: string;
      isActive: boolean;
      lastLogin: Date;
    }>,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return user;
    } catch (error) {
      logger.error("Failed to update user", {
        error: (error as Error).message,
        id,
      });
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   * @param id - User ID
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          lastLogin: new Date(),
        },
      });
    } catch (error) {
      logger.error("Failed to update last login", {
        error: (error as Error).message,
        id,
      });
      // Don't throw - this is not critical
    }
  }

  /**
   * Check if user exists by email
   * @param email - User email
   * @returns True if user exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email },
      });
      return count > 0;
    } catch (error) {
      logger.error("Failed to check if user exists", {
        error: (error as Error).message,
        email,
      });
      throw error;
    }
  }
}

