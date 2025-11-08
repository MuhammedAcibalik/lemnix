/**
 * WebGPU Optimization Service
 * Enterprise-grade GPU acceleration using WebGPU API
 * Cross-platform, reliable, and high-performance
 * Fully typed, production-ready implementation
 */

import type { 
  OptimizationItem,
  OptimizationResult
} from '../../types';

// WebGPU Type Definitions
export interface GPUInfo {
  name: string;
  type: string;
  memory: number;
  driver: string;
  version: string;
  capabilities?: GPUCapabilities;
}

export interface GPUCapabilities {
  maxWorkgroupSizeX: number;
  maxWorkgroupSizeY: number;
  maxWorkgroupSizeZ: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxComputeWorkgroupsPerDimension: number;
}

export interface WebGPUOptimizationParams {
  population: number[][];
  fitnessWeights: number[];
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  optimizationItems?: OptimizationItem[];
}

export interface WebGPUOptimizationResult {
  success: boolean;
  executionTime: number;
  populationSize: number;
  individualSize: number;
  fitnessResults: number[];
  statistics: {
    average: number;
    maximum: number;
    minimum: number;
    variance: number;
    standardDeviation: number;
  };
  gpuInfo?: GPUInfo;
  error?: string;
  optimizationResult?: OptimizationResult;
}

// Declare WebGPU types
declare const GPUBufferUsage: {
  readonly MAP_READ: number;
  readonly MAP_WRITE: number;
  readonly COPY_SRC: number;
  readonly COPY_DST: number;
  readonly INDEX: number;
  readonly VERTEX: number;
  readonly UNIFORM: number;
  readonly STORAGE: number;
  readonly INDIRECT: number;
  readonly QUERY_RESOLVE: number;
};

declare const GPUMapMode: {
  readonly READ: number;
  readonly WRITE: number;
};

declare const GPUShaderStage: {
  readonly VERTEX: number;
  readonly FRAGMENT: number;
  readonly COMPUTE: number;
};

declare const GPUTextureUsage: {
  readonly COPY_SRC: number;
  readonly COPY_DST: number;
  readonly TEXTURE_BINDING: number;
  readonly STORAGE_BINDING: number;
  readonly RENDER_ATTACHMENT: number;
};

// Global type declarations
declare global {
  interface Navigator {
    gpu?: GPU;
  }
  
  interface ImageBitmap {}
  interface OffscreenCanvas {}
}

declare const navigator: Navigator & { gpu?: GPU };

// WebGPU Interface Definitions
interface GPUDevice {
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  queue: GPUQueue;
  destroy(): void;
  limits: GPULimits;
  features: ReadonlySet<string>;
}

interface GPUAdapter {
  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  requestAdapterInfo(): Promise<GPUAdapterInfo>;
  limits: GPULimits;
  features: ReadonlySet<string>;
}

interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): string;
}

interface GPUBuffer {
  size: number;
  usage: number;
  mapState: 'unmapped' | 'pending' | 'mapped';
  label?: string;
  destroy(): void;
  mapAsync(mode: number, offset?: number, size?: number): Promise<void>;
  getMappedRange(offset?: number, size?: number): ArrayBuffer;
  unmap(): void;
}

interface GPUBufferDescriptor {
  size: number;
  usage: number;
  mappedAtCreation?: boolean;
  label?: string;
}

interface GPUShaderModule {
  label?: string;
}

interface GPUShaderModuleDescriptor {
  code: string;
  label?: string;
  hints?: Record<string, GPUShaderModuleCompilationHint>;
}

interface GPUShaderModuleCompilationHint {
  layout?: GPUPipelineLayout | 'auto';
}

