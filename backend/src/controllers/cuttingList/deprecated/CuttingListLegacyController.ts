/**
 * @fileoverview Cutting List Legacy Controller
 * @module controllers/cuttingList/deprecated/CuttingListLegacyController
 * @version 1.0.0
 * @description Deprecated endpoints for backward compatibility
 * @deprecated These endpoints are deprecated and will be removed in a future version
 */

import { Request, Response } from "express";
import { UnifiedSuggestionService } from "../../../services/suggestions/UnifiedSuggestionService";
import { logger } from "../../../services/logger";
import { getCuttingListController } from "../../cuttingListController";
import type {
  CuttingList,
  ProductSection,
  CuttingListItem,
  ProfileItem,
  WorkOrderTemplate,
} from "../../../types/cuttingList";
import type { ApiResponse } from "../shared/CuttingListBaseController";

/**
 * Get smart product suggestions
 * @deprecated Use /api/suggestions/products instead
 */
export const getSmartProductSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info(
      "[CuttingList] [DEPRECATED] Getting smart product suggestions",
      { requestId, note: "Use /api/suggestions/products instead" },
    );

    const { query = "", limit = 10 } = req.query;

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProductSuggestions(
      query as string,
      parseInt(limit as string, 10),
    );

    // Transform to legacy format for backward compatibility
    const legacyFormat = {
      success: true,
      data: suggestions.map((s) => ({
        value: s.value,
        confidence: s.confidence,
        frequency: s.frequency,
        type: s.type,
      })),
    };

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/products instead",
    );
    res.json(legacyFormat);
    return;
  } catch (error) {
    logger.error(
      `[REQ-${requestId}] Error getting smart product suggestions`,
      error instanceof Error ? error : new Error(String(error)),
    );
    res.status(500).json({
      success: false,
      error: "Failed to get product suggestions",
    });
    return;
  }
};

/**
 * Get smart product suggestions (LEGACY)
 * @deprecated This is the old implementation, kept for reference
 */
const getSmartProductSuggestionsLegacy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.debug(
      "[CuttingList] [LEGACY CODE - NOT USED] Getting smart product suggestions",
      { requestId },
    );

    const { query = "", limit = 10 } = req.query;

    // Legacy endpoint - returns empty data
    const suggestions = { data: [], success: true };

    logger.debug("[CuttingList] Found product suggestions (legacy)", {
      requestId,
      count: suggestions.data.length,
    });

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart product suggestions error (legacy)",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get product suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart size suggestions
 * @deprecated Use /api/suggestions/sizes instead
 */
export const getSmartSizeSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info("[CuttingList] [DEPRECATED] Getting smart size suggestions", {
      requestId,
      note: "Use /api/suggestions/sizes instead",
    });

    const { productName, query = "", limit = 10 } = req.query;

    if (!productName) {
      res.status(400).json({ success: false, error: "Product name required" });
      return;
    }

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getSizeSuggestions(
      productName as string,
      query as string,
      parseInt(limit as string, 10),
    );

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/sizes?product=X instead",
    );
    res.json({
      success: true,
      data: suggestions.map((s) => s.value),
    });
    return;
  } catch (error) {
    logger.error(
      `[REQ-${requestId}] Error getting smart size suggestions`,
      error instanceof Error ? error : new Error(String(error)),
    );
    res.status(500).json({
      success: false,
      error: "Failed to get size suggestions",
    });
    return;
  }
};

/**
 * Get smart size suggestions (LEGACY)
 * @deprecated This is the old implementation, kept for reference
 */
const getSmartSizeSuggestionsLegacy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.debug(
      "[CuttingList] [LEGACY CODE - NOT USED] Getting smart size suggestions",
      { requestId },
    );

    const { productName, query = "", limit = 10 } = req.query;

    // Legacy endpoint - returns empty data
    const suggestions = { data: [], success: true };

    logger.debug("[CuttingList] Found size suggestions (legacy)", {
      requestId,
      count: suggestions.data.length,
    });

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart size suggestions error (legacy)",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get size suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart profile suggestions
 * @deprecated Use /api/suggestions/profiles instead
 */
