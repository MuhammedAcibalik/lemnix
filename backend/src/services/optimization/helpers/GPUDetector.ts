/**
 * LEMNİX GPU Detector
 * Detects and prioritizes GPU adapters (NVIDIA > AMD > Intel)
 * 
 * @module optimization/helpers
 * @version 1.0.0
 * @architecture Hardware detection + priority ranking
 */

import { ILogger } from '../../logger';

/**
 * GPU Vendor enum
 */
export enum GPUVendor {
  NVIDIA = 'nvidia',
  AMD = 'amd',
  INTEL = 'intel',
  APPLE = 'apple',
  UNKNOWN = 'unknown'
}

/**
 * GPU Info with vendor detection
 */
export interface DetectedGPUInfo {
  readonly vendor: GPUVendor;
  readonly name: string;
  readonly architecture: string;
  readonly memory: number; // MB
  readonly priority: number; // 1-4 (1 = highest)
  readonly isDiscrete: boolean;
  readonly capabilities: {
    readonly maxWorkgroupSize: number;
    readonly maxComputeInvocations: number;
    readonly maxBufferSize: number;
  };
}

/**
 * GPU Detector class
 */
export class GPUDetector {
  /**
   * Detect GPU vendor from adapter info
   */
  public static detectVendor(vendorString: string, description: string): GPUVendor {
    const vendor = vendorString.toLowerCase();
    const desc = description.toLowerCase();
    const combined = `${vendor} ${desc}`;

    if (combined.includes('nvidia') || combined.includes('geforce') || combined.includes('rtx') || combined.includes('gtx')) {
      return GPUVendor.NVIDIA;
    }
    if (combined.includes('amd') || combined.includes('radeon') || combined.includes('rx ')) {
      return GPUVendor.AMD;
    }
    if (combined.includes('intel') || combined.includes('uhd') || combined.includes('iris')) {
      return GPUVendor.INTEL;
    }
    if (combined.includes('apple') || combined.includes('m1') || combined.includes('m2') || combined.includes('m3')) {
      return GPUVendor.APPLE;
    }

    return GPUVendor.UNKNOWN;
  }

  /**
   * Get priority for vendor (lower is better)
   */
  public static getVendorPriority(vendor: GPUVendor): number {
    const priorities: Record<GPUVendor, number> = {
      [GPUVendor.NVIDIA]: 1,  // Highest priority
      [GPUVendor.AMD]: 2,
      [GPUVendor.INTEL]: 3,
      [GPUVendor.APPLE]: 2,   // Same as AMD
      [GPUVendor.UNKNOWN]: 4  // Lowest priority
    };
    return priorities[vendor];
  }

  /**
   * Detect if GPU is discrete (dedicated) vs integrated
   */
  public static isDiscreteGPU(description: string, architecture: string): boolean {
    const desc = description.toLowerCase();
    const arch = architecture.toLowerCase();
    const combined = `${desc} ${arch}`;

    // Integrated GPU indicators
    const integratedKeywords = [
      'integrated', 'uhd', 'iris', 'vega', 'radeon graphics',
      'amd graphics', 'intel(r) hd', 'intel(r) uhd'
    ];

    // Discrete GPU indicators
    const discreteKeywords = [
      'geforce', 'rtx', 'gtx', 'radeon rx', 'radeon pro',
      'quadro', 'tesla', 'titan'
    ];

    // Check for discrete indicators first (higher confidence)
    for (const keyword of discreteKeywords) {
      if (combined.includes(keyword)) {
        return true;
      }
    }

    // Check for integrated indicators
    for (const keyword of integratedKeywords) {
      if (combined.includes(keyword)) {
        return false;
      }
    }

    // Default: assume discrete if unknown (optimistic)
    return true;
  }

  /**
   * Rank and sort GPU adapters by priority
   * Priority: NVIDIA discrete > AMD discrete > NVIDIA integrated > AMD integrated > Intel > Unknown
   */
  public static rankGPUs(gpus: DetectedGPUInfo[]): DetectedGPUInfo[] {
    return [...gpus].sort((a, b) => {
      // First: vendor priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // Second: discrete vs integrated
      if (a.isDiscrete !== b.isDiscrete) {
        return a.isDiscrete ? -1 : 1;
      }

      // Third: memory size (bigger is better)
      if (a.memory !== b.memory) {
        return b.memory - a.memory;
      }

      // Fourth: compute capability
      return b.capabilities.maxComputeInvocations - a.capabilities.maxComputeInvocations;
    });
  }

  /**
   * Get best GPU from list
   */
  public static getBestGPU(gpus: DetectedGPUInfo[]): DetectedGPUInfo | undefined {
    const ranked = this.rankGPUs(gpus);
    return ranked[0];
  }

  /**
   * Log GPU selection
   */
  public static logGPUSelection(gpu: DetectedGPUInfo, logger: ILogger): void {
    logger.info('GPU selected for optimization', {
      vendor: gpu.vendor,
      name: gpu.name,
      priority: gpu.priority,
      isDiscrete: gpu.isDiscrete,
      memory: `${gpu.memory}MB`,
      maxWorkgroupSize: gpu.capabilities.maxWorkgroupSize,
      maxComputeInvocations: gpu.capabilities.maxComputeInvocations
    });
  }

  /**
   * Format GPU name for display
   */
  public static formatGPUName(gpu: DetectedGPUInfo): string {
    const type = gpu.isDiscrete ? 'Discrete' : 'Integrated';
    const vendorName = gpu.vendor.toUpperCase();
    return `${vendorName} ${gpu.name} (${type})`;
  }

  /**
   * Check if GPU meets minimum requirements for optimization
   */
  public static meetsMinimumRequirements(gpu: DetectedGPUInfo, minMemoryMB: number = 512): boolean {
    return (
      gpu.memory >= minMemoryMB &&
      gpu.capabilities.maxComputeInvocations >= 256 &&
      gpu.capabilities.maxBufferSize >= 128 * 1024 * 1024 // 128MB
    );
  }

  /**
   * Get recommended workgroup size based on GPU capabilities
   */
  public static getRecommendedWorkgroupSize(gpu: DetectedGPUInfo, itemCount: number): number {
    const maxWorkgroupSize = gpu.capabilities.maxWorkgroupSize;
    
    // Prefer 256 for NVIDIA/AMD, 128 for Intel
    if (gpu.vendor === GPUVendor.NVIDIA || gpu.vendor === GPUVendor.AMD) {
      return Math.min(256, maxWorkgroupSize);
    }
    
    if (gpu.vendor === GPUVendor.INTEL) {
      return Math.min(128, maxWorkgroupSize);
    }
    
    // Default: 64
    return Math.min(64, maxWorkgroupSize);
  }
}

