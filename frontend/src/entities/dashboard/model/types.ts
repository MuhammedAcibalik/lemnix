/**
 * LEMNİX Dashboard Entity Types
 * Domain types for dashboard operations
 *
 * @module entities/dashboard/model
 * @version 1.0.0 - FSD Compliant
 * @description Types for optimization-first dashboard
 */

import type { ID, Timestamp } from "@/shared";
import type { AlgorithmType } from "@/entities/optimization";

/**
 * Dashboard hero metrics (top-level KPIs)
 */
export interface DashboardHeroMetrics {
  readonly activeOptimizations: number;
  readonly cuttingListsThisWeek: number;
  readonly averageEfficiency: number; // 0-100 percentage
  readonly totalWasteSaved: number; // meters

  // Trends (for sparklines)
  readonly efficiencyTrend: ReadonlyArray<number>; // Last 7 days
  readonly wasteTrend: ReadonlyArray<number>; // Last 7 days
}

/**
 * Algorithm performance statistics
 */
export interface AlgorithmPerformanceStats {
  readonly algorithm: AlgorithmType;
  readonly count: number; // Total runs
  readonly avgEfficiency: number; // 0-100 percentage
  readonly avgExecutionTime: number; // milliseconds
  readonly avgWastePercentage: number; // 0-100 percentage
  readonly successRate: number; // 0-100 percentage
}

/**
 * Optimization performance grid data
 */
export interface OptimizationPerformanceData {
  readonly algorithmStats: ReadonlyArray<AlgorithmPerformanceStats>;
  readonly efficiencyTimeSeries: ReadonlyArray<{
    readonly date: string;
    readonly ffd: number;
    readonly bfd: number;
    readonly genetic: number;
    readonly pooling: number;
  }>;
  readonly wasteTimeSeries: ReadonlyArray<{
    readonly date: string;
    readonly totalWaste: number; // meters
    readonly wastePercentage: number; // 0-100
  }>;
  readonly costSavings: {
    readonly totalSaved: number; // currency
    readonly savingsTimeSeries: ReadonlyArray<{
      readonly date: string;
      readonly amount: number;
    }>;
  };
}

/**
 * Active operation status
 */
export type ActiveOperationStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";

/**
 * Active optimization operation
 */
export interface ActiveOperation {
  readonly id: ID;
  readonly status: ActiveOperationStatus;
  readonly algorithm: AlgorithmType;
  readonly itemCount: number;
  readonly progress: number; // 0-100 percentage
  readonly startedAt: Timestamp;
  readonly estimatedCompletion?: Timestamp;
  readonly currentGeneration?: number; // For GA
  readonly totalGenerations?: number; // For GA
  readonly userName?: string;
}

/**
 * Recently completed optimization
 */
export interface RecentCompletion {
  readonly id: ID;
  readonly algorithm: AlgorithmType;
  readonly itemCount: number;
  readonly efficiency: number; // 0-100 percentage
  readonly wastePercentage: number; // 0-100 percentage
  readonly executionTime: number; // milliseconds
  readonly completedAt: Timestamp;
  readonly userName?: string;
}

/**
 * Active operations panel data
 */
export interface ActiveOperationsData {
  readonly activeOperations: ReadonlyArray<ActiveOperation>;
  readonly queuedCount: number;
  readonly processingCount: number;
  readonly recentCompletions: ReadonlyArray<RecentCompletion>;
  readonly failedOperations: ReadonlyArray<{
    readonly id: ID;
    readonly algorithm: AlgorithmType;
    readonly error: string;
    readonly failedAt: Timestamp;
  }>;
}

/**
 * Top profile usage
 */
export interface TopProfile {
  readonly profileType: string;
  readonly count: number;
  readonly percentage: number; // of total usage
  readonly avgQuantity: number;
  readonly trend: "up" | "down" | "stable";
}

/**
 * Best performing algorithm
 */
export interface BestAlgorithm {
  readonly algorithm: AlgorithmType;
  readonly efficiency: number; // 0-100 percentage
  readonly runCount: number;
  readonly reason: string; // Why it's best
}

/**
 * Peak usage hour
 */
export interface PeakHour {
  readonly hour: number; // 0-23
  readonly count: number; // Optimization count
  readonly percentage: number; // of daily total
}

/**
 * Smart insights data
 */
export interface SmartInsightsData {
  readonly topProfiles: ReadonlyArray<TopProfile>; // Top 3
  readonly bestAlgorithm: BestAlgorithm;
  readonly peakHours: ReadonlyArray<PeakHour>; // Top 3
  readonly suggestions: ReadonlyArray<{
    readonly type: "performance" | "cost" | "usage";
    readonly message: string;
    readonly priority: "low" | "medium" | "high";
    readonly actionable: boolean;
  }>;
}

/**
 * Activity timeline event type
 */
export type ActivityEventType =
  | "optimization_started"
  | "optimization_completed"
  | "optimization_failed"
  | "cutting_list_created"
  | "cutting_list_updated"
  | "export_generated"
  | "user_login"
  | "system_event";

/**
 * Activity timeline event
 */
export interface TimelineEvent {
  readonly id: ID;
  readonly type: ActivityEventType;
  readonly action: string; // Human-readable action
  readonly userId?: string;
  readonly userName?: string;
  readonly timestamp: Timestamp;
  readonly metadata?: Record<string, unknown>;
  readonly relatedEntityId?: string; // e.g., optimization ID, cutting list ID
}

/**
 * Activity timeline filter
 */
export interface ActivityFilter {
  readonly type?: ActivityEventType;
  readonly userId?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly limit?: number; // Pagination
}

/**
 * Activity timeline data
 */
export interface ActivityTimelineData {
  readonly events: ReadonlyArray<TimelineEvent>;
  readonly totalCount: number;
  readonly hasMore: boolean;
}

/**
 * Complete dashboard data (aggregated)
 */
export interface DashboardData {
  readonly heroMetrics: DashboardHeroMetrics;
  readonly optimizationPerformance: OptimizationPerformanceData;
  readonly activeOperations: ActiveOperationsData;
  readonly smartInsights: SmartInsightsData;
  readonly activityTimeline: ActivityTimelineData;
  readonly lastUpdated: Timestamp;
}

/**
 * Dashboard metrics request options
 */
export interface DashboardMetricsOptions {
  readonly timeRange?: "24h" | "7d" | "30d" | "90d";
  readonly includeInactive?: boolean;
}

/**
 * Quick action type
 */
export type QuickActionType =
  | "start_optimization"
  | "create_cutting_list"
  | "view_history"
  | "export_reports";

/**
 * Quick action configuration
 */
export interface QuickAction {
  readonly id: QuickActionType;
  readonly label: string;
  readonly description: string;
  readonly icon: string; // Icon component name
  readonly action: () => void;
  readonly variant: "primary" | "secondary";
  readonly disabled?: boolean;
}
