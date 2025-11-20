/**
 * @fileoverview Grid Component
 * @module shared/ui/Grid
 * @description Responsive grid system with flexible columns
 */

import React from 'react';

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
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

const gapClasses = {
  none: '0',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
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

Grid.displayName = 'Grid';
