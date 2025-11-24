/**
 * @fileoverview Responsive Hook - Device Detection and Breakpoint Management
 * @module shared/hooks/useResponsive
 * @version 3.0.0
 */

import { useState, useEffect } from "react";
import { useTheme, Breakpoint } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { NavigatorWithMsMaxTouchPoints } from "../types/browser";

/**
 * Design System v3 Breakpoints (aligned with MUI theme)
 * xs: 320px
 * sm: 480px
 * md: 768px
 * lg: 1024px
 * xl: 1366px
 * xxl: 1920px
 * xxxl: 2560px
 */

export interface ResponsiveState {
  // Current breakpoint
  breakpoint: Breakpoint;

  // Breakpoint checks (Design System v3: xs(320), sm(480), md(768), lg(1024), xl(1366), xxl(1920), xxxl(2560))
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isXxl: boolean;
  isXxxl: boolean;

  // Device groups
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;

  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;

  // Feature flags
  isTouchDevice: boolean;
  isRetina: boolean;

  // Viewport dimensions
  width: number;
  height: number;
}

/**
 * Get current breakpoint based on window width
 * Uses Design System v3 breakpoints: xs(320), sm(480), md(768), lg(1024), xl(1366), xxl(1920), xxxl(2560)
 */
function getCurrentBreakpoint(width: number): Breakpoint {
  // Design System v3 breakpoints
  if (width >= 2560) return "xxxl" as Breakpoint;
  if (width >= 1920) return "xxl" as Breakpoint;
  if (width >= 1366) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 480) return "sm";
  return "xs";
}

/**
 * Check if device has touch support
 */
function isTouchSupported(): boolean {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    ((navigator as NavigatorWithMsMaxTouchPoints).msMaxTouchPoints ?? 0) > 0
  );
}

/**
 * Check if device has retina display
 */
function isRetinaDisplay(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.devicePixelRatio > 1 ||
    (window.matchMedia &&
      window.matchMedia(
        "(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi)",
      ).matches)
  );
}

/**
 * useResponsive Hook
 *
 * Provides comprehensive responsive design utilities including:
 * - Breakpoint detection (xs, sm, md, lg, xl, xxl, xxxl) - Design System v3
 * - Device type detection (mobile, tablet, desktop, wide)
 * - Orientation detection (portrait, landscape)
 * - Feature detection (touch, retina)
 * - Viewport dimensions
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
 *
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * return <DesktopView />;
 * ```
 */
export function useResponsive(): ResponsiveState {
  const theme = useTheme();

  // Media queries for breakpoints (Design System v3)
  // Using MUI theme breakpoints for consistency
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));

  // xxl and xxxl: Using theme breakpoint values for consistency
  // MUI's breakpoints.only() may not support custom breakpoints in all versions,
  // so we use theme values to construct media queries
  const xxlValue = theme.breakpoints.values.xxl ?? 1920;
  const xxxlValue = theme.breakpoints.values.xxxl ?? 2560;
  const isXxl = useMediaQuery(
    `(min-width: ${xxlValue}px) and (max-width: ${xxxlValue - 1}px)`,
  );
  const isXxxl = useMediaQuery(`(min-width: ${xxxlValue}px)`);

  // Orientation
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const isLandscape = useMediaQuery("(orientation: landscape)");

  // State for dynamic values
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [isTouchDevice, setIsTouchDevice] = useState(isTouchSupported());
  const [isRetina, setIsRetina] = useState(isRetinaDisplay());

  // Update dimensions on resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Detect feature changes (e.g., device rotation might change touch support)
  useEffect(() => {
    setIsTouchDevice(isTouchSupported());
    setIsRetina(isRetinaDisplay());
  }, [dimensions.width, dimensions.height]);

  // Determine current breakpoint (Design System v3)
  const breakpoint = getCurrentBreakpoint(dimensions.width);

  // Device groups (Design System v3 breakpoints)
  // Mobile: xs and sm (320-767px)
  const isMobile = isXs || isSm;
  // Tablet: md (768-1023px)
  const isTablet = isMd;
  // Desktop: lg and xl (1024-1919px)
  const isDesktop = isLg || isXl;
  // Wide: xxl and xxxl (1920px+)
  const isWide = isXxl || isXxxl;

  return {
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isXxxl,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isPortrait,
    isLandscape,
    isTouchDevice,
    isRetina,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * Hook to check if viewport is at or above a specific breakpoint
 *
 * @example
 * ```tsx
 * const isDesktopOrAbove = useBreakpoint("lg");
 * ```
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}

/**
 * Hook to check if viewport is below a specific breakpoint
 *
 * @example
 * ```tsx
 * const isMobileOrBelow = useBreakpointDown("sm");
 * ```
 */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
}

/**
 * Hook to check if viewport is between two breakpoints
 *
 * @example
 * ```tsx
 * const isTabletRange = useBreakpointBetween("sm", "lg");
 * ```
 */
export function useBreakpointBetween(
  start: Breakpoint,
  end: Breakpoint,
): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between(start, end));
}
