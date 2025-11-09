/**
 * @fileoverview Production Plan Controller
 * @module controllers/productionPlanController
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { productionPlanService } from "../services/productionPlanService";
import { productionPlanToCuttingListService } from "../services/productionPlanToCuttingListService";
import { statisticsService } from "../services/statisticsService";
import { logger } from "../utils/logger";

export class ProductionPlanController {
  /**
   * Upload Excel file and create production plan
   * POST /api/production-plan/upload
   */
  async uploadProductionPlan(req: Request, res: Response): Promise<void> {
    try {
      // ✅ SECURITY: Sanitized logging - no sensitive data
      logger.info("Upload request received", {
        hasFile: !!req.file,
        fileField: req.file?.fieldname,
        fileName: req.file?.originalname
          ? req.file.originalname.substring(0, 20) + "..."
          : null, // ⚠️ Truncated filename
        fileSize: req.file?.size,
        fileMimetype: req.file?.mimetype,
        userAgent: req.headers["user-agent"], // ⚠️ Only safe headers
        contentLength: req.headers["content-length"],
        bodyKeys: Object.keys(req.body || {}),
      });

      if (!req.file) {
        logger.error("No file in request", {
          files: req.files,
          body: req.body,
          headers: req.headers,
        });
        res.status(400).json({
          success: false,
          error: "Excel dosyası yüklenmedi",
        });
        return;
      }

      const uploadedBy = (req as { user?: { id?: string } }).user?.id;
      const result = await productionPlanService.uploadProductionPlan(
        req.file.buffer,
        uploadedBy,
      );

      if (result.success) {
        logger.info("Production plan uploaded successfully", {
          planId: result.data?.id,
          weekNumber: result.data?.weekNumber,
          year: result.data?.year,
          itemCount: result.data?.items.length,
        });

        res.status(201).json({
          success: true,
          data: result.data,
          message: "Üretim planı başarıyla yüklendi",
        });
      } else {
        logger.error("Production plan upload failed", {
          errors: result.errors,
        });

        res.status(400).json({
          success: false,
          errors: result.errors,
        });
      }
    } catch (error) {
      logger.error("Production plan upload error", { error });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get production plans with filters
   * GET /api/production-plan
   */
  async getProductionPlans(req: Request, res: Response): Promise<void> {
    try {
      console.log("🚀 [Backend Controller] getProductionPlans called!", {
        query: req.query,
        timestamp: new Date().toISOString(),
      });

      // ✅ SECURITY: Input validation and sanitization
      const filters = {
        weekNumber: req.query.weekNumber
          ? Math.max(1, Math.min(53, Number(req.query.weekNumber)))
          : undefined,
        year: req.query.year
          ? Math.max(2020, Math.min(2030, Number(req.query.year)))
          : undefined,
        status: ["active", "archived", "draft"].includes(
          req.query.status as string,
        )
          ? (req.query.status as string)
          : "active",
        bolum: ["MONTAJ", "HELEZON", "KAYNAK", "BOYA"].includes(
          req.query.bolum as string,
        )
          ? (req.query.bolum as string)
          : undefined,
        oncelik: ["yuksek", "orta", "dusuk"].includes(
          req.query.oncelik as string,
        )
          ? (req.query.oncelik as string)
          : undefined,
        page: Math.max(1, Number(req.query.page) || 1),
        limit: Math.max(1, Math.min(100, Number(req.query.limit) || 50)),
      };

      const plans = await productionPlanService.getProductionPlans(
        filters,
        true,
      );

      logger.info("Production plans fetched", {
        count: plans.length,
        filters,
      });

      // Set cache headers to prevent caching - always fresh from database
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Last-Modified": new Date().toUTCString(),
        ETag: `"${Date.now()}"`,
      });

      res.json({
        success: true,
        data: plans,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: plans.length,
        },
        source: "database-only",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Get production plans error", { error });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get single production plan by ID
   * GET /api/production-plan/:id
   */
  async getProductionPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Plan ID gerekli",
        });
        return;
      }

      const plan = await productionPlanService.getProductionPlanById(id);

      if (!plan) {
        res.status(404).json({
          success: false,
          error: "Üretim planı bulunamadı",
        });
        return;
      }

      logger.info("Production plan fetched", {
        planId: id,
        weekNumber: plan.weekNumber,
        year: plan.year,
        itemCount: plan.items.length,
      });

      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      logger.error("Get production plan by ID error", {
        error,
        planId: req.params.id,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Delete production plan (soft delete)
   * DELETE /api/production-plan/:id
   */
  async deleteProductionPlan(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Plan ID gerekli",
        });
        return;
      }

      const result = await productionPlanService.deleteProductionPlan(id);

      if (result.success) {
        logger.info("Production plan deleted", { planId: id });
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        logger.error("Production plan delete failed", {
          planId: id,
          error: result.message,
        });
        res.status(400).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error) {
      logger.error("Delete production plan error", {
        error,
        planId: req.params.id,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get production plan metrics
   * GET /api/production-plan/metrics
   */
  async getProductionPlanMetrics(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        weekNumber: req.query.weekNumber
          ? Number(req.query.weekNumber)
          : undefined,
        year: req.query.year ? Number(req.query.year) : undefined,
        status: (req.query.status as string) || "active",
      };

      const metrics =
        await productionPlanService.getProductionPlanMetrics(filters);

      logger.info("Production plan metrics fetched", { filters, metrics });

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error("Get production plan metrics error", { error });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get production plan by week and year
   * GET /api/production-plan/week/:weekNumber/:year
   */
  async getProductionPlanByWeek(req: Request, res: Response): Promise<void> {
    try {
      const weekNumber = Number(req.params.weekNumber);
      const year = Number(req.params.year);

      if (!weekNumber || !year) {
        res.status(400).json({
          success: false,
          error: "Hafta numarası ve yıl gerekli",
        });
        return;
      }

      const plan = await productionPlanService.getProductionPlanByWeek(
        weekNumber,
        year,
      );

      if (!plan) {
        res.status(404).json({
          success: false,
          error: "Bu hafta için üretim planı bulunamadı",
        });
        return;
      }

      logger.info("Production plan by week fetched", {
        weekNumber,
        year,
        planId: plan.id,
        itemCount: plan.items.length,
      });

      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      logger.error("Get production plan by week error", {
        error,
        weekNumber: req.params.weekNumber,
        year: req.params.year,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get production plan items by work order ID
   * GET /api/production-plan/items/work-order/:workOrderId
   */
  async getProductionPlanItemsByWorkOrder(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { workOrderId } = req.params;

      if (!workOrderId) {
        res.status(400).json({
          success: false,
          error: "Work Order ID gerekli",
        });
        return;
      }

      const items =
        await productionPlanService.getProductionPlanItemsByWorkOrder(
          workOrderId,
        );

      logger.info("Production plan items by work order fetched", {
        workOrderId,
        itemCount: items.length,
      });

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      logger.error("Get production plan items by work order error", {
        error,
        workOrderId: req.params.workOrderId,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Plan itemlarından kesim listesi oluştur
   * POST /api/production-plan/create-cutting-list
   */
  async createCuttingListFromPlan(req: Request, res: Response): Promise<void> {
    try {
      const { productionPlanItems, cuttingListMetadata } = req.body;
      const userId = (req as { user?: { userId?: string } }).user?.userId || "dev-user-123"; // Development fallback

      // Validation
      if (
        !productionPlanItems ||
        !Array.isArray(productionPlanItems) ||
        productionPlanItems.length === 0
      ) {
        res.status(400).json({
          success: false,
          error: "En az bir plan itemı seçmelisiniz",
        });
        return;
      }

      if (!cuttingListMetadata?.name) {
        res.status(400).json({
          success: false,
          error: "Kesim listesi adı gerekli",
        });
        return;
      }

      // Her item için gerekli alanları kontrol et
      for (const item of productionPlanItems) {
        if (
          !item.planItemId ||
          !item.profileType ||
          !item.length ||
          !item.quantity
        ) {
          res.status(400).json({
            success: false,
            error:
              "Tüm itemlar için plan ID, profil tipi, uzunluk ve miktar gerekli",
          });
          return;
        }

        if (typeof item.length !== "number" || item.length <= 0) {
          res.status(400).json({
            success: false,
            error: "Uzunluk pozitif bir sayı olmalı",
          });
          return;
        }

        if (typeof item.quantity !== "number" || item.quantity <= 0) {
          res.status(400).json({
            success: false,
            error: "Miktar pozitif bir sayı olmalı",
          });
          return;
        }
      }

      logger.info("Creating cutting list from production plan", {
        itemCount: productionPlanItems.length,
        name: cuttingListMetadata.name,
        userId,
      });

      const result =
        await productionPlanToCuttingListService.createCuttingListFromPlan({
          productionPlanItems,
          cuttingListMetadata,
          userId,
        });

      if (result.success) {
        logger.info("Cutting list created successfully from production plan", {
          cuttingListId: result.data?.cuttingListId,
          itemCount: result.data?.itemCount,
        });

        res.json({
          success: true,
          data: result.data,
          message: "Kesim listesi başarıyla oluşturuldu",
        });
      } else {
        logger.error("Failed to create cutting list from production plan", {
          error: result.error,
        });

        res.status(400).json({
          success: false,
          error: result.error || "Kesim listesi oluşturulamadı",
        });
      }
    } catch (error) {
      logger.error("Create cutting list from production plan error", {
        error: (error as Error).message,
        body: req.body,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Kesim listesi ile bağlantılı plan itemlarını getir
   * GET /api/production-plan/cutting-list/:cuttingListId/plan-items
   */
  async getLinkedPlanItems(req: Request, res: Response): Promise<void> {
    try {
      const { cuttingListId } = req.params;

      if (!cuttingListId) {
        res.status(400).json({
          success: false,
          error: "Kesim listesi ID gerekli",
        });
        return;
      }

      logger.info("Getting linked plan items", { cuttingListId });

      const planItems =
        await productionPlanToCuttingListService.getLinkedPlanItems(
          cuttingListId,
        );

      res.json({
        success: true,
        data: planItems,
      });
    } catch (error) {
      logger.error("Get linked plan items error", {
        error: (error as Error).message,
        params: req.params,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Plan item ile kesim listesi arasındaki linki kaldır
   * DELETE /api/production-plan/plan-item/:planItemId/unlink
   */
  async unlinkPlanItemFromCuttingList(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { planItemId } = req.params;

      if (!planItemId) {
        res.status(400).json({
          success: false,
          error: "Plan item ID gerekli",
        });
        return;
      }

      logger.info("Unlinking plan item from cutting list", { planItemId });

      await productionPlanToCuttingListService.unlinkPlanItemFromCuttingList(
        planItemId,
      );

      res.json({
        success: true,
        message: "Plan item kesim listesinden başarıyla ayrıldı",
      });
    } catch (error) {
      logger.error("Unlink plan item from cutting list error", {
        error: (error as Error).message,
        params: req.params,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * DELETE /api/production-plan
   */
  async deleteAllProductionPlans(req: Request, res: Response): Promise<void> {
    try {
      const result = await productionPlanService.deleteAllProductionPlans();

      if (result.success) {
        logger.info("All production plans deleted", { count: result.count });
        res.json({
          success: true,
          message: result.message,
          count: result.count,
        });
      } else {
        logger.error("Delete all production plans failed", {
          error: result.message,
        });
        res.status(400).json({
          success: false,
          error: result.message,
        });
      }
    } catch (error) {
      logger.error("Delete all production plans error", { error });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get backorder items
   * GET /api/production-plan/backorder
   */
  async getBackorderItems(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        bolum: req.query.bolum as string,
        oncelik: req.query.oncelik as string,
        status: (req.query.status as string) || "active",
      };

      const backorderItems =
        await productionPlanService.getBackorderItems(filters);

      res.json({
        success: true,
        data: backorderItems,
      });
    } catch (error) {
      logger.error("Get backorder items error", { error });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get production plan statistics
   * GET /api/production-plan/statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    const filters = {
      bolum: req.query.bolum as string,
      oncelik: req.query.oncelik as string,
      status: (req.query.status as string) || "active",
    };

    try {
      const statistics = await statisticsService.getStatistics(filters);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error("Get statistics error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        filters,
      });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const productionPlanController = new ProductionPlanController();
