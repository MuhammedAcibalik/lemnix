/**
 * @fileoverview Device Info Hook - Full Adaptive System
 * @module shared/hooks
 * @version 1.0.0
 *
 * @description
 * Detects device type, UI mode, and interaction capabilities.
 * Part of the full adaptive system that goes beyond simple responsive breakpoints.
 */

import { useEffect, useState } from "react";

export type DeviceType = "mobile" | "tablet" | "laptop" | "desktop" | "tv";

export type UIMode = "mobile" | "compact" | "standard" | "dense" | "kiosk";

export type ResponsiveMode = "mobile" | "tablet" | "desktop" | "wide";

export interface DeviceInfo {
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  readonly orientation: "portrait" | "landscape";
  readonly deviceType: DeviceType;
  readonly uiMode: UIMode;
  readonly responsiveMode: ResponsiveMode;
  readonly isTouch: boolean;
  readonly isHighDPI: boolean;
}

/**
 * Detect device type based on viewport width
 */
function detectDeviceType(width: number): DeviceType {
  if (width >= 2560) return "tv";
  if (width >= 1920) return "desktop";
  if (width >= 1366) return "laptop";
  if (width >= 768) return "tablet";
  return "mobile";
}

/**
 * Detect UI mode based on device type
 */
function detectUIMode(deviceType: DeviceType): UIMode {
  if (deviceType === "tv") return "kiosk";
  if (deviceType === "desktop") return "dense";
  if (deviceType === "laptop") return "standard";
  if (deviceType === "tablet") return "compact";
  return "mobile";
}

/**
 * Detect responsive mode based on viewport width
 *
 * Follows the pattern from responsive web app design:
 * - mobile: < 768px
 * - tablet: 768px - 1199px
 * - desktop: 1200px - 1599px
 * - wide: >= 1600px
 */
function detectResponsiveMode(width: number): ResponsiveMode {
  if (width >= 1600) return "wide";
  if (width >= 1200) return "desktop";
  if (width >= 768) return "tablet";
  return "mobile";
}

/**
 * Get initial device info (SSR-safe)
 */
function getInitialDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    // SSR fallback
    return {
      width: 1920,
      height: 1080,
      dpr: 1,
      orientation: "landscape",
      deviceType: "desktop",
      uiMode: "standard",
      responsiveMode: "desktop",
      isTouch: false,
      isHighDPI: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const orientation = width >= height ? "landscape" : "portrait";
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const deviceType = detectDeviceType(width);
  const uiMode = detectUIMode(deviceType);
  const responsiveMode = detectResponsiveMode(width);
  const isHighDPI = dpr >= 2;

  return {
    width,
    height,
    dpr,
    orientation,
    deviceType,
    uiMode,
    responsiveMode,
    isTouch,
    isHighDPI,
  };
}

/**
 * Device Info Hook
 *
 * Provides real-time device and UI mode information.
 * Updates automatically on window resize or orientation change.
 *
 * @returns Current device information
 * @example
 * ```tsx
 * const { deviceType, uiMode, isTouch } = useDeviceInfo();
 *
 * if (deviceType === 'tv') {
 *   // Kiosk mode UI
 * }
 * ```
 */
export function useDeviceInfo(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(getInitialDeviceInfo);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const orientation = width >= height ? "landscape" : "portrait";
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      const deviceType = detectDeviceType(width);
      const uiMode = detectUIMode(deviceType);
      const responsiveMode = detectResponsiveMode(width);
      const isHighDPI = dpr >= 2;

      setInfo({
        width,
        height,
        dpr,
        orientation,
        deviceType,
        uiMode,
        responsiveMode,
        isTouch,
        isHighDPI,
      });
    }

    // Throttle resize events for performance
    let ticking = false;
    const throttledHandleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleResize();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Listen to resize and orientation change
    window.addEventListener("resize", throttledHandleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, {
      passive: true,
    });

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", throttledHandleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return info;
}
