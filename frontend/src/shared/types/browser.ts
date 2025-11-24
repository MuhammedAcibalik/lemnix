/**
 * Browser API Type Extensions
 * Type definitions for browser APIs that may not be fully typed
 *
 * @module shared/types/browser
 * @version 1.0.0
 */

/**
 * Navigator with Microsoft-specific touch point properties
 */
export interface NavigatorWithMsMaxTouchPoints extends Navigator {
  readonly msMaxTouchPoints?: number;
}

/**
 * Window with idle callback APIs
 */
export interface WindowWithIdleCallback {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
  setTimeout: typeof window.setTimeout;
  clearTimeout: typeof window.clearTimeout;
}
