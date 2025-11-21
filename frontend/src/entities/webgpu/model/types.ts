/**
 * LEMNİX WebGPU Entity Types
 * GPU-accelerated optimization domain types
 *
 * @module entities/webgpu/model
 * @version 1.0.0 - FSD Compliant
 */

/**
 * WebGPU support status
 */
export interface WebGPUStatus {
  readonly supported: boolean;
  readonly initialized: boolean;
  readonly deviceName?: string;
  readonly vendor?: string;
  readonly architecture?: string;
  readonly error?: string;
}

/**
 * WebGPU performance metrics
 */
export interface WebGPUPerformanceMetrics {
  readonly totalOptimizations: number;
  readonly averageGPUTime: number;
  readonly averageCPUTime: number;
  readonly averageSpeedup: number;
  readonly successRate: number;
  readonly errorRate: number;
}

/**
 * WebGPU preference state
 */
export interface WebGPUPreference {
  readonly enabled: boolean;
  readonly fallbackToCPU: boolean;
  readonly preferredAlgorithms: ReadonlyArray<"ffd" | "bfd">;
}
