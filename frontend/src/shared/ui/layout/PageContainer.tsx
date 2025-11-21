/**
 * @fileoverview Page Container Component
 * @module shared/ui/layout
 * @version 1.0.0
 *
 * @description
 * Standardized page container with responsive max-width and padding.
 * Follows the responsive pattern from the responsive web app design example.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <HeroSection />
 *   <FeaturesSection />
 * </PageContainer>
 * ```
 */

import React from "react";
import { Box, BoxProps } from "@mui/material";
import { useDeviceInfo } from "@/shared/hooks/useDeviceInfo";
import { useDesignSystem } from "@/shared/hooks/useDesignSystem";
import {
  zoomAwareContainer,
  safeMaxWidth,
  fluidSpacing,
  pxToRem,
} from "@/shared/lib/zoom-aware";

export interface PageContainerProps extends Omit<BoxProps, "component"> {
  /**
   * Override the default semantic element
   * @default "main"
   */
  readonly component?: React.ElementType;
}

/**
 * Get max-width based on responsive mode
 * Returns number for safeMaxWidth calculation (0 = 100%)
 */
function getMaxWidth(
  responsiveMode: "mobile" | "tablet" | "desktop" | "wide",
): number {
  switch (responsiveMode) {
    case "mobile":
      return 0; // 100% - will be handled by safeMaxWidth
    case "tablet":
      return 960; // md container
    case "desktop":
      return 1280; // max-w-7xl
    case "wide":
      return 1536; // 2xl
    default:
      return 1280;
  }
}

/**
 * Get horizontal padding based on responsive mode
 */
function getHorizontalPadding(
  responsiveMode: "mobile" | "tablet" | "desktop" | "wide",
  spacing: ReturnType<typeof useDesignSystem>["spacing"],
): number {
  switch (responsiveMode) {
    case "mobile":
      return spacing["4"]; // 16px
    case "tablet":
      return spacing["6"]; // 24px
    case "desktop":
      return spacing["8"]; // 32px
    case "wide":
      return spacing["8"]; // 32px
    default:
      return spacing["4"];
  }
}

/**
 * Page Container Component
 *
 * Provides a standardized container with responsive max-width and padding.
 * Uses responsiveMode from useDeviceInfo hook to determine layout constraints.
 *
 * @example
 * ```tsx
 * <PageContainer sx={{ minHeight: "100vh" }}>
 *   <YourContent />
 * </PageContainer>
 * ```
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  component = "main",
  sx,
  ...rest
}) => {
  const { responsiveMode } = useDeviceInfo();
  const ds = useDesignSystem();

  const maxWidthValue = getMaxWidth(responsiveMode);
  const px = getHorizontalPadding(responsiveMode, ds.spacing);

  return (
    <Box
      component={component}
      sx={{
        ...zoomAwareContainer, // ✅ Zoom-aware base styles
        // ✅ Safe max-width constraint (mobile = 100%, others = safe max)
        maxWidth:
          maxWidthValue === 0 ? "100%" : safeMaxWidth(pxToRem(maxWidthValue)), // min(maxWidth, 100%)
        width: "100%",
        mx: "auto",
        // ✅ Fluid padding that scales with zoom
        px: fluidSpacing(
          pxToRem(px * 0.75), // Min: 75% of base padding
          pxToRem(px * 1.25), // Max: 125% of base padding
          0.3, // Viewport unit multiplier
        ),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};
