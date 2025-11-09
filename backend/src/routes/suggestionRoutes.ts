/**
 * @fileoverview Consolidated Suggestion Routes
 * @module routes/suggestionRoutes
 * @version 1.0.0
 *
 * All suggestion endpoints under /api/suggestions/*
 * Replaces scattered endpoints in cuttingListRoutes
 */

import { Router, Request, Response } from "express";
import { UnifiedSuggestionService } from "../services/suggestions/UnifiedSuggestionService";
import { verifyToken } from "../middleware/authorization";
import { logger } from "../services/logger";

const router: Router = Router();
const suggestionService = UnifiedSuggestionService.getInstance();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// All routes require authentication
router.use(verifyToken);

// ============================================================================
// SUGGESTION ENDPOINTS
// ============================================================================

/**
 * GET /api/suggestions/products
 * Get product suggestions based on query
 *
 * Query params:
 * - query: string (search term)
 * - limit: number (default: 10)
 */
router.get("/products", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query = "", limit = "10" } = req.query;

    const suggestions = await suggestionService.getProductSuggestions(
      query as string,
      parseInt(limit as string, 10),
    );

    res.json({
      success: true,
      data: suggestions,
      metadata: {
        count: suggestions.length,
        query,
        limit: parseInt(limit as string, 10),
      },
    });
  } catch (error) {
    logger.error("Failed to get product suggestions", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to get product suggestions",
    });
  }
});

/**
 * GET /api/suggestions/sizes
 * Get size suggestions for a product
 *
 * Query params:
 * - product: string (required)
 * - query: string (optional filter)
 * - limit: number (default: 10)
 */
router.get("/sizes", async (req: Request, res: Response): Promise<void> => {
  try {
    const { product, query = "", limit = "10" } = req.query;

    if (!product) {
      res.status(400).json({
        success: false,
        error: "Product name is required",
      });
      return;
    }

    const suggestions = await suggestionService.getSizeSuggestions(
      product as string,
      query as string,
      parseInt(limit as string, 10),
    );

    res.json({
      success: true,
      data: suggestions,
      metadata: {
        count: suggestions.length,
        product,
        query,
        limit: parseInt(limit as string, 10),
      },
    });
  } catch (error) {
    logger.error("Failed to get size suggestions", { error, query: req.query });
    res.status(500).json({
      success: false,
      error: "Failed to get size suggestions",
    });
  }
});

/**
 * GET /api/suggestions/profiles
 * Get profile suggestions for product and size
 *
 * Query params:
 * - product: string (required)
 * - size: string (required)
 * - query: string (optional filter)
 * - limit: number (default: 10)
 */
router.get("/profiles", async (req: Request, res: Response): Promise<void> => {
  try {
    const { product, size, query = "", limit = "10" } = req.query;

    if (!product || !size) {
      res.status(400).json({
        success: false,
        error: "Product name and size are required",
      });
      return;
    }

    const suggestions = await suggestionService.getProfileSuggestions(
      product as string,
      size as string,
      query as string,
      parseInt(limit as string, 10),
    );

    res.json({
      success: true,
      data: suggestions,
      metadata: {
        count: suggestions.length,
        product,
        size,
        query,
        limit: parseInt(limit as string, 10),
      },
    });
  } catch (error) {
    logger.error("Failed to get profile suggestions", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to get profile suggestions",
    });
  }
});

/**
 * GET /api/suggestions/combinations
 * Get complete profile combinations for product and size
 *
 * Query params:
 * - product: string (required)
 * - size: string (required)
 * - limit: number (default: 5)
 */
router.get(
  "/combinations",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { product, size, limit = "5" } = req.query;

      if (!product || !size) {
        res.status(400).json({
          success: false,
          error: "Product name and size are required",
        });
        return;
      }

      const suggestions = await suggestionService.getCombinationSuggestions(
        product as string,
        size as string,
        parseInt(limit as string, 10),
      );

      res.json({
        success: true,
        data: suggestions,
        metadata: {
          count: suggestions.length,
          product,
          size,
          limit: parseInt(limit as string, 10),
        },
      });
    } catch (error) {
      logger.error("Failed to get combination suggestions", {
        error,
        query: req.query,
      });
      res.status(500).json({
        success: false,
        error: "Failed to get combination suggestions",
      });
    }
  },
);

// ============================================================================
// SMART APPLY ENDPOINT
// ============================================================================

/**
 * POST /api/suggestions/apply
 * Apply smart suggestion - ONE-CLICK magic
 * Returns complete profiles with calculated quantities based on orderQuantity
 *
 * Body:
 * - product: string (required)
 * - size: string (required)
 * - orderQuantity: number (required)
 */
router.post("/apply", async (req: Request, res: Response): Promise<void> => {
  try {
    const { product, size, orderQuantity } = req.body;

    if (!product || !size || !orderQuantity) {
      res.status(400).json({
        success: false,
        error: "Product, size, and orderQuantity are required",
      });
      return;
    }

    const result = await suggestionService.applySmartSuggestion(
      product as string,
      size as string,
      parseInt(orderQuantity as string, 10),
    );

    res.json({
      success: true,
      data: result,
      metadata: {
        product,
        size,
        orderQuantity: parseInt(orderQuantity as string, 10),
        profileCount: result.profiles.length,
      },
    });
  } catch (error) {
    logger.error("Failed to apply smart suggestion", { error, body: req.body });
    res.status(500).json({
      success: false,
      error: "Failed to apply smart suggestion",
    });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/suggestions/statistics
 * Get suggestion system statistics
 */
router.get(
  "/statistics",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await suggestionService.getStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error("Failed to get suggestion statistics", { error });
      res.status(500).json({
        success: false,
        error: "Failed to get statistics",
      });
    }
  },
);

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

/**
 * POST /api/suggestions/cleanup
 * Clean up old patterns (admin only)
 *
 * Body:
 * - days: number (default: 180)
 */
router.post("/cleanup", async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 180 } = req.body;

    const deleted = await suggestionService.cleanupOldPatterns(days);

    res.json({
      success: true,
      data: {
        deleted,
        days,
      },
    });
  } catch (error) {
    logger.error("Failed to cleanup patterns", { error, body: req.body });
    res.status(500).json({
      success: false,
      error: "Failed to cleanup patterns",
    });
  }
});

/**
 * GET /api/suggestions/health
 * Health check endpoint
 */
router.get("/health", async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await suggestionService.getStatistics();

    res.json({
      success: true,
      data: {
        status: "healthy",
        totalPatterns: stats.totalPatterns,
        averageConfidence: stats.averageConfidence,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Health check failed", { error });
    res.status(503).json({
      success: false,
      error: "Service unhealthy",
    });
  }
});

export default router;
