/**
 * LEMNİX Selection Log Types
 * Algorithm decision tracking and selection logging system
 */

export enum WorkloadClass {
  SMALL = 'SMALL',       // < 50 items
  MEDIUM = 'MEDIUM',     // 50-200 items
  LARGE = 'LARGE',       // > 200 items
  EXTREME = 'EXTREME'    // > 1000 items
}

export enum AlgorithmType {
  FFD = 'FFD',                           // First Fit Decreasing
  BFD = 'BFD',                           // Best Fit Decreasing
  NFD = 'NFD',                           // Next Fit Decreasing
  WFD = 'WFD',                           // Worst Fit Decreasing
  GENETIC = 'GENETIC',                   // Genetic Algorithm
  SIMULATED_ANNEALING = 'SIMULATED_ANNEALING', // Simulated Annealing
  BRANCH_AND_BOUND = 'BRANCH_AND_BOUND', // Branch and Bound
  PROFILE_POOLING = 'PROFILE_POOLING'    // Profile Pooling
}

export enum SelectionReason {
  DEFAULT = 'DEFAULT',                   // Default algorithm for workload class
  PERFORMANCE_OPTIMIZED = 'PERFORMANCE_OPTIMIZED', // Performance-based selection
  QUALITY_OPTIMIZED = 'QUALITY_OPTIMIZED', // Quality-based selection
  FALLBACK = 'FALLBACK',                 // Fallback due to primary failure
  USER_OVERRIDE = 'USER_OVERRIDE',       // User explicitly selected
  HEURISTIC = 'HEURISTIC',               // Heuristic-based selection
  MACHINE_LEARNING = 'MACHINE_LEARNING'  // ML-based selection
}

export enum FallbackTrigger {
  TIMEOUT = 'TIMEOUT',                   // Algorithm exceeded time limit
  MEMORY_OVERFLOW = 'MEMORY_OVERFLOW',   // Memory usage exceeded limit
  QUALITY_THRESHOLD = 'QUALITY_THRESHOLD', // Quality below threshold
  ERROR_OCCURRED = 'ERROR_OCCURRED',     // Algorithm encountered error
  PERFORMANCE_DEGRADATION = 'PERFORMANCE_DEGRADATION' // Performance degraded
}

export interface AlgorithmCandidate {
  algorithm: AlgorithmType;
  estimatedDuration: number;    // milliseconds
  estimatedQuality: number;     // 0-1 score
  estimatedMemory: number;      // MB
  confidence: number;          // 0-1 confidence in estimation
  reasoning: string;           // Why this algorithm was considered
}

export interface SelectionMetrics {
  workloadSize: number;        // Number of items
  workloadComplexity: number;  // Complexity score 0-1
  availableMemory: number;     // Available memory in MB
  timeConstraint: number;      // Time constraint in milliseconds
  qualityRequirement: number;  // Minimum quality requirement 0-1
  previousPerformance: {       // Historical performance data
    algorithm: AlgorithmType;
    averageDuration: number;
    averageQuality: number;
    successRate: number;
  }[];
}

export interface AlgorithmSelection {
  id: string;
  correlationId: string;
  timestamp: string;
  
  // Workload classification
  workloadClass: WorkloadClass;
  workloadSize: number;
  workloadComplexity: number;
  
  // Selection process
  candidates: AlgorithmCandidate[];
  selectedAlgorithm: AlgorithmType;
  selectionReason: SelectionReason;
  selectionConfidence: number;  // 0-1
  
  // Fallback information
  fallbackTriggered: boolean;
  fallbackTrigger?: FallbackTrigger;
  fallbackAlgorithm?: AlgorithmType;
  fallbackReason?: string;
  
  // Performance metrics
  actualDuration: number;      // milliseconds
  actualQuality: number;       // 0-1 score
  actualMemory: number;        // MB
  wastePercentage: number;     // Final waste percentage
  
  // Selection context
  metrics: SelectionMetrics;
  selectionContext: {
    availableAlgorithms: AlgorithmType[];
    constraints: {
      maxDuration: number;
      maxMemory: number;
      minQuality: number;
    };
    preferences: {
      preferQuality: boolean;
      preferSpeed: boolean;
      allowFallback: boolean;
    };
  };
  
  // Decision reasoning
  reasoning: string;           // Detailed reasoning for selection
  alternatives: string[];      // Alternative algorithms considered
  tradeoffs: string[];         // Tradeoffs made in selection
}

export interface SelectionPolicy {
  workloadClass: WorkloadClass;
  primaryAlgorithm: AlgorithmType;
  fallbackAlgorithm: AlgorithmType;
  qualityThreshold: number;
  durationThreshold: number;   // milliseconds
  memoryThreshold: number;     // MB
  fallbackTriggers: FallbackTrigger[];
  selectionCriteria: {
    qualityWeight: number;
    speedWeight: number;
    memoryWeight: number;
  };
}

export interface SelectionDistribution {
  totalSelections: number;
  byWorkloadClass: Record<WorkloadClass, {
    count: number;
    algorithmDistribution: Record<AlgorithmType, number>;
    averageQuality: number;
    averageDuration: number;
    fallbackRate: number;
  }>;
  byAlgorithm: Record<AlgorithmType, {
    count: number;
    workloadDistribution: Record<WorkloadClass, number>;
    averageQuality: number;
    averageDuration: number;
    successRate: number;
  }>;
  byReason: Record<SelectionReason, number>;
  byFallbackTrigger: Record<FallbackTrigger, number>;
}

export interface SelectionTrend {
  timeWindow: string;          // e.g., "1h", "24h", "7d"
  dataPoints: Array<{
    timestamp: string;
    selections: number;
    averageQuality: number;
    averageDuration: number;
    fallbackRate: number;
    topAlgorithm: AlgorithmType;
  }>;
}

