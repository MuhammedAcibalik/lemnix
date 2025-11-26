/**
 * Prisma Security Middleware
 * Automatic Row-Level Security (RLS) using Prisma Middleware
 * 
 * Automatically filters queries by userId to prevent data leakage
 * 
 * @module middleware/prismaSecurity
 * @version 1.0.0
 */

import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { logger } from "../services/logger";

/**
 * User context interface
 */
export interface UserContext {
  readonly userId: string;
  readonly role?: string;
  readonly permissions?: readonly string[];
}

/**
 * Global user context storage
 * This is set per-request via middleware
 */
let currentUserContext: UserContext | null = null;

/**
 * Set user context for current request
 * Call this in authentication middleware before Prisma queries
 */
export function setUserContext(context: UserContext | null): void {
  currentUserContext = context;
}

/**
 * Get current user context
 */
export function getUserContext(): UserContext | null {
  return currentUserContext;
}

/**
 * Check if user is admin
 */
function isAdmin(userContext: UserContext | null): boolean {
  return userContext?.role === "admin" || userContext?.role === "superadmin";
}

/**
 * Models that require user filtering
 */
const userFilteredModels = [
  'cuttingList',
  'optimization',
  'productionPlan',
] as const;

/**
 * Initialize Prisma security middleware
 * This middleware automatically adds userId filter to queries
 */
export function initializePrismaSecurityMiddleware(): void {
  prisma.$use(async (params, next) => {
    const userContext = getUserContext();

    // Skip filtering for admin users
    if (isAdmin(userContext)) {
      return next(params);
    }

    // Skip if no user context (public endpoints, etc.)
    if (!userContext) {
      return next(params);
    }

    // Apply user filtering to specific models
    if (userFilteredModels.includes(params.model as any)) {
      if (params.action === 'findMany' || params.action === 'findFirst') {
        // Add userId filter to where clause
        params.args.where = {
          ...params.args.where,
          userId: userContext.userId,
        };
      } else if (params.action === 'findUnique') {
        // For findUnique, we need to check userId after fetching
        const result = await next(params);
        if (result && result.userId !== userContext.userId) {
          logger.warn("Security violation: User attempted to access another user's resource", {
            userId: userContext.userId,
            resourceId: result.id,
            model: params.model,
          });
          return null;
        }
        return result;
      } else if (params.action === 'create') {
        // Ensure userId is set on create
        params.args.data = {
          ...params.args.data,
          userId: userContext.userId,
        };
      } else if (params.action === 'update' || params.action === 'updateMany') {
        // Ensure userId filter is added to where clause
        params.args.where = {
          ...params.args.where,
          userId: userContext.userId,
        };
      } else if (params.action === 'delete' || params.action === 'deleteMany') {
        // Ensure userId filter is added to where clause
        params.args.where = {
          ...params.args.where,
          userId: userContext.userId,
        };
      }
    }

    return next(params);
  });

  logger.info("Prisma security middleware initialized", {
    filteredModels: userFilteredModels,
  });
}

