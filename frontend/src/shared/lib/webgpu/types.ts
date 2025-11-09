/**
 * WebGPU Types
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

export interface WebGPUStatus {
  readonly supported: boolean;
  readonly initialized: boolean;
  readonly deviceName?: string;
  readonly vendor?: string;
  readonly architecture?: string;
}

export interface WebGPUInfo {
  readonly adapter?: {
    readonly name: string;
    readonly vendor: string;
    readonly architecture: string;
    readonly features: ReadonlyArray<string>;
  };
  readonly limits?: Record<string, number>;
}
