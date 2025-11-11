/**
 * @fileoverview Responsive Hook - Device Detection and Breakpoint Management
 * @module shared/hooks/useResponsive
 * @version 3.0.0
 */

import { useState, useEffect } from "react";
import { useTheme, Breakpoint } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * MUI Breakpoints (Material UI standard)
 * xs: 0px
 * sm: 600px
 * md: 900px
 * lg: 1200px
 * xl: 1536px
 */

export interface ResponsiveState {
  // Current breakpoint
  breakpoint: Breakpoint;
  
  // Breakpoint checks
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  
  // Device groups
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
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
 */
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width < 600) return "xs";
  if (width < 900) return "sm";
  if (width < 1200) return "md";
  if (width < 1536) return "lg";
  return "xl";
}

/**
 * Check if device has touch support
 */
function isTouchSupported(): boolean {
  if (typeof window === "undefined") return false;
  
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).msMaxTouchPoints > 0
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
        "(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi)"
      ).matches)
  );
}

/**
 * useResponsive Hook
 * 
 * Provides comprehensive responsive design utilities including:
 * - Breakpoint detection (xs, sm, md, lg, xl)
 * - Device type detection (mobile, tablet, desktop)
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
  
  // Media queries for breakpoints
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));
  
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
  
  // Determine current breakpoint
  const breakpoint = getCurrentBreakpoint(dimensions.width);
  
  // Device groups
  // Mobile: xs and sm (0-899px)
  const isMobile = isXs || isSm;
  // Tablet: md (900-1199px)
  const isTablet = isMd;
  // Desktop: lg and xl (1200px+)
  const isDesktop = isLg || isXl;
  
  return {
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isMobile,
    isTablet,
    isDesktop,
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
  end: Breakpoint
): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between(start, end));
}
