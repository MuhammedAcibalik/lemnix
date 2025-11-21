/**
 * @fileoverview Grid Component
 * @module shared/ui/Grid
 * @description Responsive grid system with flexible columns
 */

import React from "react";

export interface GridProps {
  /** Content to render inside grid */
  children: React.ReactNode;
  /** Number of columns on mobile (default: 1) */
  cols?: number;
  /** Number of columns on tablet (default: same as cols) */
  colsMd?: number;
  /** Number of columns on desktop (default: same as colsMd) */
  colsLg?: number;
  /** Number of columns on wide screens (default: same as colsLg) */
  colsXl?: number;
  /** Gap between grid items */
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

import { responsiveGap, pxToRem, zoomAwareGrid } from "@/shared/lib/zoom-aware";

// ✅ Fluid gap that scales with zoom
const gapClasses = {
  none: "0",
  sm: responsiveGap(pxToRem(6), pxToRem(10), 0.3), // 0.375rem - 0.625rem
  md: responsiveGap(pxToRem(12), pxToRem(20), 0.3), // 0.75rem - 1.25rem
  lg: responsiveGap(pxToRem(20), pxToRem(28), 0.3), // 1.25rem - 1.75rem
  xl: responsiveGap(pxToRem(28), pxToRem(36), 0.3), // 1.75rem - 2.25rem
};

/**
 * Responsive Grid component
 * Uses CSS Grid with mobile-first approach
 */
export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  colsMd,
  colsLg,
  colsXl,
  gap = "md",
  className = "",
  as: Component = "div",
}) => {
  const styles: React.CSSProperties = {
    ...zoomAwareGrid, // ✅ Zoom-aware base styles
    gridTemplateColumns: `repeat(${cols}, minmax(min(17.5rem, 100%), 1fr))`, // ✅ Min 280px per column
    gap: gapClasses[gap],
  };

  // Build media query styles with min-width constraint
  const mediaStyles = `
    @media (min-width: 768px) {
      grid-template-columns: repeat(${colsMd || cols}, minmax(min(17.5rem, 100%), 1fr));
    }
    @media (min-width: 1024px) {
      grid-template-columns: repeat(${colsLg || colsMd || cols}, minmax(min(17.5rem, 100%), 1fr));
    }
    @media (min-width: 1280px) {
      grid-template-columns: repeat(${colsXl || colsLg || colsMd || cols}, minmax(min(17.5rem, 100%), 1fr));
    }
  `;

  return (
    <>
      <style>{mediaStyles}</style>
      <Component style={styles} className={className}>
        {children}
      </Component>
    </>
  );
};

Grid.displayName = "Grid";