export interface CanaryData {
  correlationId: string;
  algorithm: AlgorithmType;
  workloadClass: WorkloadClass;
  metrics: {
    duration: number;
    quality: number;
    memory: number;
    wastePercentage: number;
  };
  canaryStatus: 'SUCCESS' | 'WARNING' | 'FAILURE';
  comparison: {
    baseline: {
      algorithm: AlgorithmType;
      duration: number;
      quality: number;
    };
    deviation: {
      duration: number;        // percentage deviation
      quality: number;         // percentage deviation
    };
  };
}

// Default selection policies
export const DEFAULT_SELECTION_POLICIES: SelectionPolicy[] = [
  {
    workloadClass: WorkloadClass.SMALL,
    primaryAlgorithm: AlgorithmType.FFD,
    fallbackAlgorithm: AlgorithmType.BFD,
    qualityThreshold: 0.95,
    durationThreshold: 1000,    // 1 second
    memoryThreshold: 50,        // 50 MB
    fallbackTriggers: [FallbackTrigger.TIMEOUT, FallbackTrigger.ERROR_OCCURRED],
    selectionCriteria: {
      qualityWeight: 0.7,
      speedWeight: 0.3,
      memoryWeight: 0.0
    }
  },
  {
    workloadClass: WorkloadClass.MEDIUM,
    primaryAlgorithm: AlgorithmType.BFD,
    fallbackAlgorithm: AlgorithmType.GENETIC,
    qualityThreshold: 0.90,
    durationThreshold: 5000,    // 5 seconds
    memoryThreshold: 100,       // 100 MB
    fallbackTriggers: [FallbackTrigger.TIMEOUT, FallbackTrigger.QUALITY_THRESHOLD],
    selectionCriteria: {
      qualityWeight: 0.6,
      speedWeight: 0.3,
      memoryWeight: 0.1
    }
  },
  {
    workloadClass: WorkloadClass.LARGE,
    primaryAlgorithm: AlgorithmType.GENETIC,
    fallbackAlgorithm: AlgorithmType.BFD,
    qualityThreshold: 0.85,
    durationThreshold: 30000,   // 30 seconds
    memoryThreshold: 200,       // 200 MB
    fallbackTriggers: [FallbackTrigger.TIMEOUT, FallbackTrigger.MEMORY_OVERFLOW],
    selectionCriteria: {
      qualityWeight: 0.5,
      speedWeight: 0.3,
      memoryWeight: 0.2
    }
  },
  {
    workloadClass: WorkloadClass.EXTREME,
    primaryAlgorithm: AlgorithmType.SIMULATED_ANNEALING,
    fallbackAlgorithm: AlgorithmType.GENETIC,
    qualityThreshold: 0.80,
    durationThreshold: 60000,   // 60 seconds
    memoryThreshold: 500,       // 500 MB
    fallbackTriggers: [FallbackTrigger.TIMEOUT, FallbackTrigger.MEMORY_OVERFLOW],
    selectionCriteria: {
      qualityWeight: 0.4,
      speedWeight: 0.3,
      memoryWeight: 0.3
    }
  }
];

// Helper functions
export function classifyWorkload(itemCount: number): WorkloadClass {
  if (itemCount < 50) return WorkloadClass.SMALL;
  if (itemCount < 200) return WorkloadClass.MEDIUM;
  if (itemCount < 1000) return WorkloadClass.LARGE;
  return WorkloadClass.EXTREME;
}

export function getSelectionPolicy(workloadClass: WorkloadClass): SelectionPolicy {
  const policy = DEFAULT_SELECTION_POLICIES.find(policy => policy.workloadClass === workloadClass);
  return policy || DEFAULT_SELECTION_POLICIES[0];
}

export function calculateWorkloadComplexity(items: { profileType: string; stockLength: number }[]): number {
  // Simple complexity calculation based on item diversity
  const uniqueProfiles = new Set(items.map(item => item.profileType));
  const uniqueLengths = new Set(items.map(item => item.stockLength));
  
  const profileDiversity = uniqueProfiles.size / items.length;
  const lengthDiversity = uniqueLengths.size / items.length;
  
  return Math.min(1.0, (profileDiversity + lengthDiversity) / 2);
}

export function estimateAlgorithmPerformance(
  algorithm: AlgorithmType,
  workloadSize: number,
  complexity: number
): { duration: number; quality: number; memory: number } {
  // Simplified performance estimation
  const baseMetrics = {
    [AlgorithmType.FFD]: { duration: 100, quality: 0.85, memory: 10 },
    [AlgorithmType.BFD]: { duration: 150, quality: 0.90, memory: 15 },
    [AlgorithmType.NFD]: { duration: 80, quality: 0.80, memory: 8 },
    [AlgorithmType.WFD]: { duration: 120, quality: 0.82, memory: 12 },
    [AlgorithmType.GENETIC]: { duration: 5000, quality: 0.95, memory: 100 },
    [AlgorithmType.SIMULATED_ANNEALING]: { duration: 8000, quality: 0.97, memory: 150 },
    [AlgorithmType.BRANCH_AND_BOUND]: { duration: 15000, quality: 0.99, memory: 200 },
    [AlgorithmType.PROFILE_POOLING]: { duration: 300, quality: 0.88, memory: 25 }
  };

  const base = baseMetrics[algorithm];
  const sizeMultiplier = Math.log10(workloadSize + 1);
  const complexityMultiplier = 1 + complexity;

  return {
    duration: Math.round(base.duration * sizeMultiplier * complexityMultiplier),
    quality: Math.min(1.0, base.quality * (1 + complexity * 0.1)),
    memory: Math.round(base.memory * sizeMultiplier * complexityMultiplier)
  };
}
