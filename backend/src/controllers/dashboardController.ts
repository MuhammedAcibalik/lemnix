/**
 * @fileoverview Dashboard Controller - Real Data Endpoints
 * @module DashboardController
 * @version 1.0.0 - Real Database Integration
 */

import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/monitoring/dashboardService';
import { logger } from '../services/logger';

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
// DASHBOARD CONTROLLER CLASS
// ============================================================================

export class DashboardController {
  private requestCounter: number = 0;

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `DASH-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Create standardized API response
   */
  private createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string,
    requestId?: string
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
  // DASHBOARD ENDPOINTS
  // ============================================================================

  /**
   * GET /api/dashboard/data
   * Get comprehensive dashboard data (all metrics in one call)
   */
  public getDashboardData = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info(`[${requestId}] Getting comprehensive dashboard data`);

        // Parallel fetch all dashboard data
        const [
          metrics,
          algorithmPerformance,
          wasteReductionTrend,
          recentActivity,
          profileUsage,
          systemHealth,
        ] = await Promise.all([
          dashboardService.getDashboardMetrics(),
          dashboardService.getAlgorithmPerformance(),
          dashboardService.getWasteReductionTrend(30),
          dashboardService.getRecentActivities(10),
          dashboardService.getProfileUsageStats(10),
          dashboardService.getSystemHealth(),
        ]);

        const responseData = {
          metrics,
          algorithmPerformance,
          wasteReductionTrend,
          recentActivity,
          profileUsage,
          systemHealth,
        };

        logger.info(`[${requestId}] Dashboard data retrieved successfully`);
        res.status(200).json(
          this.createResponse(true, responseData, undefined, 'Dashboard data retrieved successfully', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get dashboard data`, {
          error: err.message,
          stack: err.stack,
        });

        res.status(500).json(
          this.createResponse(
            false,
            undefined,
            'Failed to retrieve dashboard data',
            err.message,
            requestId
          )
        );
      }
    }
  );

  /**
   * GET /api/dashboard/metrics
   * Get dashboard metrics only (for polling)
   */
  public getMetrics = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        const metrics = await dashboardService.getDashboardMetrics();

        res.status(200).json(
          this.createResponse(true, metrics, undefined, 'Metrics retrieved successfully', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get metrics`, { error: err.message });

        res.status(500).json(
          this.createResponse(false, undefined, 'Failed to retrieve metrics', err.message, requestId)
        );
      }
    }
  );

  /**
   * GET /api/dashboard/algorithm-performance
   * Get algorithm performance data
   */
  public getAlgorithmPerformance = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        const data = await dashboardService.getAlgorithmPerformance();

        res.status(200).json(
          this.createResponse(true, data, undefined, 'Algorithm performance retrieved', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get algorithm performance`, { error: err.message });

        res.status(500).json(
          this.createResponse(
            false,
            undefined,
            'Failed to retrieve algorithm performance',
            err.message,
            requestId
          )
        );
      }
    }
  );

  /**
   * GET /api/dashboard/waste-trend
   * Get waste reduction trend
   */
  public getWasteTrend = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const days = parseInt(req.query.days as string) || 30;

      try {
        const data = await dashboardService.getWasteReductionTrend(days);

        res.status(200).json(
          this.createResponse(true, data, undefined, 'Waste trend retrieved', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get waste trend`, { error: err.message });

        res.status(500).json(
          this.createResponse(false, undefined, 'Failed to retrieve waste trend', err.message, requestId)
        );
      }
    }
  );

  /**
   * GET /api/dashboard/activities
   * Get recent activities
   */
  public getActivities = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const limit = parseInt(req.query.limit as string) || 10;

      try {
        const data = await dashboardService.getRecentActivities(limit);

        res.status(200).json(
          this.createResponse(true, data, undefined, 'Activities retrieved', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get activities`, { error: err.message });

        res.status(500).json(
          this.createResponse(false, undefined, 'Failed to retrieve activities', err.message, requestId)
        );
      }
    }
  );

  /**
   * GET /api/dashboard/profile-usage
   * Get profile usage statistics
   */
  public getProfileUsage = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const limit = parseInt(req.query.limit as string) || 10;

      try {
        const data = await dashboardService.getProfileUsageStats(limit);

        res.status(200).json(
          this.createResponse(true, data, undefined, 'Profile usage retrieved', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get profile usage`, { error: err.message });

        res.status(500).json(
          this.createResponse(
            false,
            undefined,
            'Failed to retrieve profile usage',
            err.message,
            requestId
          )
        );
      }
    }
  );

  /**
   * GET /api/dashboard/health
   * Get system health
   */
  public getHealth = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        const data = await dashboardService.getSystemHealth();

        res.status(200).json(
          this.createResponse(true, data, undefined, 'System health retrieved', requestId)
        );
      } catch (error: unknown) {
        const err = error as Error;
        logger.error(`[${requestId}] Failed to get system health`, { error: err.message });

        res.status(500).json(
          this.createResponse(false, undefined, 'Failed to retrieve system health', err.message, requestId)
        );
      }
    }
  );
}

// Export singleton instance
export const dashboardController = new DashboardController();

