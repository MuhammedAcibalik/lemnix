/**
 * @fileoverview Card Grid Component
 * @module shared/ui/layout
 * @version 1.0.0
 *
 * @description
 * Responsive grid layout for cards with standardized columns and gap.
 * Follows the responsive pattern from the responsive web app design example.
 *
 * @example
 * ```tsx
 * <CardGrid>
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </CardGrid>
 * ```
 */

import React from "react";
import { Box, BoxProps } from "@mui/material";
import { useDesignSystem } from "@/shared/hooks/useDesignSystem";
import { zoomAwareGrid, responsiveGap, pxToRem } from "@/shared/lib/zoom-aware";

export interface CardGridProps extends BoxProps {
  /**
   * Number of columns on different breakpoints
   * @default { xs: 1, sm: 2, md: 3, lg: 4 }
   */
  readonly columns?: {
    readonly xs?: number;
    readonly sm?: number;
    readonly md?: number;
    readonly lg?: number;
  };
  /**
   * Gap between grid items
   * @default "4" (16px)
   */
  readonly gap?: keyof ReturnType<typeof useDesignSystem>["spacing"];
}

/**
 * Card Grid Component
 *
 * Provides a responsive grid layout for cards with standardized columns and gap.
 * Uses design system spacing tokens for consistent spacing.
 *
 * Grid template columns:
 * - xs: 1 column
 * - sm: 2 columns
 * - md: 3 columns
 * - lg: 4 columns
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <CardGrid>
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *   </CardGrid>
 * </PageContainer>
 * ```
 */
export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = "4",
  sx,
  ...rest
}) => {
  const ds = useDesignSystem();
  const gapValue = ds.spacing[gap];

  return (
    <Box
      component="div"
      sx={{
        ...zoomAwareGrid, // ✅ Zoom-aware base styles
        gridTemplateColumns: {
          xs: `repeat(${columns.xs ?? 1}, minmax(min(17.5rem, 100%), 1fr))`, // ✅ Min 280px per column
          sm: `repeat(${columns.sm ?? 2}, minmax(min(17.5rem, 100%), 1fr))`,
          md: `repeat(${columns.md ?? 3}, minmax(min(17.5rem, 100%), 1fr))`,
          lg: `repeat(${columns.lg ?? 4}, minmax(min(17.5rem, 100%), 1fr))`,
        },
        // ✅ Fluid gap that scales with zoom
        gap: responsiveGap(
          pxToRem(gapValue * 0.75), // Min: 75% of base gap
          pxToRem(gapValue * 1.25), // Max: 125% of base gap
          0.3, // Viewport unit multiplier
        ),
        width: "100%",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
