/**
 * @fileoverview Adaptive UI Context - Full Adaptive System
 * @module shared/contexts
 * @version 1.0.0
 *
 * @description
 * React context for adaptive UI system.
 * Provides device info and design tokens to all components in the app.
 */

import React, { createContext, useContext } from "react";
import { useAdaptiveUI, type AdaptiveTokens } from "../hooks/useAdaptiveUI";
import type { DeviceInfo } from "../hooks/useDeviceInfo";

export interface AdaptiveUIContextValue {
  readonly device: DeviceInfo;
  readonly tokens: AdaptiveTokens;
}

const AdaptiveUIContext = createContext<AdaptiveUIContextValue | null>(null);

/**
 * Adaptive UI Provider
 *
 * Provides device info and adaptive design tokens to all child components.
 * Should be placed near the root of the app (after ThemeProvider).
 *
 * @example
 * ```tsx
 * <ThemeProvider theme={theme}>
 *   <AdaptiveUIProvider>
 *     <App />
 *   </AdaptiveUIProvider>
 * </ThemeProvider>
 * ```
 */
export const AdaptiveUIProvider: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  const value = useAdaptiveUI();

  return (
    <AdaptiveUIContext.Provider value={value}>
      {children}
    </AdaptiveUIContext.Provider>
  );
};

/**
 * Adaptive UI Context Hook
 *
 * Returns the current adaptive UI context value.
 * Must be used within an AdaptiveUIProvider.
 *
 * @returns Device info and adaptive design tokens
 * @throws Error if used outside AdaptiveUIProvider
 * @example
 * ```tsx
 * const { device, tokens } = useAdaptiveUIContext();
 *
 * if (device.deviceType === 'tv') {
 *   // Kiosk mode UI
 * }
 * ```
 */
export function useAdaptiveUIContext(): AdaptiveUIContextValue {
  const ctx = useContext(AdaptiveUIContext);

  if (!ctx) {
    throw new Error(
      "useAdaptiveUIContext must be used within AdaptiveUIProvider",
    );
  }

  return ctx;
}
