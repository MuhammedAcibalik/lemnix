/**
 * @fileoverview Smart Suggestions Controller
 * @module SmartSuggestionsController
 * @version 1.0.0
 * @description Handles all smart suggestion-related endpoints
 * Extracted from cuttingListController to follow Single Responsibility Principle
 */

import { Request, Response } from "express";
import { UnifiedSuggestionService } from "../services/suggestions/UnifiedSuggestionService";
import { logger } from "../services/logger";

/**
 * Get smart product suggestions
 * @deprecated Use /api/suggestions/products instead
 */
export const getSmartProductSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    logger.info(
      `[REQ-${requestId}] [DEPRECATED] Getting smart product suggestions - Use /api/suggestions/products`,
    );

    const { query = "", limit = 10 } = req.query;

    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProductSuggestions(
      query as string,
      parseInt(limit as string, 10),
    );

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
  } catch (error) {
    logger.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get product suggestions",
    });
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
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    logger.info(
      `[REQ-${requestId}] [DEPRECATED] Getting smart size suggestions - Use /api/suggestions/sizes`,
    );

    const { productName, query = "", limit = 10 } = req.query;

    if (!productName) {
      res.status(400).json({ success: false, error: "Product name required" });
      return;
    }

    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getSizeSuggestions(
      productName as string,
      query as string,
      parseInt(limit as string, 10),
    );

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
    res.setHeader("X-Deprecation-Notice", "Use /api/suggestions/sizes instead");
    res.json(legacyFormat);
  } catch (error) {
    logger.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get size suggestions",
    });
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
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    logger.info(
      `[REQ-${requestId}] [DEPRECATED] Getting smart profile suggestions - Use /api/suggestions/profiles`,
    );

    const { productName, size, query = "", limit = 10 } = req.query;

    if (!productName || !size) {
      res
        .status(400)
        .json({ success: false, error: "Product name and size required" });
      return;
    }

    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProfileSuggestions(
      productName as string,
      size as string,
      query as string,
      parseInt(limit as string, 10),
    );

    const legacyFormat = {
      success: true,
      data: suggestions.map((s) => ({
        profile: s.profile,
        measurement: s.measurement,
        quantity: s.suggestedQuantity,
        confidence: s.confidence,
        frequency: 0, // Not available in new service
      })),
    };

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/profiles instead",
    );
    res.json(legacyFormat);
  } catch (error) {
    logger.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get profile suggestions",
    });
  }
};

/**
 * Get autocomplete suggestions
 */
export const getAutoCompleteSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    logger.info(`[REQ-${requestId}] Getting autocomplete suggestions`);

    const { field, query = "", limit = 10 } = req.query;

    if (!field) {
      res
        .status(400)
        .json({ success: false, error: "Field parameter required" });
      return;
    }

    const suggestionService = UnifiedSuggestionService.getInstance();
    let suggestions;

    switch (field) {
      case "product":
        suggestions = await suggestionService.getProductSuggestions(
          query as string,
          parseInt(limit as string, 10),
        );
        break;
      case "size": {
        const productName = req.query.productName as string;
        if (!productName) {
          res.status(400).json({
            success: false,
            error: "Product name required for size suggestions",
          });
          return;
        }
        suggestions = await suggestionService.getSizeSuggestions(
          productName,
          query as string,
          parseInt(limit as string, 10),
        );
        break;
      }
      case "profile": {
        const product = req.query.productName as string;
        const size = req.query.size as string;
        if (!product || !size) {
          res.status(400).json({
            success: false,
            error: "Product name and size required for profile suggestions",
          });
          return;
        }
        suggestions = await suggestionService.getProfileSuggestions(
          product,
          size,
          query as string,
          parseInt(limit as string, 10),
        );
        break;
      }
      default:
        res
          .status(400)
          .json({ success: false, error: "Invalid field parameter" });
        return;
    }

    res.json({ success: true, data: suggestions });
  } catch (error) {
    logger.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get autocomplete suggestions",
    });
  }
};

/**
 * Get smart suggestion statistics
 */
export const getSmartSuggestionStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    logger.info(`[REQ-${requestId}] Getting smart suggestion statistics`);

    const suggestionService = UnifiedSuggestionService.getInstance();
    const stats = await suggestionService.getStatistics();

    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get suggestion statistics",
    });
  }
};

/**
 * Reload smart suggestion database
 */
export const reloadSmartSuggestionDatabase = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    logger.info(`[REQ-${requestId}] Reloading smart suggestion database`);

    // Note: UnifiedSuggestionService doesn't have a rebuild method
    // It uses PostgreSQL and doesn't need explicit rebuilding
    res.json({
      success: true,
      message: "Database is continuously updated from PostgreSQL",
    });
  } catch (error) {
    logger.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to reload suggestion database",
    });
  }
};