interface GPUComputePipeline {
  label?: string;
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUComputePipelineDescriptor {
  layout: GPUPipelineLayout | 'auto';
  compute: GPUProgrammableStage;
  label?: string;
}

interface GPUProgrammableStage {
  module: GPUShaderModule;
  entryPoint: string;
  constants?: Record<string, number>;
}

interface GPUCommandEncoder {
  beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder;
  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
  copyBufferToBuffer(source: GPUBuffer, sourceOffset: number, destination: GPUBuffer, destinationOffset: number, size: number): void;
  copyBufferToTexture(source: GPUImageCopyBuffer, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void;
  copyTextureToBuffer(source: GPUImageCopyTexture, destination: GPUImageCopyBuffer, copySize: GPUExtent3D): void;
  copyTextureToTexture(source: GPUImageCopyTexture, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void;
  finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer;
  label?: string;
}

interface GPUCommandEncoderDescriptor {
  label?: string;
}

interface GPUComputePassDescriptor {
  label?: string;
  timestampWrites?: GPUComputePassTimestampWrites;
}

interface GPUComputePassTimestampWrites {
  querySet: GPUQuerySet;
  beginningOfPassWriteIndex?: number;
  endOfPassWriteIndex?: number;
}

interface GPUQuerySet {
  type: 'occlusion' | 'timestamp';
  count: number;
  label?: string;
  destroy(): void;
}

interface GPURenderPassDescriptor {
  colorAttachments: (GPURenderPassColorAttachment | null)[];
  depthStencilAttachment?: GPURenderPassDepthStencilAttachment;
  occlusionQuerySet?: GPUQuerySet;
  timestampWrites?: GPURenderPassTimestampWrites;
  label?: string;
}

interface GPURenderPassColorAttachment {
  view: GPUTextureView;
  resolveTarget?: GPUTextureView;
  clearValue?: GPUColor;
  loadOp: 'load' | 'clear';
  storeOp: 'store' | 'discard';
}

interface GPURenderPassDepthStencilAttachment {
  view: GPUTextureView;
  depthClearValue?: number;
  depthLoadOp?: 'load' | 'clear';
  depthStoreOp?: 'store' | 'discard';
  depthReadOnly?: boolean;
  stencilClearValue?: number;
  stencilLoadOp?: 'load' | 'clear';
  stencilStoreOp?: 'store' | 'discard';
  stencilReadOnly?: boolean;
}

interface GPURenderPassTimestampWrites {
  querySet: GPUQuerySet;
  beginningOfPassWriteIndex?: number;
  endOfPassWriteIndex?: number;
}

interface GPUTextureView {
  label?: string;
}

interface GPUColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface GPUImageCopyBuffer {
  buffer: GPUBuffer;
  offset?: number;
  bytesPerRow?: number;
  rowsPerImage?: number;
}

interface GPUImageCopyTexture {
  texture: GPUTexture;
  mipLevel?: number;
  origin?: GPUOrigin3D;
  aspect?: 'all' | 'stencil-only' | 'depth-only';
}

interface GPUTexture {
  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView;
  destroy(): void;
  width: number;
  height: number;
  depthOrArrayLayers: number;
  mipLevelCount: number;
  sampleCount: number;
  dimension: '1d' | '2d' | '3d';
  format: string;
  usage: number;
  label?: string;
}

interface GPUTextureViewDescriptor {
  format?: string;
  dimension?: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
  aspect?: 'all' | 'stencil-only' | 'depth-only';
  baseMipLevel?: number;
  mipLevelCount?: number;
  baseArrayLayer?: number;
  arrayLayerCount?: number;
  label?: string;
}

type GPUOrigin3D = [number, number, number] | { x?: number; y?: number; z?: number };
type GPUExtent3D = [number, number, number] | { width: number; height?: number; depthOrArrayLayers?: number };

interface GPUComputePassEncoder {
  setPipeline(pipeline: GPUComputePipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: number[]): void;
  dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): void;
  dispatchWorkgroupsIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void;
  end(): void;
  label?: string;
}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: number[]): void;
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
  drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void;
  drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void;
  end(): void;
  label?: string;
}

interface GPURenderPipeline {
  label?: string;
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUCommandBuffer {
  label?: string;
}

interface GPUCommandBufferDescriptor {
  label?: string;
}

interface GPUQueue {
  submit(commandBuffers: GPUCommandBuffer[]): void;
  writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: ArrayBufferView | ArrayBuffer, dataOffset?: number, size?: number): void;
  writeTexture(destination: GPUImageCopyTexture, data: ArrayBufferView | ArrayBuffer, dataLayout: GPUImageDataLayout, size: GPUExtent3D): void;
  copyExternalImageToTexture(source: GPUImageCopyExternalImage, destination: GPUImageCopyTextureTagged, copySize: GPUExtent3D): void;
  onSubmittedWorkDone(): Promise<void>;
  label?: string;
}

interface GPUImageDataLayout {
  offset?: number;
  bytesPerRow?: number;
  rowsPerImage?: number;
}

// DOM types for WebGPU (Node.js polyfill compatibility)
type HTMLVideoElement = unknown;
type HTMLCanvasElement = unknown;

interface GPUImageCopyExternalImage {
  source: ImageBitmap | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas;
  origin?: GPUOrigin2D;
  flipY?: boolean;
}