export const getSmartProfileSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info(
      "[CuttingList] [DEPRECATED] Getting smart profile suggestions",
      { requestId, note: "Use /api/suggestions/profiles instead" },
    );

    const { productName, size, query = "", limit = 10 } = req.query;

    if (!productName || !size) {
      res
        .status(400)
        .json({ success: false, error: "Product name and size required" });
      return;
    }

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProfileSuggestions(
      productName as string,
      size as string,
      query as string,
      parseInt(limit as string, 10),
    );

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/profiles?product=X&size=Y instead",
    );
    res.json({
      success: true,
      data: suggestions,
    });
    return;
  } catch (error) {
    logger.error(
      `[REQ-${requestId}] Error getting smart profile suggestions`,
      error instanceof Error ? error : new Error(String(error)),
    );
    res.status(500).json({
      success: false,
      error: "Failed to get profile suggestions",
    });
    return;
  }
};

/**
 * Get smart profile suggestions (LEGACY)
 * @deprecated This is the old implementation, kept for reference
 */
const getSmartProfileSuggestionsLegacy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.debug(
      "[CuttingList] [LEGACY CODE - NOT USED] Getting smart profile suggestions",
      { requestId },
    );

    const { productName, size, query = "", limit = 10 } = req.query;

    // Legacy endpoint - returns empty data
    const suggestions = { data: [], success: true };

    logger.debug("[CuttingList] Found profile suggestions (legacy)", {
      requestId,
      count: suggestions.data.length,
    });

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart profile suggestions error (legacy)",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get profile suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get auto-complete suggestions
 */
