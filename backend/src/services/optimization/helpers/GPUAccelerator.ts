/**
 * LEMNİX GPU Accelerator
 * Enhanced WebGPU service with intelligent GPU selection
 * 
 * @module optimization/helpers
 * @version 1.0.0
 * @architecture Hardware-aware GPU acceleration
 */

import { ILogger } from '../../logger';
import { WebGPUOptimizationService, type WebGPUOptimizationParams, type WebGPUOptimizationResult } from '../webgpuOptimizationService';
import { GPUDetector, DetectedGPUInfo, GPUVendor } from './GPUDetector';

/**
 * Navigator with WebGPU support (for type safety in Node.js)
 */
interface NavigatorGPU {
  readonly gpu?: {
    requestAdapter(options?: {
      powerPreference?: 'low-power' | 'high-performance';
      forceFallbackAdapter?: boolean;
    }): Promise<GPUAdapter | null>;
  };
}

interface GPUAdapter {
  readonly limits: {
    readonly maxStorageBufferBindingSize: number;
    readonly maxComputeWorkgroupSizeX: number;
    readonly maxComputeInvocationsPerWorkgroup: number;
    readonly maxBufferSize: number;
  };
  requestAdapterInfo(): Promise<{
    readonly vendor?: string;
    readonly description?: string;
    readonly architecture?: string;
  }>;
}

/**
 * GPU Accelerator with intelligent adapter selection
 */
export class GPUAccelerator {
  private webgpuService: WebGPUOptimizationService | null = null;
  private selectedGPU: DetectedGPUInfo | null = null;
  private isInitialized = false;

  constructor(private readonly logger: ILogger) {}

