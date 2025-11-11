/**
 * @fileoverview Badge Component v3.0
 * @module shared/ui/Badge
 * @version 3.0.0
 */

import React, { forwardRef } from "react";
import { Box, BoxProps, alpha } from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";

type BadgeVariant = "solid" | "soft" | "outline" | "gradient" | "glass";
type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";
type BadgeSize = "xs" | "sm" | "md" | "lg";

export interface BadgeProps extends Omit<BoxProps, "color"> {
  readonly variant?: BadgeVariant;
  readonly color?: BadgeColor;
  readonly size?: BadgeSize;
  readonly dot?: boolean;
  readonly glow?: boolean;
  readonly pulse?: boolean;
  readonly children: React.ReactNode;
}

/**
 * Badge Component
 *
 * Modern badge with enhanced visual design
 */
export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = "soft",
      color = "primary",
      size = "sm",
      dot = false,
      glow = false,
      children,
      sx = {},
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    // Color mapping
    const colorMap = {
      primary: {
        main: ds.colors.primary.main,
        light: ds.colors.primary.light,
        dark: ds.colors.primary.dark,
        contrast: ds.colors.primary.contrast,
      },
      secondary: {
        main: ds.colors.secondary.main,
        light: ds.colors.secondary.light,
        dark: ds.colors.secondary.dark,
        contrast: ds.colors.secondary.contrast,
      },
      success: {
        main: ds.colors.success.main,
        light: ds.colors.success.light,
        dark: ds.colors.success.dark,
        contrast: "#ffffff",
      },
      warning: {
        main: ds.colors.warning.main,
        light: ds.colors.warning.light,
        dark: ds.colors.warning.dark,
        contrast: ds.colors.text.primary,
      },
      error: {
        main: ds.colors.error.main,
        light: ds.colors.error.light,
        dark: ds.colors.error.dark,
        contrast: "#ffffff",
      },
      info: {
        main: ds.colors.info.main,
        light: ds.colors.info.light,
        dark: ds.colors.info.dark,
        contrast: "#ffffff",
      },
      neutral: {
        main: ds.colors.neutral[500],
        light: ds.colors.neutral[300],
        dark: ds.colors.neutral[700],
        contrast: "#ffffff",
      },
    };

    const colors = colorMap[color];

    // Size mapping
    const sizeMap = {
      xs: {
        height: 18,
        padding: `${ds.spacing["0.5"]}px ${ds.spacing["1.5"]}px`,
        fontSize: ds.fontSize["2xs"],
      },
      sm: {
        height: 20,
        padding: `${ds.spacing["1"]}px ${ds.spacing["2"]}px`,
        fontSize: ds.fontSize.xs,
      },
      md: {
        height: 24,
        padding: `${ds.spacing["1"]}px ${ds.spacing["2.5"]}px`,
        fontSize: ds.fontSize.sm,
      },
      lg: {
        height: 28,
        padding: `${ds.spacing["1.5"]}px ${ds.spacing["3"]}px`,
        fontSize: ds.fontSize.base,
      },
    };

    const sizeConfig = sizeMap[size];

    // Variant styles
    const variantStyles = {
      solid: {
        background: colors.main,
        color: colors.contrast,
        border: "none",
        boxShadow: glow ? ds.shadows.glow[color] : ds.shadows.none,
      },
      soft: {
        background: alpha(colors.main, 0.12),
        color: colors.dark,
        border: `1px solid ${alpha(colors.main, 0.2)}`,
        boxShadow: ds.shadows.none,
      },
      outline: {
        background: "transparent",
        color: colors.main,
        border: `1.5px solid ${colors.main}`,
        boxShadow: ds.shadows.none,
      },
      gradient: {
        background: `linear-gradient(135deg, ${colors.main} 0%, ${colors.light} 100%)`,
        color: colors.contrast,
        border: "none",
        boxShadow: glow ? ds.shadows.glow[color] : ds.shadows.soft.xs,
      },
      glass: {
        ...ds.getGlassStyle("light"),
        color: colors.dark,
        border: `1px solid ${alpha(colors.main, 0.3)}`,
      },
    };

    return (
      <Box
        ref={ref}
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: `${ds.spacing["1"]}px`,
          height: sizeConfig.height,
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          fontWeight: ds.fontWeight.semibold,
          letterSpacing: ds.letterSpacing.wide,
          borderRadius: `${ds.borderRadius.pill}px`,
          transition: `all ${ds.duration.fast}ms ${ds.easing.easeOut}`,
          lineHeight: 1,
          whiteSpace: "nowrap",
          ...variantStyles[variant],
          ...sx,
        }}
        {...props}
      >
        {dot && (
          <Box
            component="span"
            sx={{
              width: size === "xs" ? 4 : size === "sm" ? 5 : 6,
              height: size === "xs" ? 4 : size === "sm" ? 5 : 6,
              borderRadius: "50%",
              backgroundColor: "currentColor",
              animation: glow ? "pulse 2s ease-in-out infinite" : "none",
            }}
          />
        )}
        {children}
      </Box>
    );
  },
);

Badge.displayName = "Badge";

/**
 * Status Badge - Pre-configured for status indicators
 */
export const StatusBadge = forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, "dot"> & {
    status: "active" | "inactive" | "pending" | "error";
  }
>(({ status, ...props }, ref) => {
  const statusMap = {
    active: { color: "success" as const, text: "Active" },
    inactive: { color: "neutral" as const, text: "Inactive" },
    pending: { color: "warning" as const, text: "Pending" },
    error: { color: "error" as const, text: "Error" },
  };

  const config = statusMap[status];

  return (
    <Badge ref={ref} color={config.color} dot {...props}>
      {props.children || config.text}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

/**
 * Metric Badge - Pre-configured for metrics and stats
 */
export const MetricBadge = forwardRef<HTMLDivElement, BadgeProps>(
  (props, ref) => (
    <Badge ref={ref} variant="gradient" size="md" glow {...props} />
  ),
);

MetricBadge.displayName = "MetricBadge";

export default Badge;
