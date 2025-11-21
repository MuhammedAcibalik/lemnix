/**
 * @fileoverview Fluid Typography Component
 * @module shared/ui/Typography
 * @description Typography component with fluid fontSize that scales with zoom
 */

import React from "react";
import {
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
} from "@mui/material";
import {
  fluidFontSize,
  zoomAwareText,
  zoomAwareTextMultiLine,
  pxToRem,
} from "@/shared/lib/zoom-aware";

export interface FluidTypographyProps
  extends Omit<MuiTypographyProps, "fontSize"> {
  /**
   * Font size variant - will be made fluid
   */
  readonly fontSize?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | string;
  /**
   * Enable multi-line text wrapping (default: false for single line with ellipsis)
   */
  readonly multiLine?: boolean;
  /**
   * Custom min font size (in rem)
   */
  readonly minFontSize?: string;
  /**
   * Custom max font size (in rem)
   */
  readonly maxFontSize?: string;
}

/**
 * Font size map for fluid calculations
 */
const fontSizeMap: Record<string, number> = {
  xs: 12, // 0.75rem
  sm: 14, // 0.875rem
  base: 16, // 1rem
  lg: 18, // 1.125rem
  xl: 20, // 1.25rem
  "2xl": 24, // 1.5rem
  "3xl": 30, // 1.875rem
  "4xl": 36, // 2.25rem
  "5xl": 48, // 3rem
};

/**
 * Fluid Typography Component
 *
 * Typography with fluid fontSize that scales smoothly with zoom level.
 * Uses clamp() to ensure text never becomes too small or too large.
 *
 * @example
 * ```tsx
 * <FluidTypography variant="h1" fontSize="2xl">
 *   Heading Text
 * </FluidTypography>
 *
 * <FluidTypography fontSize="base" multiLine>
 *   Long text that wraps to multiple lines
 * </FluidTypography>
 * ```
 */
export const FluidTypography: React.FC<FluidTypographyProps> = ({
  fontSize = "base",
  multiLine = false,
  minFontSize,
  maxFontSize,
  sx = {},
  ...props
}) => {
  // Calculate base font size
  const baseFontSize =
    typeof fontSize === "string" && fontSizeMap[fontSize]
      ? fontSizeMap[fontSize]
      : typeof fontSize === "string" && !isNaN(parseFloat(fontSize))
        ? parseFloat(fontSize.replace("rem", "").replace("px", "")) *
          (fontSize.includes("rem") ? 16 : 1)
        : 16; // Default 16px

  // Calculate min and max font sizes
  const min = minFontSize || pxToRem(baseFontSize * 0.9); // 90% of base
  const max = maxFontSize || pxToRem(baseFontSize * 1.1); // 110% of base

  // Apply fluid fontSize
  const fluidFontSizeValue = fluidFontSize(min, max, 0.3);

  return (
    <MuiTypography
      {...props}
      sx={{
        fontSize: fluidFontSizeValue,
        ...(multiLine ? zoomAwareTextMultiLine : zoomAwareText), // ✅ Zoom-aware text styles
        ...sx,
      }}
    />
  );
};

FluidTypography.displayName = "FluidTypography";