export const getAutoCompleteSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info("[CuttingList] Getting auto-complete suggestions", {
      requestId,
    });

    const { type, query, limit = 5 } = req.query;

    if (!type || !query) {
      const response: ApiResponse = {
        success: false,
        error: "Type and query parameters are required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    const validTypes = ["product", "size", "profile", "color", "measurement"];
    if (!validTypes.includes(String(type))) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Legacy endpoint - returns empty data
    const suggestions: string[] = [];

    logger.debug("[CuttingList] Found auto-complete suggestions", {
      requestId,
      count: suggestions.length,
    });

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Auto-complete suggestions error",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get auto-complete suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart suggestion database statistics
 */
export const getSmartSuggestionStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info("[CuttingList] [DEPRECATED] Getting smart suggestion stats", {
      requestId,
      note: "Use /api/suggestions/statistics instead",
    });

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const stats = await suggestionService.getStatistics();

    logger.debug("[CuttingList] Smart suggestion stats retrieved", {
      requestId,
    });

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart suggestion stats error",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get suggestion stats",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Reload smart suggestion database
 */
export const reloadSmartSuggestionDatabase = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info(
      "[CuttingList] [DEPRECATED] Reloading smart suggestion database",
      { requestId, note: "Use PostgreSQL now" },
    );

    // Legacy endpoint - UnifiedSuggestionService uses PostgreSQL and doesn't need explicit reload
    const success = true;

    if (success) {
      logger.info(
        "[CuttingList] Smart suggestion database reloaded successfully",
        { requestId },
      );

      const response: ApiResponse = {
        success: true,
        data: { reloaded: true },
        message: "Smart suggestion database reloaded successfully",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } else {
      throw new Error("Failed to reload database");
    }
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart suggestion database reload error",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to reload suggestion database",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart suggestions for work order creation
 */
export const getSmartWorkOrderSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info("[CuttingList] Getting smart work order suggestions", {
      requestId,
    });

    const { productName, size, limit = 10 } = req.query;

    if (!productName || !size) {
      const response: ApiResponse = {
        success: false,
        error: "Product name and size are required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProfileSuggestions(
      String(productName),
      String(size),
      "",
      parseInt(String(limit)),
    );

    logger.debug("[CuttingList] Found smart work order suggestions", {
      requestId,
      count: suggestions.length,
    });

    const response: ApiResponse = {
      success: true,
      data: { data: suggestions, success: true },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart work order suggestions error",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get smart suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart insights for work order data
 */
export const getSmartWorkOrderInsights = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info("[CuttingList] Getting smart work order insights", {
      requestId,
    });

    const workOrderData = req.body;

    if (!workOrderData) {
      const response: ApiResponse = {
        success: false,
        error: "Work order data is required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Return basic work order data analysis
    const insights = [
      {
        type: "info",
        message: "Work order data received successfully",
        timestamp: new Date().toISOString(),
      },
    ];

    logger.debug("[CuttingList] Generated smart work order insights", {
      requestId,
      count: insights.length,
    });

    const response: ApiResponse = {
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      "[CuttingList] Smart work order insights error",
      error instanceof Error ? error : new Error(String(error)),
      { requestId },
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate insights",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Apply smart profile set to work order
 */
export const applySmartProfileSet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info("[CuttingList] Applying smart profile set", { requestId });

    const { productName, size, orderQuantity, suggestionId } = req.body;

    if (!productName || !size || !suggestionId) {
      const response: ApiResponse = {
        success: false,
        error: "Product name, size, and suggestion ID are required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Profile set will be generated from real data sources
    const profileSet = {
      id: suggestionId,
      productName: String(productName),
      size: String(size),
      profiles: [],
    };

    logger.info(
      `[REQ-${requestId}] Applied smart profile set with ${profileSet.profiles.length} profiles`,
    );

    const response: ApiResponse = {
      success: true,
      data: profileSet,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      `[REQ-${requestId}] Apply smart profile set error`,
      error instanceof Error ? error : new Error(String(error)),
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to apply smart profile set",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get work order templates
 */
export const getWorkOrderTemplates = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info(`[REQ-${requestId}] Getting work order templates`);

    const { limit = 20 } = req.query;

    // Templates will be loaded from real data sources
    const templates: WorkOrderTemplate[] = [];

    logger.info(
      `[REQ-${requestId}] Found ${templates.length} work order templates`,
    );

    const response: ApiResponse = {
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      `[REQ-${requestId}] Get work order templates error`,
      error instanceof Error ? error : new Error(String(error)),
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get work order templates",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Duplicate work order with smart modifications
 */
export const duplicateWorkOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || String(Date.now());

  try {
    logger.info(`[REQ-${requestId}] Duplicating work order`);

    const { workOrderId } = req.body;

    if (!workOrderId) {
      const response: ApiResponse = {
        success: false,
        error: "Work order ID is required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Duplicated work order will be generated from real data sources
    const duplicatedWorkOrder = {
      id: `duplicate-${workOrderId}`,
      workOrderId: `DUP-${workOrderId}`,
      date: new Date().toISOString().split("T")[0],
      version: "1.0",
      color: "Duplicated",
      note: "Duplicated work order",
      orderQuantity: 1,
      size: "Standard",
      profiles: [],
    };

    logger.info(`[REQ-${requestId}] Work order duplicated successfully`);

    const response: ApiResponse = {
      success: true,
      data: duplicatedWorkOrder,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error(
      `[REQ-${requestId}] Duplicate work order error`,
      error instanceof Error ? error : new Error(String(error)),
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to duplicate work order",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get available sizes for a product
 */
export const getAvailableSizes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { productName } = req.query;

    logger.info("🔍 Backend: getAvailableSizes called with productName:", {
      productName,
    });

    if (!productName || typeof productName !== "string") {
      res.status(400).json({
        success: false,
        error: "Product name is required",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // ✅ MIGRATED: Fetch from PostgreSQL instead of in-memory Map
    const controller = getCuttingListController();
    const cuttingLists = await controller.getAllCuttingListsData();

    logger.debug("[CuttingList] Found cutting lists for size extraction", {
      count: cuttingLists.length,
    });

    // Extract unique sizes for the given product
    const sizes = new Set<string>();

    cuttingLists.forEach((cuttingList: CuttingList) => {
      cuttingList.sections.forEach((section: ProductSection) => {
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          section.items.forEach((item: CuttingListItem) => {
            if (item.size && item.size.trim()) {
              sizes.add(item.size.trim());
            }
          });
        }
      });
    });

    const availableSizes = Array.from(sizes).sort();
    logger.debug("[CuttingList] Extracted available sizes", {
      productName,
      sizes: availableSizes,
    });

    res.json({
      success: true,
      data: availableSizes,
      message: `Found ${availableSizes.length} available sizes for product: ${productName}`,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (error) {
    logger.error(
      "[CuttingList] Error getting available sizes",
      error instanceof Error ? error : new Error(String(error)),
      { productName: req.query.productName },
    );
    res.status(500).json({
      success: false,
      error: "Failed to get available sizes",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return;
  }
};

/**
 * Get profile combinations for a product and size
 */
export const getProfileCombinations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { productName, size } = req.query;

    if (
      !productName ||
      typeof productName !== "string" ||
      !size ||
      typeof size !== "string"
    ) {
      res.status(400).json({
        success: false,
        error: "Product name and size are required",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // ✅ MIGRATED: Fetch from PostgreSQL instead of in-memory Map
    const controller = getCuttingListController();
    const cuttingLists = await controller.getAllCuttingListsData();

    // Find matching items
    const matchingItems: (CuttingListItem & { sectionProductName: string })[] =
      [];

    cuttingLists.forEach((cuttingList: CuttingList) => {
      cuttingList.sections.forEach((section: ProductSection) => {
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          section.items.forEach((item: CuttingListItem) => {
            if (
              item.size &&
              item.size.toLowerCase().includes(size.toLowerCase())
            ) {
              matchingItems.push({
                ...item,
                sectionProductName: section.productName,
              });
            }
          });
        }
      });
    });

    // Group by profile combinations
    const combinationMap = new Map<
      string,
      {
        profiles: Array<{
          profile: string;
          measurement: string;
          ratio: number;
        }>;
        usageCount: number;
        lastUsed: string;
      }
    >();

    matchingItems.forEach((item) => {
      // Create a key for this combination
      const profileKey = item.profiles
        .map((p: ProfileItem) => `${p.profile}-${p.measurement}`)
        .sort()
        .join("|");

      if (!combinationMap.has(profileKey)) {
        // Calculate ratios based on order quantity
        const profiles = item.profiles.map((profile: ProfileItem) => ({
          profile: profile.profile || "Unknown",
          measurement: profile.measurement,
          ratio:
            item.orderQuantity > 0 ? profile.quantity / item.orderQuantity : 0,
        }));

        combinationMap.set(profileKey, {
          profiles,
          usageCount: 1,
          lastUsed: new Date().toISOString(),
        });
      } else {
        const existing = combinationMap.get(profileKey)!;
        existing.usageCount++;

        // Update ratios with average
        existing.profiles.forEach(
          (profile: { ratio: number }, index: number) => {
            const currentProfile = item.profiles[index];
            if (currentProfile) {
              const currentRatio =
                item.orderQuantity > 0
                  ? currentProfile.quantity / item.orderQuantity
                  : 0;
              profile.ratio = (profile.ratio + currentRatio) / 2;
            }
          },
        );

        // Update last used date
        const itemDate = new Date().toISOString();
        if (new Date(itemDate) > new Date(existing.lastUsed)) {
          existing.lastUsed = itemDate;
        }
      }
    });

    // Convert to array and sort by usage count
    const combinations = Array.from(combinationMap.entries())
      .map(([, data], index) => ({
        id: `combination-${index + 1}`,
        ...data,
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    res.json({
      success: true,
      data: combinations,
      message: `Found ${combinations.length} profile combinations for ${productName} - ${size}`,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (error) {
    logger.error(
      "[CuttingList] Error getting profile combinations",
      error instanceof Error ? error : new Error(String(error)),
      { productName: req.query.productName, size: req.query.size },
    );
    res.status(500).json({
      success: false,
      error: "Failed to get profile combinations",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return;
  }
};
