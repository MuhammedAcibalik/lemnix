/**
 * @fileoverview Grid Component
 * @module shared/ui/Grid
 * @description Responsive grid system with flexible columns
 */

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

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
<<<<<<< HEAD
  gap?: "none" | "sm" | "md" | "lg" | "xl";
=======
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

<<<<<<< HEAD
import { responsiveGap, pxToRem, zoomAwareGrid } from "@/shared/lib/zoom-aware";

// ✅ Fluid gap that scales with zoom
const gapClasses = {
  none: "0",
  sm: responsiveGap(pxToRem(6), pxToRem(10), 0.3), // 0.375rem - 0.625rem
  md: responsiveGap(pxToRem(12), pxToRem(20), 0.3), // 0.75rem - 1.25rem
  lg: responsiveGap(pxToRem(20), pxToRem(28), 0.3), // 1.25rem - 1.75rem
  xl: responsiveGap(pxToRem(28), pxToRem(36), 0.3), // 1.75rem - 2.25rem
=======
const gapClasses = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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
<<<<<<< HEAD
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
=======
  gap = 'md',
  className = '',
  as: Component = 'div',
}) => {
  const styles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: gapClasses[gap],
  };

  // Build media query styles
  const mediaStyles = `
    @media (min-width: 768px) {
      grid-template-columns: repeat(${colsMd || cols}, minmax(0, 1fr));
    }
    @media (min-width: 1024px) {
      grid-template-columns: repeat(${colsLg || colsMd || cols}, minmax(0, 1fr));
    }
    @media (min-width: 1280px) {
      grid-template-columns: repeat(${colsXl || colsLg || colsMd || cols}, minmax(0, 1fr));
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
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

<<<<<<< HEAD
Grid.displayName = "Grid";
=======
Grid.displayName = 'Grid';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
