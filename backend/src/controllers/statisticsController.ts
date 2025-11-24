/**
 * @fileoverview Statistics Controller - Advanced Analytics API
 * @module StatisticsController
 * @version 1.0.0 - Enterprise Analytics Engine
 */

import { Request, Response, NextFunction } from "express";
import { cuttingListStatisticsService } from "../services/monitoring/cuttingListStatisticsService";
import { ProfileAnalysisService } from "../services/analysis/profileAnalysisService";
import { productCategoriesService } from "../services/analysis/productCategoriesService";
import { ColorSizeAnalysisService } from "../services/analysis/colorSizeAnalysisService";
import { WorkOrderAnalysisService } from "../services/analysis/workOrderAnalysisService";
import { logger } from "../services/logger";

// Instantiate services (DI pattern)
const profileAnalysisService = new ProfileAnalysisService();
const colorSizeAnalysisService = new ColorSizeAnalysisService();
const workOrderAnalysisService = new WorkOrderAnalysisService();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: string;
  readonly requestId?: string;
}

// ============================================================================
// STATISTICS CONTROLLER CLASS
// ============================================================================

/**
 * Statistics Controller for analytics and metrics endpoints
 */
export class StatisticsController {
  private requestCounter: number = 0;

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `STAT-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Create standardized API response
   */
  private createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string,
    requestId?: string,
  ): ApiResponse<T> {
    return {
      success,
      data,
      error,
      message,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  /**
   * Async handler wrapper for error handling
   */
  private asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  // ============================================================================
  // OVERVIEW ENDPOINTS
  // ============================================================================

  /**
   * ✅ P2-8: Batch statistics endpoint
   * Get multiple statistics in a single request
   */
  public getBatchStatistics = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        const { types, cuttingListId } = req.query;
        const requestedTypes = (types as string)?.split(",") || [
          "overview",
          "performance",
          "usage",
          "optimization",
          "health",
        ];

        logger.info(`[${requestId}] Getting batch statistics`, {
          types: requestedTypes,
        });

        // ✅ P2-8: Parallel fetch all requested statistics
        const results = await Promise.allSettled([
          requestedTypes.includes("overview")
            ? cuttingListStatisticsService.getStatisticsOverview(
                cuttingListId as string,
              )
            : Promise.resolve(null),

          requestedTypes.includes("performance")
            ? cuttingListStatisticsService.getPerformanceMetrics()
            : Promise.resolve(null),

          requestedTypes.includes("usage")
            ? cuttingListStatisticsService.getUsageAnalytics(30)
            : Promise.resolve(null),

          requestedTypes.includes("optimization")
            ? cuttingListStatisticsService.getOptimizationAnalytics()
            : Promise.resolve(null),

          requestedTypes.includes("health")
            ? cuttingListStatisticsService.getSystemHealthMetrics()
            : Promise.resolve(null),
        ]);

        // ✅ P2-8: Build response object
        const batchData: Record<string, unknown> = {};
        const typeNames = [
          "overview",
          "performance",
          "usage",
          "optimization",
          "health",
        ];

        results.forEach((result, index) => {
          const typeName = typeNames[index];
          if (requestedTypes.includes(typeName)) {
            if (result.status === "fulfilled") {
              batchData[typeName] = result.value;
            } else {
              logger.warn(`[${requestId}] Failed to fetch ${typeName}`, {
                error: result.reason,
              });
              batchData[typeName] = { error: "Failed to fetch" };
            }
          }
        });

        res.json(
          this.createResponse(
            true,
            batchData,
            undefined,
            "Batch statistics fetched successfully",
            requestId,
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Error getting batch statistics`, {
          error,
        });
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Batch statistics fetch failed",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get comprehensive statistics overview
   */
  public getOverview = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting statistics overview`);

        const { cuttingListId } = req.query;
        const overview =
          await cuttingListStatisticsService.getStatisticsOverview(
            cuttingListId as string,
          );

        res.json(
          this.createResponse(
            true,
            overview,
            undefined,
            "İstatistik özeti başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Statistics overview retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get statistics overview:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve statistics overview",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting performance metrics`);

        const metrics =
          await cuttingListStatisticsService.getPerformanceMetrics();

        res.json(
          this.createResponse(
            true,
            metrics,
            undefined,
            "Performans metrikleri başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Performance metrics retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get performance metrics:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve performance metrics",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  // ============================================================================
  // USAGE ANALYTICS ENDPOINTS
  // ============================================================================

  /**
   * Get usage analytics
   */
  public getUsageAnalytics = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const days = parseInt(req.query.days as string) || 30;

      try {
        logger.info(`[${requestId}] Getting usage analytics for ${days} days`);

        const analytics =
          await cuttingListStatisticsService.getUsageAnalytics(days);

        res.json(
          this.createResponse(
            true,
            analytics,
            undefined,
            `${days} günlük kullanım analizi başarıyla getirildi`,
            requestId,
          ),
        );

        logger.info(`[${requestId}] Usage analytics retrieved successfully`);
      } catch (error) {
        logger.error(`[${requestId}] Failed to get usage analytics:`, error);

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve usage analytics",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get profile usage statistics
   */
  public getProfileUsageStats = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const limit = parseInt(req.query.limit as string) || 50;

      try {
        logger.info(`[${requestId}] Getting profile usage statistics`);

        const analytics =
          await cuttingListStatisticsService.getUsageAnalytics(30);
        const profileStats = analytics.profileUsageCounts.slice(0, limit);

        res.json(
          this.createResponse(
            true,
            profileStats,
            undefined,
            "Profil kullanım istatistikleri başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Profile usage statistics retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get profile usage statistics:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve profile usage statistics",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get cutting list trends
   */
  public getCuttingListTrends = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const days = parseInt(req.query.days as string) || 30;

      try {
        logger.info(
          `[${requestId}] Getting cutting list trends for ${days} days`,
        );

        const analytics =
          await cuttingListStatisticsService.getUsageAnalytics(days);

        res.json(
          this.createResponse(
            true,
            analytics.cuttingListTrends,
            undefined,
            `${days} günlük kesim listesi trendleri başarıyla getirildi`,
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Cutting list trends retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get cutting list trends:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve cutting list trends",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  // ============================================================================
  // OPTIMIZATION ANALYTICS ENDPOINTS
  // ============================================================================

  /**
   * Get optimization analytics
   */
  public getOptimizationAnalytics = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting optimization analytics`);

        const analytics =
          await cuttingListStatisticsService.getOptimizationAnalytics();

        res.json(
          this.createResponse(
            true,
            analytics,
            undefined,
            "Optimizasyon analizi başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Optimization analytics retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get optimization analytics:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve optimization analytics",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get algorithm performance
   */
  public getAlgorithmPerformance = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting algorithm performance`);

        const analytics =
          await cuttingListStatisticsService.getOptimizationAnalytics();

        res.json(
          this.createResponse(
            true,
            analytics.algorithmPerformance,
            undefined,
            "Algoritma performansı başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Algorithm performance retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get algorithm performance:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve algorithm performance",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get waste reduction trends
   */
  public getWasteReductionTrends = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting waste reduction trends`);

        const analytics =
          await cuttingListStatisticsService.getOptimizationAnalytics();

        res.json(
          this.createResponse(
            true,
            analytics.wasteReductionTrends,
            undefined,
            "Fire azaltma trendleri başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Waste reduction trends retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get waste reduction trends:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve waste reduction trends",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  // ============================================================================
  // SYSTEM HEALTH ENDPOINTS
  // ============================================================================

  /**
   * Get system health metrics
   */
  public getSystemHealth = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting system health metrics`);

        const health =
          await cuttingListStatisticsService.getSystemHealthMetrics();

        res.json(
          this.createResponse(
            true,
            health,
            undefined,
            "Sistem sağlık metrikleri başarıyla getirildi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] System health metrics retrieved successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get system health metrics:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to retrieve system health metrics",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  // ============================================================================
  // DATA COLLECTION ENDPOINTS
  // ============================================================================

  /**
   * Update cutting list statistics
   */
  public updateCuttingListStats = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId } = req.params;

      try {
        if (!cuttingListId) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID is required",
                undefined,
                requestId,
              ),
            );
          return;
        }

        logger.info(
          `[${requestId}] Updating cutting list statistics for ${cuttingListId}`,
        );

        await cuttingListStatisticsService.updateCuttingListStatistics(
          cuttingListId,
        );

        res.json(
          this.createResponse(
            true,
            undefined,
            undefined,
            "Kesim listesi istatistikleri başarıyla güncellendi",
            requestId,
          ),
        );

        logger.info(
          `[${requestId}] Cutting list statistics updated successfully`,
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to update cutting list statistics:`,
          error,
        );

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to update cutting list statistics",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Record user activity
   */
  public recordUserActivity = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { userId, activityType, activityData } = req.body;

      try {
        if (!userId || !activityType) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "User ID and activity type are required",
                undefined,
                requestId,
              ),
            );
          return;
        }

        logger.info(
          `[${requestId}] Recording user activity: ${activityType} for user ${userId}`,
        );

        await cuttingListStatisticsService.recordUserActivity(
          userId,
          activityType,
          activityData,
          req.ip,
          req.get("User-Agent"),
          req.headers["x-session-id"] as string,
        );

        res.json(
          this.createResponse(
            true,
            undefined,
            undefined,
            "Kullanıcı aktivitesi başarıyla kaydedildi",
            requestId,
          ),
        );

        logger.info(`[${requestId}] User activity recorded successfully`);
      } catch (error) {
        logger.error(`[${requestId}] Failed to record user activity:`, error);

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to record user activity",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Record system metric
   */
  public recordSystemMetric = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { metricType, metricName, metricValue, metricUnit, metadata } =
        req.body;

      try {
        if (!metricType || !metricName || metricValue === undefined) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Metric type, name, and value are required",
                undefined,
                requestId,
              ),
            );
          return;
        }

        logger.info(
          `[${requestId}] Recording system metric: ${metricType}.${metricName} = ${metricValue}`,
        );

        await cuttingListStatisticsService.recordSystemMetric(
          metricType,
          metricName,
          metricValue,
          metricUnit,
          metadata,
        );

        res.json(
          this.createResponse(
            true,
            undefined,
            undefined,
            "Sistem metriği başarıyla kaydedildi",
            requestId,
          ),
        );

        logger.info(`[${requestId}] System metric recorded successfully`);
      } catch (error) {
        logger.error(`[${requestId}] Failed to record system metric:`, error);

        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to record system metric",
              undefined,
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get profile analysis statistics
   */
  public getProfileAnalysis = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting profile analysis statistics`);

        const { cuttingListId } = req.query;
        const profileAnalysis = await profileAnalysisService.getProfileAnalysis(
          cuttingListId as string,
        );

        res.json(
          this.createResponse(
            true,
            profileAnalysis,
            undefined,
            "Profil analizi başarıyla getirildi",
            requestId,
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to get profile analysis:`, error);
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Profil analizi alınırken hata oluştu",
              error instanceof Error ? error.message : String(error),
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get product categories analysis
   */
  public getProductCategoriesAnalysis = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting product categories analysis`);

        const { cuttingListId } = req.query;
        const categoriesAnalysis =
          await productCategoriesService.getProductCategoriesAnalysis(
            cuttingListId as string,
          );

        res.json(
          this.createResponse(
            true,
            categoriesAnalysis,
            undefined,
            "Ürün kategorileri analizi başarıyla getirildi",
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get product categories analysis:`,
          error,
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Ürün kategorileri analizi alınırken hata oluştu",
              error instanceof Error ? error.message : String(error),
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get color and size analysis
   */
  public getColorSizeAnalysis = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting color and size analysis`);

        const { cuttingListId } = req.query;
        const colorSizeAnalysis =
          await colorSizeAnalysisService.getColorSizeAnalysis(
            cuttingListId as string,
          );

        res.json(
          this.createResponse(
            true,
            colorSizeAnalysis,
            undefined,
            "Renk ve ebat analizi başarıyla getirildi",
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get color and size analysis:`,
          error,
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Renk ve ebat analizi alınırken hata oluştu",
              error instanceof Error ? error.message : String(error),
              requestId,
            ),
          );
      }
    },
  );

  /**
   * Get work order analysis
   */
  public getWorkOrderAnalysis = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting work order analysis`);

        const { cuttingListId } = req.query;
        const workOrderAnalysis =
          await workOrderAnalysisService.getWorkOrderAnalysis(
            cuttingListId as string,
          );

        res.json(
          this.createResponse(
            true,
            workOrderAnalysis,
            undefined,
            "İş emirleri analizi başarıyla getirildi",
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          `[${requestId}] Failed to get work order analysis:`,
          error,
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "İş emirleri analizi alınırken hata oluştu",
              error instanceof Error ? error.message : String(error),
              requestId,
            ),
          );
      }
    },
  );
}

// Export controller instance
export const statisticsController = new StatisticsController();