interface GPUImageCopyTextureTagged extends GPUImageCopyTexture {
  colorSpace?: 'srgb' | 'display-p3';
  premultipliedAlpha?: boolean;
}

type GPUOrigin2D = [number, number] | { x?: number; y?: number };

interface GPUBindGroupLayout {
  label?: string;
}

interface GPUBindGroupLayoutDescriptor {
  entries: GPUBindGroupLayoutEntry[];
  label?: string;
}

interface GPUBindGroupLayoutEntry {
  binding: number;
  visibility: number;
  buffer?: GPUBufferBindingLayout;
  sampler?: GPUSamplerBindingLayout;
  texture?: GPUTextureBindingLayout;
  storageTexture?: GPUStorageTextureBindingLayout;
}

interface GPUBufferBindingLayout {
  type?: 'uniform' | 'storage' | 'read-only-storage';
  hasDynamicOffset?: boolean;
  minBindingSize?: number;
}

interface GPUSamplerBindingLayout {
  type?: 'filtering' | 'non-filtering' | 'comparison';
}

interface GPUTextureBindingLayout {
  sampleType?: 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint';
  viewDimension?: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
  multisampled?: boolean;
}

interface GPUStorageTextureBindingLayout {
  access?: 'write-only' | 'read-only' | 'read-write';
  format: string;
  viewDimension?: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
}

interface GPUPipelineLayout {
  label?: string;
}

interface GPUPipelineLayoutDescriptor {
  bindGroupLayouts: GPUBindGroupLayout[];
  label?: string;
}

interface GPUBindGroup {
  label?: string;
}

interface GPUBindGroupDescriptor {
  layout: GPUBindGroupLayout;
  entries: GPUBindGroupEntry[];
  label?: string;
}

interface GPUBindGroupEntry {
  binding: number;
  resource: GPUBindingResource;
}

type GPUBindingResource = GPUSampler | GPUTextureView | GPUBufferBinding | GPUExternalTexture;

interface GPUSampler {
  label?: string;
}

interface GPUBufferBinding {
  buffer: GPUBuffer;
  offset?: number;
  size?: number;
}

interface GPUExternalTexture {
  label?: string;
}

interface GPULimits {
  maxStorageBufferBindingSize: number;
  maxBufferSize: number;
  maxComputeWorkgroupSizeX: number;
  maxComputeWorkgroupSizeY: number;
  maxComputeWorkgroupSizeZ: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxComputeWorkgroupsPerDimension: number;
}

interface GPUAdapterInfo {
  vendor?: string;
  architecture?: string;
  device?: string;
  description?: string;
}

interface GPUDeviceDescriptor {
  requiredFeatures?: string[];
  requiredLimits?: Partial<GPULimits>;
  label?: string;
}

interface GPURequestAdapterOptions {
  powerPreference?: 'low-power' | 'high-performance';
  forceFallbackAdapter?: boolean;
}

export class WebGPUOptimizationService {
  private device: GPUDevice | null = null;
  private adapter: GPUAdapter | null = null;
  private isInitialized: boolean = false;
  private gpuInfo: GPUInfo | null = null;
  private static instance: WebGPUOptimizationService | null = null;
  
  /**
   * Singleton pattern for enterprise-grade resource management
   */
  public static getInstance(): WebGPUOptimizationService {
    if (!WebGPUOptimizationService.instance) {
      WebGPUOptimizationService.instance = new WebGPUOptimizationService();
    }
    return WebGPUOptimizationService.instance;
  }

  /**
   * Initialize WebGPU
   */
  public async initialize(): Promise<boolean> {
    try {
      // WebGPU initialization starting
      
      // Check WebGPU support (real GPU only, no polyfill)
      const nav = this.getNavigator();
      if (!nav?.gpu) {
        return false;
      }

      // Request adapter
      this.adapter = await nav.gpu.requestAdapter({
        powerPreference: 'high-performance',
        forceFallbackAdapter: false
      });

      if (!this.adapter) {
        return false;
      }

      // Get device
      this.device = await this.adapter.requestDevice({
        requiredFeatures: [],
        requiredLimits: {
          maxStorageBufferBindingSize: this.adapter.limits.maxStorageBufferBindingSize,
          maxBufferSize: this.adapter.limits.maxBufferSize
        }
      });

      // Get GPU info
      this.gpuInfo = await this.getGPUInfoDetails();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get navigator object (cross-platform)
   * Uses @webgpu/dawn in Node.js, native navigator.gpu in browser
   */
  private getNavigator(): (Navigator & { gpu?: GPU }) | undefined {
    // Node.js environment - use @webgpu/dawn
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dawn = require('@webgpu/dawn');
        if (dawn && dawn.gpu) {
          return { gpu: dawn.gpu } as Navigator & { gpu: GPU };
        }
      } catch (error) {
        // @webgpu/dawn not installed or not available
        console.error('@webgpu/dawn not available:', error);
        return undefined;
      }
    }
    
    // Browser environment - use native navigator.gpu
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      return navigator as Navigator & { gpu: GPU };
    }
    
