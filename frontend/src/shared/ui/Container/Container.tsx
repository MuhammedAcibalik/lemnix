/**
 * @fileoverview Container Component
 * @module shared/ui/Container
 * @description Responsive container component with max-width constraints
 */

<<<<<<< HEAD
import React from "react";
import {
  zoomAwareContainer,
  safeMaxWidth,
  fluidSpacing,
  pxToRem,
} from "@/shared/lib/zoom-aware";
=======
import React from 'react';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

export interface ContainerProps {
  /** Content to render inside container */
  children: React.ReactNode;
  /** Maximum width variant */
<<<<<<< HEAD
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
=======
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  /** Center the container */
  center?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

<<<<<<< HEAD
// ✅ Zoom-aware max-width with safe constraints
const maxWidthClasses = {
  sm: safeMaxWidth(pxToRem(640)), // min(640px, 100%)
  md: safeMaxWidth(pxToRem(768)),
  lg: safeMaxWidth(pxToRem(1024)),
  xl: safeMaxWidth(pxToRem(1280)),
  "2xl": safeMaxWidth(pxToRem(1536)),
  full: "100%",
};

// ✅ Fluid padding that scales with zoom
const paddingClasses = {
  none: "0",
  sm: fluidSpacing(pxToRem(12), pxToRem(20), 0.3), // 0.75rem - 1.25rem
  md: fluidSpacing(pxToRem(20), pxToRem(32), 0.3), // 1.25rem - 2rem
  lg: fluidSpacing(pxToRem(28), pxToRem(40), 0.3), // 1.75rem - 2.5rem
=======
const maxWidthClasses = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
};

const paddingClasses = {
  none: '0',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
};

/**
 * Container component with responsive max-width
 * Follows mobile-first design principles
 */
export const Container: React.FC<ContainerProps> = ({
  children,
<<<<<<< HEAD
  maxWidth = "xl",
  padding = "md",
  center = true,
  className = "",
  as: Component = "div",
}) => {
  const styles: React.CSSProperties = {
    ...zoomAwareContainer, // ✅ Zoom-aware base styles
    maxWidth: maxWidthClasses[maxWidth],
    paddingLeft: paddingClasses[padding],
    paddingRight: paddingClasses[padding],
    marginLeft: center ? "auto" : undefined,
    marginRight: center ? "auto" : undefined,
=======
  maxWidth = 'xl',
  padding = 'md',
  center = true,
  className = '',
  as: Component = 'div',
}) => {
  const styles: React.CSSProperties = {
    width: '100%',
    maxWidth: maxWidthClasses[maxWidth],
    paddingLeft: paddingClasses[padding],
    paddingRight: paddingClasses[padding],
    marginLeft: center ? 'auto' : undefined,
    marginRight: center ? 'auto' : undefined,
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
  };

  return (
    <Component style={styles} className={className}>
      {children}
    </Component>
  );
};

<<<<<<< HEAD
Container.displayName = "Container";
=======
Container.displayName = 'Container';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
