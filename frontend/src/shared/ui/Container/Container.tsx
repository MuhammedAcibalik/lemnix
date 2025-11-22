/**
 * @fileoverview Container Component
 * @module shared/ui/Container
 * @description Responsive container component with max-width constraints
 */

import React from "react";
import {
  zoomAwareContainer,
  safeMaxWidth,
  fluidSpacing,
  pxToRem,
} from "@/shared/lib/zoom-aware";

export interface ContainerProps {
  /** Content to render inside container */
  children: React.ReactNode;
  /** Maximum width variant */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Center the container */
  center?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
}

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
};

/**
 * Container component with responsive max-width
 * Follows mobile-first design principles
 */
export const Container: React.FC<ContainerProps> = ({
  children,
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
  };

  return (
    <Component style={styles} className={className}>
      {children}
    </Component>
  );
};

Container.displayName = "Container";
