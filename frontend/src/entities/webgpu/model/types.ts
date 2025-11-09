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
 * WebGPU device information
 */
export interface WebGPUInfo {
  readonly adapter?: {
    readonly name: string;
    readonly vendor: string;
    readonly architecture: string;
    readonly features: ReadonlyArray<string>;
    readonly limits: Record<string, number>;
  };
  readonly device?: {
    readonly queue: string;
    readonly features: ReadonlyArray<string>;
    readonly limits: Record<string, number>;
  };
  readonly capabilities?: {
    readonly maxComputeWorkgroupSizeX: number;
    readonly maxComputeWorkgroupSizeY: number;
    readonly maxComputeWorkgroupSizeZ: number;
    readonly maxStorageBufferBindingSize: number;
  };
}

/**
 * WebGPU optimization request
 */
export interface WebGPUOptimizationRequest {
  readonly items: ReadonlyArray<{
    readonly profileType: string;
    readonly length: number;
    readonly quantity: number;
  }>;
  readonly stockLength: number;
  readonly algorithm: "ffd" | "bfd";
}

/**
 * WebGPU optimization result
 */
export interface WebGPUOptimizationResult {
  readonly cuts: ReadonlyArray<{
    id: string;
    stockLength: number;
    segments: ReadonlyArray<{
      id: string;
      profileType: string;
      length: number;
      quantity: number;
      workOrderId: string;
    }>;
    usedLength: number;
    remainingLength: number;
    wasteCategory: string;
  }>;
  readonly totalWaste: number;
  readonly efficiency: number;
  readonly executionTimeMs: number;
  readonly gpuExecutionTimeMs?: number;
  readonly cpuExecutionTimeMs?: number;
  readonly speedup?: number; // GPU vs CPU speedup factor
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
