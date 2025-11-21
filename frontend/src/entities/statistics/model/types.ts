/**
 * Statistics Entity Types
 *
 * @module entities/statistics/model
 * @version 2.0.0 - Comprehensive Statistics Integration
 */

export interface StatisticsOverview {
  readonly totalCuttingLists: number;
  readonly totalWorkOrders: number;
  readonly totalProfiles: number;
  readonly totalProductSections: number;
  readonly completedWorkOrders: number;
  readonly pendingWorkOrders: number;
  readonly mostUsedColor: string;
  readonly mostUsedSize: string;
  readonly averageEfficiency: number;
  readonly totalWasteReduction: number;
  readonly optimizationSuccessRate: number;
  readonly activeUsers: number;
  readonly systemUptime: number;
}

export interface AlgorithmPerformance {
  readonly algorithm: string;
  readonly count: number;
  readonly averageEfficiency: number;
  readonly averageWaste: number;
  readonly averageTime: number;
}

/**
 * Usage analytics (NEW - P2-2)
 */
export interface UsageAnalytics {
  readonly totalRequests: number;
  readonly uniqueUsers: number;
  readonly averageResponseTime: number;
  readonly requestsByEndpoint: Record<string, number>;
  readonly requestsByHour: ReadonlyArray<{
    readonly hour: number;
    readonly count: number;
  }>;
  readonly peakHour: number;
  readonly activeUsers: number;
}

/**
 * Profile usage statistics (NEW - P2-2)
 */
export interface ProfileUsageStats {
  readonly profileType: string;
  readonly usageCount: number;
  readonly totalLength: number;
  readonly averageQuantity: number;
  readonly lastUsed: string;
}

/**
 * Cutting list trends (NEW - P2-2)
 */
export interface CuttingListTrends {
  readonly daily: ReadonlyArray<{
    readonly date: string;
    readonly count: number;
    readonly totalLength: number;
    readonly averageEfficiency: number;
  }>;
  readonly totalLists: number;
  readonly averageItemsPerList: number;
  readonly trend: "increasing" | "stable" | "decreasing";
}

/**
 * Waste reduction trends (NEW - P2-2)
 */
export interface WasteReductionTrends {
  readonly daily: ReadonlyArray<{
    readonly date: string;
    readonly wasteReduction: number;
    readonly costSavings: number;
  }>;
  readonly totalWasteSaved: number;
  readonly totalCostSaved: number;
  readonly averageReductionRate: number;
}

/**
 * System health metrics (NEW - P2-2)
 */
export interface SystemHealthMetrics {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly uptime: number; // seconds
  readonly cpu: {
    readonly usage: number; // percentage
    readonly loadAverage: ReadonlyArray<number>;
  };
  readonly memory: {
    readonly used: number; // MB
    readonly total: number; // MB
    readonly percentage: number;
  };
  readonly database: {
    readonly connected: boolean;
    readonly responseTime: number; // ms
  };
  readonly lastCheck: string;
}

/**
 * Performance metrics (NEW - P2-2)
 */
export interface PerformanceMetrics {
  readonly averageOptimizationTime: number; // ms
  readonly throughput: number; // optimizations per hour
  readonly errorRate: number; // percentage
  readonly p95ResponseTime: number; // ms
  readonly p99ResponseTime: number; // ms
}

/**
 * Optimization analytics (NEW - P2-2)
 */
export interface OptimizationAnalytics {
  readonly totalOptimizations: number;
  readonly byAlgorithm: Record<string, number>;
  readonly averageEfficiency: number;
  readonly averageWaste: number;
  readonly averageCost: number;
  readonly successRate: number;
}

/**
 * Profile analysis (NEW - Analytics endpoints)
 */
export interface ProfileAnalysis {
  readonly totalProfiles: number;
  readonly byProfileType: Record<string, number>;
  readonly mostUsedProfiles: ReadonlyArray<{
    readonly profileType: string;
    readonly count: number;
    readonly percentage: number;
  }>;
  readonly averageUsage: number;
}

/**
 * Product categories analysis (NEW - Analytics endpoints)
 */
export interface ProductCategoriesAnalysis {
  readonly totalCategories: number;
  readonly byCategory: Record<string, number>;
  readonly mostUsedCategories: ReadonlyArray<{
    readonly category: string;
    readonly count: number;
    readonly percentage: number;
  }>;
}

/**
 * Color-size analysis (NEW - Analytics endpoints)
 */
export interface ColorSizeAnalysis {
  readonly totalCombinations: number;
  readonly byColor: Record<string, number>;
  readonly bySize: Record<string, number>;
  readonly mostCommonCombinations: ReadonlyArray<{
    readonly color: string;
    readonly size: string;
    readonly count: number;
  }>;
}

/**
 * Work order analysis (NEW - Analytics endpoints)
 */
export interface WorkOrderAnalysis {
  readonly totalWorkOrders: number;
  readonly completed: number;
  readonly pending: number;
  readonly byStatus: Record<string, number>;
  readonly averageCompletionTime: number;
  readonly trends: ReadonlyArray<{
    readonly date: string;
    readonly count: number;
  }>;
}