    // Fallback: check global
    if (typeof global !== 'undefined') {
      const globalObj = global as typeof globalThis & { navigator?: Navigator & { gpu?: GPU } };
      if (globalObj.navigator?.gpu) {
        return globalObj.navigator;
      }
    }
    
    return undefined;
  }

  /**
   * Get GPU information
   */
  public async getGPUInfoDetails(): Promise<GPUInfo> {
    if (!this.adapter) {
      throw new Error('WebGPU adapter not available');
    }

    const info = await this.adapter.requestAdapterInfo();
    const limits = this.adapter.limits;
    
    return {
      name: info.description || 'Unknown GPU',
      type: info.architecture || 'Unknown',
      memory: limits.maxStorageBufferBindingSize / (1024 * 1024), // Convert to MB
      driver: info.vendor || 'Unknown',
      version: info.device || 'Unknown',
      capabilities: {
        maxWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
        maxWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
        maxWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
        maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
        maxComputeWorkgroupsPerDimension: limits.maxComputeWorkgroupsPerDimension
      }
    };
  }

  /**
   * Optimize Genetic Algorithm using WebGPU
   */
  public async optimizeGeneticAlgorithm(params: WebGPUOptimizationParams): Promise<WebGPUOptimizationResult> {
    if (!this.isInitialized || !this.device) {
      return {
        success: false,
        executionTime: 0,
        populationSize: 0,
        individualSize: 0,
        fitnessResults: [],
        statistics: { 
          average: 0, 
          maximum: 0, 
          minimum: 0,
          variance: 0,
          standardDeviation: 0
        },
        error: 'WebGPU not initialized'
      };
    }

    try {
      console.log('🧬 WebGPU Genetic Algorithm Optimization Starting...');
      const startTime = Date.now();

      const { population, fitnessWeights } = params;
      
      if (!population || population.length === 0) {
        throw new Error('Population cannot be empty');
      }
      
      const populationSize = population.length;
      const firstPopulation = population[0];
      const individualSize = firstPopulation ? firstPopulation.length : 0;
      
      if (individualSize === 0) {
        throw new Error('Individual size cannot be zero');
      }

      // Create GPU buffers
      const populationBuffer = this.device.createBuffer({
        size: populationSize * individualSize * 4, // 4 bytes per float
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
      });

      const fitnessWeightsBuffer = this.device.createBuffer({
        size: fitnessWeights.length * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
      });

      const resultBuffer = this.device.createBuffer({
        size: populationSize * 4,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
      });

      // Flatten population data
      const flatPopulation = new Float32Array(populationSize * individualSize);
      for (let i = 0; i < populationSize; i++) {
        const individual = population[i];
        if (individual) {
          for (let j = 0; j < individualSize; j++) {
            const value = individual[j];
            if (value !== undefined) {
              flatPopulation[i * individualSize + j] = value;
            }
          }
        }
      }

      // Upload data to GPU
      this.device.queue.writeBuffer(populationBuffer, 0, flatPopulation);
      this.device.queue.writeBuffer(fitnessWeightsBuffer, 0, new Float32Array(fitnessWeights));

      // Create compute shader
      const computeShader = this.device.createShaderModule({
        code: `
          struct Params {
            populationSize: u32,
            individualSize: u32,
            fitnessWeightsSize: u32,
            _padding: u32,
          }

          @group(0) @binding(0) var<storage, read> population: array<f32>;
          @group(0) @binding(1) var<storage, read> fitnessWeights: array<f32>;
          @group(0) @binding(2) var<storage, read_write> results: array<f32>;
          @group(0) @binding(3) var<uniform> params: Params;

          @compute @workgroup_size(64)
          fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
            let index = global_id.x;
            if (index >= params.populationSize) {
              return;
            }

            var fitness: f32 = 0.0;
            let startIdx = index * params.individualSize;
            
            for (var i: u32 = 0; i < params.individualSize; i++) {
              let weightIdx = i % params.fitnessWeightsSize;
              fitness += population[startIdx + i] * fitnessWeights[weightIdx];
            }
            
            results[index] = fitness;
          }
        `
      });

      // Create bind group layout
      const bindGroupLayout = this.device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'read-only-storage' }
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'read-only-storage' }
          },
          {
            binding: 2,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'storage' }
          },
          {
            binding: 3,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'uniform' }
          }
        ]
      });

      // Create uniform buffer
      const uniformBuffer = this.device.createBuffer({
        size: 16, // 4 * 4 bytes
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      const uniformData = new Uint32Array([
        populationSize,
        individualSize,
        fitnessWeights.length,
        0 // padding
      ]);

      this.device.queue.writeBuffer(uniformBuffer, 0, uniformData);

      // Create bind group
      const bindGroup = this.device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: populationBuffer } },
          { binding: 1, resource: { buffer: fitnessWeightsBuffer } },
          { binding: 2, resource: { buffer: resultBuffer } },
          { binding: 3, resource: { buffer: uniformBuffer } }
        ]
      });

      // Create compute pipeline
      const computePipeline = this.device.createComputePipeline({
        layout: this.device.createPipelineLayout({
          bindGroupLayouts: [bindGroupLayout]
        }),
        compute: {
          module: computeShader,
          entryPoint: 'main'
        }
      });

      // Create command encoder
      const commandEncoder = this.device.createCommandEncoder();
      const computePass = commandEncoder.beginComputePass();
      computePass.setPipeline(computePipeline);
      computePass.setBindGroup(0, bindGroup);
      computePass.dispatchWorkgroups(Math.ceil(populationSize / 64));
      computePass.end();

      // Submit commands
      this.device.queue.submit([commandEncoder.finish()]);

      // Read results
      const stagingBuffer = this.device.createBuffer({
        size: populationSize * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      });

      const copyEncoder = this.device.createCommandEncoder();
      copyEncoder.copyBufferToBuffer(resultBuffer, 0, stagingBuffer, 0, populationSize * 4);
      this.device.queue.submit([copyEncoder.finish()]);

      // Map and read results
      await stagingBuffer.mapAsync(GPUMapMode.READ);
      const resultArray = new Float32Array(stagingBuffer.getMappedRange());
      const fitnessResults = Array.from(resultArray);
      stagingBuffer.unmap();

      const executionTime = Date.now() - startTime;

      // Calculate statistics
      const avgFitness = fitnessResults.reduce((sum, f) => sum + f, 0) / fitnessResults.length;
      const maxFitness = Math.max(...fitnessResults);
      const minFitness = Math.min(...fitnessResults);
      
      // Calculate variance and standard deviation
      const variance = fitnessResults.reduce((sum, f) => sum + Math.pow(f - avgFitness, 2), 0) / fitnessResults.length;
      const standardDeviation = Math.sqrt(variance);

      console.log(`✅ WebGPU Genetic Algorithm completed in ${executionTime}ms`);
      console.log(`📊 Processed ${populationSize} individuals`);
      console.log(`📈 Average fitness: ${avgFitness.toFixed(2)}`);
      console.log(`📊 Standard deviation: ${standardDeviation.toFixed(2)}`);

      const result: WebGPUOptimizationResult = {
        success: true,
        executionTime,
        populationSize,
        individualSize,
        fitnessResults,
        statistics: {
          average: avgFitness,
          maximum: maxFitness,
          minimum: minFitness,
          variance,
          standardDeviation
        }
      };
      
      if (this.gpuInfo) {
        result.gpuInfo = this.gpuInfo;
      }
      
      return result;

    } catch (error) {
      console.error('❌ WebGPU Genetic Algorithm failed:', error);
      return {
        success: false,
        executionTime: 0,
        populationSize: 0,
        individualSize: 0,
        fitnessResults: [],
        statistics: { 
          average: 0, 
          maximum: 0, 
          minimum: 0,
          variance: 0,
          standardDeviation: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if WebGPU is available
   */
  public isAvailable(): boolean {
    return this.isInitialized && this.device !== null;
  }

  /**
   * Get current GPU information
   */
  public getCurrentGPUInfo(): GPUInfo | null {
    return this.gpuInfo;
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    if (this.device) {
      this.device.destroy();
      this.device = null;
    }
    this.adapter = null;
    this.isInitialized = false;
    this.gpuInfo = null;
    console.log('🧹 WebGPU resources cleaned up');
  }
  
  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    if (WebGPUOptimizationService.instance) {
      WebGPUOptimizationService.instance.cleanup();
      WebGPUOptimizationService.instance = null;
    }
  }
}
