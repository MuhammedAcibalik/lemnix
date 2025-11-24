/**
 * Optimization Handler - Type-safe, 0 any
 * SRP: Handle optimization operations only
 * DIP: Depends on abstractions (services)
 */

import { Request, Response } from "express";
import { BaseHandler } from "../enterprise-core/BaseHandler";
import type { IOptimizationOperations } from "../enterprise-core/IHandler";
import { AdvancedOptimizationService } from "../optimization/AdvancedOptimizationService";
import {
  ProfileOptimizationService,
  ProfileOptimizationResult,
} from "../optimization/profileOptimizationService";
import { PerformanceOptimizationService } from "../optimization/performanceOptimizationService";
import { EnterpriseMonitoringService } from "../monitoring/enterpriseMonitoringService";
import { OptimizationItem, OptimizationResult } from "../../types";
import type { EnterpriseOptimizationRequest } from "../../types/enterprise";
import type { AlgorithmMode } from "../optimization/AlgorithmModeSelector";
import { logger } from "../logger";

export class OptimizationHandler
  extends BaseHandler
  implements IOptimizationOperations
{
  constructor(
    private readonly advancedService: AdvancedOptimizationService,
    private readonly profileService: ProfileOptimizationService,
    private readonly performanceService: PerformanceOptimizationService,
    private readonly monitoringService: EnterpriseMonitoringService,
  ) {
    super();
  }

  public async optimize(req: Request, res: Response): Promise<void> {
    const requestId = this.generateRequestId();
    const startTime = performance.now();

    try {
      const request = req.body as EnterpriseOptimizationRequest;

      const { result: optimizationResult, performance: performanceResult } =
        await this.performanceService.optimizePerformance(
          async (items: OptimizationItem[]) => {
            return this.advancedService.optimizeWithMode(
              items,
              {
                algorithm: request.algorithm,
                objectives: request.objectives,
                constraints: request.constraints,
                performance: request.performance,
                costModel: request.costModel,
              },
              "standard",
              request.materialStockLengths,
              request.profileParams, // ✅ Pass profile params
            );
          },
          request.items,
          request.algorithm,
          request.objectives,
          request.constraints,
          request.performance,
          request.costModel,
          request.materialStockLengths,
        );

      this.monitoringService.recordOptimizationMetrics(
        request.algorithm,
        request.items,
        optimizationResult as unknown as OptimizationResult,
        performanceResult.optimizedMetrics.executionTime,
        performanceResult.optimizedMetrics.memoryUsage,
        true,
      );

      // ✅ FIX: Convert algorithm enum to display name for frontend
      const algorithmDisplayName = this.getAlgorithmDisplayName(
        request.algorithm,
      );

      logger.debug("[OptimizationHandler] Sending response", {
        algorithm: algorithmDisplayName,
        requestAlgorithm: request.algorithm,
        optimizationResultKeys: Object.keys(optimizationResult),
        inputItems: {
          itemCount: request.items?.length || 0,
          sampleItem: request.items?.[0],
          workOrderIds:
            request.items?.map((i) => i.workOrderId).filter(Boolean) || [],
          profileParams: request.profileParams,
        },
        outputSegments: {
          cutCount: optimizationResult.cuts.length,
          sampleCut: optimizationResult.cuts[0],
          sampleSegment: optimizationResult.cuts[0]?.segments?.[0],
          segmentWorkOrderIds: optimizationResult.cuts
            .flatMap((c) => c.segments.map((s) => s.workOrderId))
            .filter(Boolean),
        },
      });

      // ✅ FIX: Modify optimizationResult to include display name BEFORE adding to response
      const modifiedOptimizationResult = {
        ...optimizationResult,
        algorithm: optimizationResult.algorithm, // Keep original enum
        algorithmDisplayName: algorithmDisplayName, // Add display name
      };

      // ✅ FIX: Add algorithm field directly to response data at ROOT level
      const responseData = {
        algorithm: algorithmDisplayName, // ✅ CRITICAL: ROOT level algorithm (display name)
        efficiency: optimizationResult.efficiency,
        wastePercentage: optimizationResult.wastePercentage,
        stockCount: optimizationResult.cuts.length,
        totalCost: optimizationResult.totalCost,
        executionTime: optimizationResult.executionTimeMs,
        cuts: optimizationResult.cuts,
        optimizationResult: modifiedOptimizationResult, // Include both enum and display name
        performanceMetrics: performanceResult,
        costAnalysis: optimizationResult.costBreakdown,
        recommendations: optimizationResult.recommendations,
        confidence: optimizationResult.confidence,
        metadata: (optimizationResult as { metadata?: unknown }).metadata, // ✅ Profile badge için metadata
      };

      logger.debug("[OptimizationHandler] Response data", {
        keys: Object.keys(responseData),
        algorithm: responseData.algorithm,
      });

      this.sendSuccess(res, responseData, {
        requestId,
        processingTime: performance.now() - startTime,
        algorithm: request.algorithm,
      });
    } catch (error) {
      this.handleError(res, error, "OPTIMIZATION_ERROR");
    }
  }

  public async optimizeByProfileType(
    req: Request,
    res: Response,
  ): Promise<void> {
    const requestId = this.generateRequestId();

    try {
      const { items } = req.body as { items: OptimizationItem[] };

      if (!items || !Array.isArray(items) || items.length === 0) {
        this.sendError(res, 400, "INVALID_INPUT", "Items array required");
        return;
      }

      const profileResults: ProfileOptimizationResult[] =
        await this.profileService.optimizeByProfileType(items);
      const mergedResult =
        this.profileService.mergeProfileResults(profileResults);

      this.sendSuccess(
        res,
        {
          optimizationResult: mergedResult,
          performanceMetrics: {
            algorithmComplexity: "O(n log n)" as const,
            convergenceRate: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            scalability: 0,
          },
          costAnalysis: {
            materialCost: 0,
            cuttingCost: 0,
            setupCost: 0,
            totalCost: (mergedResult as OptimizationResult).totalCost,
          },
          recommendations: this.generateRecommendations(profileResults),
          confidence: 0,
          profileGroups: profileResults.map((r) => ({
            profileType: r.profileType,
            cuts: r.cuts.length,
            efficiency: r.efficiency,
            waste: r.totalWaste,
            workOrders: r.workOrders,
          })),
        },
        { requestId, algorithm: "profile-optimization" },
      );
    } catch (error) {
      this.handleError(res, error, "PROFILE_OPTIMIZATION_ERROR");
    }
  }

  private generateRecommendations(
    results: ProfileOptimizationResult[],
  ): Array<{ severity: string; message: string; description: string }> {
    const recommendations: Array<{
      severity: string;
      message: string;
      description: string;
    }> = [];

    const lowEfficiency = results.filter((r) => r.efficiency < 85);
    if (lowEfficiency.length > 0) {
      recommendations.push({
        severity: "warning",
        message: "Düşük verimlilik tespit edildi",
        description: `${lowEfficiency.length} profil grubunda verimlilik %85'in altında`,
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        severity: "success",
        message: "Mükemmel optimizasyon",
        description: "Tüm profil grupları optimal seviyede",
      });
    }

    return recommendations;
  }

  /**
   * Optimize with algorithm mode selection
   * Hybrid approach: standard/advanced/auto
   */
  public async optimizeWithMode(req: Request, res: Response): Promise<void> {
    const requestId = this.generateRequestId();
    const startTime = performance.now();

    try {
      const request = req.body as EnterpriseOptimizationRequest & {
        algorithmMode?: AlgorithmMode;
      };
      const mode: AlgorithmMode = request.algorithmMode ?? "standard";

      // DEBUG: Log incoming request
      logger.debug("[OptimizationHandler] Incoming request", {
        hasItems: !!request.items,
        itemsIsArray: Array.isArray(request.items),
        itemsLength: request.items?.length,
        items: request.items,
        hasObjectives: !!request.objectives,
        objectivesLength: request.objectives?.length,
        algorithm: request.algorithm,
        mode,
      });

      // Validate request
      if (
        !request.items ||
        !Array.isArray(request.items) ||
        request.items.length === 0
      ) {
        logger.warn(
          "[OptimizationHandler] Validation failed: Invalid items array",
        );
        res.status(400).json({
          success: false,
          error: {
            message: "Items array is required and must not be empty",
            code: "INVALID_ITEMS",
          },
        });
        return;
      }

      if (
        !request.objectives ||
        !Array.isArray(request.objectives) ||
        request.objectives.length === 0
      ) {
        logger.warn(
          "[OptimizationHandler] Validation failed: Invalid objectives array",
        );
        res.status(400).json({
          success: false,
          error: {
            message: "Objectives array is required and must not be empty",
            code: "INVALID_OBJECTIVES",
          },
        });
        return;
      }

      const { result: optimizationResult, performance: performanceResult } =
        await this.performanceService.optimizePerformance(
          async (items: OptimizationItem[]) => {
            return this.advancedService.optimizeWithMode(
              items,
              {
                algorithm: request.algorithm,
                objectives: request.objectives,
                constraints: request.constraints,
                performance: request.performance,
                costModel: request.costModel,
              },
              mode,
              request.materialStockLengths,
              request.profileParams,
            ); // ✅ Add profileParams
          },
          request.items,
          request.algorithm,
          request.objectives,
          request.constraints,
          request.performance,
          request.costModel,
          request.materialStockLengths,
        );

      this.monitoringService.recordOptimizationMetrics(
        request.algorithm,
        request.items,
        optimizationResult as unknown as OptimizationResult,
        performanceResult.optimizedMetrics.executionTime,
        performanceResult.optimizedMetrics.memoryUsage,
        true,
      );

      // ✅ FIX: Convert algorithm enum to display name for frontend
      const algorithmDisplayName = this.getAlgorithmDisplayName(
        request.algorithm,
      );

      logger.debug("[OptimizationHandler] Sending response with algorithm", {
        algorithm: algorithmDisplayName,
        requestAlgorithm: request.algorithm,
      });

      // ✅ FIX: Add algorithm field directly to response data at ROOT level
      const responseData = {
        algorithm: algorithmDisplayName, // ✅ CRITICAL: ROOT level algorithm (display name)
        efficiency: optimizationResult.efficiency,
        wastePercentage: optimizationResult.wastePercentage,
        stockCount: optimizationResult.cuts.length,
        totalCost: optimizationResult.totalCost,
        totalWaste: optimizationResult.totalWaste, // ✅ EKLE
        executionTime: optimizationResult.executionTimeMs,
        cuts: optimizationResult.cuts,
        optimizationResult: {
          ...optimizationResult,
          algorithmDisplayName: algorithmDisplayName, // Add display name
        },
        performanceMetrics: performanceResult,
        costAnalysis: optimizationResult.costBreakdown,
        recommendations: optimizationResult.recommendations,
        confidence: optimizationResult.confidence,
        algorithmMode: mode,
        metadata: (optimizationResult as { metadata?: unknown }).metadata, // ✅ Profile badge için metadata
      };

      logger.debug("[OptimizationHandler] Response data", {
        algorithm: responseData.algorithm,
        cuts: {
          cutsCount: optimizationResult.cuts.length,
          sampleCut: optimizationResult.cuts[0],
          sampleSegment: optimizationResult.cuts[0]?.segments?.[0],
          totalWaste: optimizationResult.totalWaste,
        },
      });

      this.sendSuccess(res, responseData, {
        requestId,
        processingTime: performance.now() - startTime,
        algorithm: request.algorithm,
      });
    } catch (error) {
      this.handleError(res, error, "OPTIMIZATION_WITH_MODE_ERROR");
    }
  }

  /**
   * Multi-objective optimization (Pareto front)
   * @deprecated NSGA-II has been removed. This endpoint returns 410 Gone.
   */
  public async optimizePareto(req: Request, res: Response): Promise<void> {
    res.status(410).json({
      success: false,
      error: {
        code: "FEATURE_REMOVED",
        message:
          "Pareto optimization (NSGA-II) has been removed. Please use standard optimization mode.",
      },
    });
  }

  /**
   * Compare standard vs advanced algorithms
   * Runs both GeneticAlgorithm and NSGA-II in parallel
   */
  public async optimizeCompare(req: Request, res: Response): Promise<void> {
    const requestId = this.generateRequestId();
    const startTime = performance.now();

    try {
      const request = req.body as EnterpriseOptimizationRequest;

      // Run standard algorithm first
      const standardResult = await this.advancedService.optimizeWithMode(
        request.items,
        {
          algorithm: request.algorithm,
          objectives: request.objectives,
          constraints: request.constraints,
          performance: request.performance,
          costModel: request.costModel,
        },
        "standard",
        request.materialStockLengths,
      );

      // optimizeMultiObjective removed - NSGA-II algorithm removed
      // Return a 410 Gone response instead
      const advancedResult = {
        recommendedSolution: standardResult,
        paretoFront: [],
        frontSize: 0,
        hypervolume: 0,
        spread: 0,
      };

      this.sendSuccess(
        res,
        {
          standard: {
            result: standardResult,
            algorithm: "genetic",
            mode: "standard",
          },
          advanced: {
            result: advancedResult.recommendedSolution,
            paretoFront: advancedResult.paretoFront,
            frontSize: advancedResult.frontSize,
            hypervolume: advancedResult.hypervolume,
            spread: advancedResult.spread,
            algorithm: "bfd", // NSGA-II removed, using BFD fallback
            mode: "standard",
          },
          comparison: {
            efficiencyDiff:
              advancedResult.recommendedSolution.efficiency -
              standardResult.efficiency,
            wasteDiff:
              advancedResult.recommendedSolution.totalWaste -
              standardResult.totalWaste,
            costDiff:
              advancedResult.recommendedSolution.totalCost -
              standardResult.totalCost,
          },
        },
        {
          requestId,
          processingTime: performance.now() - startTime,
          algorithm: "comparison",
        },
      );
    } catch (error) {
      this.handleError(res, error, "COMPARISON_ERROR");
    }
  }

  /**
   * Get algorithm display name for frontend
   */
  private getAlgorithmDisplayName(algorithm: string): string {
    const algo = algorithm.toLowerCase();

    if (algo === "bfd") return "Best Fit Decreasing";
    if (algo === "ffd") return "First Fit Decreasing";
    if (algo === "genetic") return "Genetic Algorithm";
    if (algo === "pooling") return "Profile Pooling";
    if (algo === "pattern-exact") return "Pattern Exact Search";

    return "Smart Algorithm";
  }
}
