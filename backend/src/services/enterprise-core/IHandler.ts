/**
 * Handler Interface (ISP - Interface Segregation Principle)
 * Small, focused interfaces for each handler type
 *
 * @module enterprise/core
 * @version 1.0.0
 */

import { Request, Response } from "express";

/**
 * Base handler interface
 * All handlers must implement handle method
 */
export interface IHandler {
  /**
   * Handle request
   * @param req - Express request
   * @param res - Express response
   * @returns Promise<void>
   */
  handle(req: Request, res: Response): Promise<void>;
}

/**
 * Optimization-specific operations
 */
export interface IOptimizationOperations {
  optimize(req: Request, res: Response): Promise<void>;
  optimizeByProfileType(req: Request, res: Response): Promise<void>;
}

/**
 * Metrics-specific operations
 */
export interface IMetricsOperations {
  getMetrics(req: Request, res: Response): Promise<void>;
  getAnalytics(req: Request, res: Response): Promise<void>;
  analyzePerformance(req: Request, res: Response): Promise<void>;
  getOptimizationHistory(req: Request, res: Response): Promise<void>;
}

/**
 * Health-specific operations
 */
export interface IHealthOperations {
  healthCheck(req: Request, res: Response): Promise<void>;
  getSystemHealth(req: Request, res: Response): Promise<void>;
  getSystemHealthStatus(req: Request, res: Response): Promise<void>;
}

/**
 * Export-specific operations
 */
export interface IExportOperations {
  exportResults(req: Request, res: Response): Promise<void>;
  getAuditTrail(req: Request, res: Response): Promise<void>;
}
