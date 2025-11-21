/**
 * WebGPU Types
 * Note: WebGPU operations run in browser, backend only provides status information
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