  /**
   * Initialize GPU with intelligent selection (NVIDIA > AMD > Intel)
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      this.logger.info('Initializing GPU accelerator...');

      // Get WebGPU service instance
      this.webgpuService = WebGPUOptimizationService.getInstance();

      // Initialize base service
      const baseInitialized = await this.webgpuService.initialize();
      
      if (!baseInitialized) {
        this.logger.warn('Base WebGPU initialization failed');
        return false;
      }

      // Detect and select best GPU
      const gpu = await this.detectAndSelectBestGPU();
      
      if (!gpu) {
        this.logger.warn('No suitable GPU found');
        return false;
      }

      this.selectedGPU = gpu;
      this.isInitialized = true;

      GPUDetector.logGPUSelection(gpu, this.logger);

      return true;
    } catch (error) {
      this.logger.error('GPU accelerator initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Detect all available GPUs and select the best one
   */
  private async detectAndSelectBestGPU(): Promise<DetectedGPUInfo | null> {
    try {
      // In Node.js with @webgpu/dawn, we get a single adapter
      // In browser, we could enumerate multiple adapters (future enhancement)
      
      const navigator = this.getNavigator();
      if (!navigator?.gpu) {
        return null;
      }

      // Request adapter with high-performance preference
      const adapter = await navigator.gpu.requestAdapter({
        powerPreference: 'high-performance',
        forceFallbackAdapter: false
      });

      if (!adapter) {
        return null;
      }

      // Get adapter info
      const adapterInfo = await adapter.requestAdapterInfo();
      const limits = adapter.limits;

      // Detect GPU info
      const vendor = GPUDetector.detectVendor(
        adapterInfo.vendor || '',
        adapterInfo.description || ''
      );
      
      const priority = GPUDetector.getVendorPriority(vendor);
      
      const isDiscrete = GPUDetector.isDiscreteGPU(
        adapterInfo.description || '',
        adapterInfo.architecture || ''
      );

      const gpu: DetectedGPUInfo = {
        vendor,
        name: adapterInfo.description || 'Unknown GPU',
        architecture: adapterInfo.architecture || 'Unknown',
        memory: limits.maxStorageBufferBindingSize / (1024 * 1024), // Convert to MB
        priority,
        isDiscrete,
        capabilities: {
          maxWorkgroupSize: limits.maxComputeWorkgroupSizeX,
          maxComputeInvocations: limits.maxComputeInvocationsPerWorkgroup,
          maxBufferSize: limits.maxBufferSize
        }
      };

      // Check minimum requirements
      if (!GPUDetector.meetsMinimumRequirements(gpu)) {
        this.logger.warn('GPU does not meet minimum requirements', {
          gpu: GPUDetector.formatGPUName(gpu)
        });
        return null;
      }

      return gpu;
    } catch (error) {
      this.logger.error('GPU detection failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Get navigator with GPU support
   * Works in both browser and Node.js environments
   */
  private getNavigator(): NavigatorGPU | undefined {
    // Check for global object (Node.js with @webgpu/dawn)
    if (typeof global !== 'undefined') {
      const globalWithNav = global as typeof global & { navigator?: NavigatorGPU };
      if (globalWithNav.navigator?.gpu) {
        return globalWithNav.navigator;
      }
    }
    
    // Check for globalThis (modern approach)
    if (typeof globalThis !== 'undefined') {
      const globalThisWithNav = globalThis as typeof globalThis & { navigator?: NavigatorGPU };
      if (globalThisWithNav.navigator?.gpu) {
        return globalThisWithNav.navigator;
      }
    }
    
    return undefined;
  }

  /**
   * Check if GPU acceleration is available
   */
  public isAvailable(): boolean {
    return this.isInitialized && this.selectedGPU !== null;
  }

  /**
   * Get selected GPU info
   */
  public getGPUInfo(): DetectedGPUInfo | null {
    return this.selectedGPU;
  }

  /**
   * Run genetic algorithm with GPU acceleration
   */
  public async runGeneticAlgorithm(params: WebGPUOptimizationParams): Promise<WebGPUOptimizationResult> {
    if (!this.isAvailable() || !this.webgpuService) {
      throw new Error('GPU accelerator not initialized');
    }

    const startTime = performance.now();

    try {
      // Log optimization start
      this.logger.info('Starting GPU-accelerated genetic algorithm', {
        gpu: this.selectedGPU ? GPUDetector.formatGPUName(this.selectedGPU) : 'Unknown',
        populationSize: params.population.length,
        generations: params.generations,
        individualSize: params.population[0]?.length || 0
      });

      // Run optimization
      const result = await this.webgpuService.optimizeGeneticAlgorithm(params);

      // Log completion
      const executionTime = performance.now() - startTime;
      this.logger.info('GPU-accelerated genetic algorithm completed', {
        success: result.success,
        executionTime: `${executionTime.toFixed(2)}ms`,
        efficiency: result.statistics.maximum.toFixed(2)
      });

      return result;
    } catch (error) {
      this.logger.error('GPU genetic algorithm failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get recommended settings for current GPU
   */
  public getRecommendedSettings(itemCount: number): {
    workgroupSize: number;
    populationSize: number;
    generations: number;
  } {
    if (!this.selectedGPU) {
      return {
        workgroupSize: 64,
        populationSize: 20,
        generations: 50
      };
    }

    const workgroupSize = GPUDetector.getRecommendedWorkgroupSize(this.selectedGPU, itemCount);
    
    // Adjust population/generations based on GPU capability
    let populationMultiplier = 1;
    let generationMultiplier = 1;

    if (this.selectedGPU.vendor === GPUVendor.NVIDIA && this.selectedGPU.isDiscrete) {
      populationMultiplier = 2.5;
      generationMultiplier = 2;
    } else if (this.selectedGPU.vendor === GPUVendor.AMD && this.selectedGPU.isDiscrete) {
      populationMultiplier = 2;
      generationMultiplier = 1.5;
    } else if (this.selectedGPU.vendor === GPUVendor.INTEL) {
      populationMultiplier = 1;
      generationMultiplier = 1;
    }

    return {
      workgroupSize,
      populationSize: Math.floor(50 * populationMultiplier),
      generations: Math.floor(100 * generationMultiplier)
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.webgpuService = null;
    this.selectedGPU = null;
    this.isInitialized = false;
  }
}

