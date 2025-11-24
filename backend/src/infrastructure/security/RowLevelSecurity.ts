/**
 * Row-Level Security
 *
 * Filters data based on user permissions
 *
 * @module infrastructure/security/RowLevelSecurity
 * @version 1.0.0
 */

import { Prisma } from "@prisma/client";
import { logger } from "../../services/logger";

export interface UserContext {
  readonly userId: string;
  readonly role?: string;
  readonly permissions?: readonly string[];
}

/**
 * Row-Level Security Helper
 */
export class RowLevelSecurity {
  /**
   * Add user filter to Prisma where clause for CuttingList
   */
  public static addCuttingListUserFilter(
    where: Prisma.CuttingListWhereInput,
    userContext: UserContext,
  ): Prisma.CuttingListWhereInput {
    // Always filter by userId for cutting lists
    return {
      ...where,
      userId: userContext.userId,
    };
  }

  /**
   * Add user filter to Prisma where clause for ProductionPlan
   */
  public static addProductionPlanUserFilter(
    where: Prisma.ProductionPlanWhereInput,
    userContext: UserContext,
  ): Prisma.ProductionPlanWhereInput {
    // Production plans might be shared, but we can add user-based filtering if needed
    // For now, return as-is (can be extended based on business rules)
    return where;
  }

  /**
   * Check if user can access cutting list
   */
  public static canAccessCuttingList(
    cuttingListUserId: string,
    userContext: UserContext,
  ): boolean {
    // User can only access their own cutting lists (unless admin)
    if (userContext.role === "admin") {
      return true;
    }
    return cuttingListUserId === userContext.userId;
  }

  /**
   * Check if user can modify cutting list
   */
  public static canModifyCuttingList(
    cuttingListUserId: string,
    userContext: UserContext,
  ): boolean {
    // User can only modify their own cutting lists (unless admin)
    if (userContext.role === "admin") {
      return true;
    }
    return cuttingListUserId === userContext.userId;
  }

  /**
   * Check if user can delete cutting list
   */
  public static canDeleteCuttingList(
    cuttingListUserId: string,
    userContext: UserContext,
  ): boolean {
    // User can only delete their own cutting lists (unless admin)
    if (userContext.role === "admin") {
      return true;
    }
    return cuttingListUserId === userContext.userId;
  }

  /**
   * Log security violation attempt
   */
  public static logSecurityViolation(
    action: string,
    userContext: UserContext,
    resourceId: string,
    reason: string,
  ): void {
    logger.warn("Security violation attempt detected", {
      action,
      userId: userContext.userId,
      role: userContext.role,
      resourceId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}
