/**
 * Card Component v3.0 - Enhanced Modern Design
 *
 * @module shared/ui/Card
 * @version 3.0.0 - Complete UI/UX Modernization
 */

import React, { forwardRef, useMemo } from "react";
import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Box,
  Typography,
  IconButton,
  Divider,
  alpha,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { zoomAwareCard, fluidSpacing } from "@/shared/lib/zoom-aware";

type CardVariant =
  | "elevated"
  | "outlined"
  | "filled"
  | "gradient"
  | "glass"
  | "soft";

type CardSize = "sm" | "md" | "lg";

export interface CardV3Props extends Omit<MuiCardProps, "variant"> {
  readonly variant?: CardVariant;
  readonly size?: CardSize;
  readonly hoverable?: boolean;
  readonly interactive?: boolean;
  readonly glow?: boolean;
  readonly title?: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly headerDivider?: boolean;
  readonly footerDivider?: boolean;
}

/**
 * Build variant-specific styles
 */
const buildVariantStyles = (
  ds: ReturnType<typeof useDesignSystem>,
  variant: CardVariant,
  hoverable: boolean,
  interactive: boolean,
  glow: boolean,
) => {
  const baseStyles = {
    borderRadius: `${ds.borderRadius.card}px`,
    transition: `all ${ds.duration.base}ms ${ds.easing.easeOut}`,
    overflow: "hidden" as const,
    position: "relative" as const,

    ...(hoverable && {
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-4px)",
      },
    }),

    ...(interactive && {
      cursor: "pointer",
      "&:active": {
        transform: "scale(0.98)",
      },
    }),
  };

  const variants: Record<CardVariant, Record<string, unknown>> = {
    elevated: {
      background: ds.gradients.surface.white,
      border: `1px solid ${ds.colors.border.muted}`,
      boxShadow: ds.shadows.card.default,
      "&:hover": {
        boxShadow: hoverable
          ? glow
            ? ds.shadows.glow.primary
            : ds.shadows.card.hover
          : ds.shadows.card.default,
        borderColor: ds.colors.border.default,
      },
    },

    outlined: {
      background: ds.colors.surface.base,
      border: `2px solid ${ds.colors.border.default}`,
      boxShadow: ds.shadows.none,
      "&:hover": {
        borderColor: hoverable
          ? ds.colors.border.strong
          : ds.colors.border.default,
        backgroundColor: ds.colors.surface.elevated1,
        boxShadow: hoverable ? ds.shadows.soft.sm : ds.shadows.none,
      },
    },

    filled: {
      background: ds.colors.surface.elevated2,
      border: `1px solid ${ds.colors.border.muted}`,
      boxShadow: ds.shadows.none,
      "&:hover": {
        backgroundColor: hoverable
          ? ds.colors.surface.elevated3
          : ds.colors.surface.elevated2,
        boxShadow: hoverable ? ds.shadows.soft.sm : ds.shadows.none,
      },
    },

    gradient: {
      background: ds.gradients.primary.subtle,
      border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
      boxShadow: ds.shadows.soft.sm,
      "&:hover": {
        background: hoverable
          ? `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.15)} 0%, ${alpha(ds.colors.accent.main, 0.15)} 100%)`
          : ds.gradients.primary.subtle,
        boxShadow: hoverable
          ? glow
            ? ds.shadows.glow.primary
            : ds.shadows.soft.md
          : ds.shadows.soft.sm,
        borderColor: alpha(ds.colors.primary.main, 0.3),
      },
    },

    glass: {
      ...ds.getGlassStyle("light"),
      "&:hover": {
        ...ds.getGlassStyle(hoverable ? "medium" : "light"),
      },
    },

    soft: {
      background: `linear-gradient(135deg, ${ds.colors.surface.base} 0%, ${ds.colors.surface.elevated1} 100%)`,
      border: `1px solid ${ds.colors.border.subtle}`,
      boxShadow: ds.shadows.soft.xs,
      "&:hover": {
        background: hoverable
          ? `linear-gradient(135deg, ${ds.colors.surface.elevated1} 0%, ${ds.colors.surface.elevated2} 100%)`
          : `linear-gradient(135deg, ${ds.colors.surface.base} 0%, ${ds.colors.surface.elevated1} 100%)`,
        boxShadow: hoverable ? ds.shadows.soft.sm : ds.shadows.soft.xs,
      },
    },
  };

  return {
    ...baseStyles,
    ...variants[variant],
  };
};

/**
 * Get size-specific padding
 */
const getSizePadding = (
  ds: ReturnType<typeof useDesignSystem>,
  size: CardSize,
) => {
  const sizeMap = {
    sm: ds.spacing["4"],
    md: ds.spacing["6"],
    lg: ds.spacing["8"],
  };

  return sizeMap[size];
};

/**
 * CardV3 Component
 *
 * Modern card with enhanced visual design and elevation
 */
export const CardV3 = forwardRef<HTMLDivElement, CardV3Props>(
  (
    {
      variant = "elevated",
      size = "md",
      hoverable = false,
      interactive = false,
      glow = false,
      title,
      subtitle,
      action,
      footer,
      headerDivider = false,
      footerDivider = false,
      children,
      sx = {},
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    const variantStyles = useMemo(
      () => buildVariantStyles(ds, variant, hoverable, interactive, glow),
      [ds, variant, hoverable, interactive, glow],
    );

    const padding = useMemo(() => getSizePadding(ds, size), [ds, size]);

    const mergedSx = useMemo(
      () => ({
        ...zoomAwareCard, // ✅ Zoom-aware base styles
        ...variantStyles,
        // ✅ Fluid padding that scales with zoom
        padding: fluidSpacing(
          `${padding * 0.75}px`, // Min: 75% of base padding
          `${padding * 1.25}px`, // Max: 125% of base padding
          0.3, // Viewport unit multiplier
        ),
        ...sx,
      }),
      [variantStyles, padding, sx],
    );

    const hasHeader = title || subtitle || action;
    const hasFooter = !!footer;

    return (
      <MuiCard ref={ref} sx={mergedSx} {...props}>
        {/* Header */}
        {hasHeader && (
          <>
            <CardHeader
              title={
                title && (
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: ds.fontWeight.semibold,
                      color: ds.colors.text.primary,
                    }}
                  >
                    {title}
                  </Typography>
                )
              }
              subheader={
                subtitle && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: ds.colors.text.secondary,
                      mt: 0.5,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )
              }
              action={action}
              sx={{
                padding: `${padding}px`,
                paddingBottom: headerDivider
                  ? `${padding}px`
                  : `${padding / 2}px`,
              }}
            />
            {headerDivider && (
              <Divider
                sx={{
                  borderColor: ds.colors.border.muted,
                }}
              />
            )}
          </>
        )}

        {/* Content */}
        <CardContent
          sx={{
            // ✅ Fluid padding that scales with zoom
            padding: fluidSpacing(
              `${padding * 0.75}px`, // Min: 75% of base padding
              `${padding * 1.25}px`, // Max: 125% of base padding
              0.3, // Viewport unit multiplier
            ),
            paddingTop:
              hasHeader && !headerDivider
                ? fluidSpacing(
                    `${padding * 0.375}px`,
                    `${padding * 0.625}px`,
                    0.3,
                  )
                : fluidSpacing(
                    `${padding * 0.75}px`,
                    `${padding * 1.25}px`,
                    0.3,
                  ),
            paddingBottom:
              hasFooter && !footerDivider
                ? fluidSpacing(
                    `${padding * 0.375}px`,
                    `${padding * 0.625}px`,
                    0.3,
                  )
                : fluidSpacing(
                    `${padding * 0.75}px`,
                    `${padding * 1.25}px`,
                    0.3,
                  ),
            "&:last-child": {
              paddingBottom: fluidSpacing(
                `${padding * 0.75}px`,
                `${padding * 1.25}px`,
                0.3,
              ),
            },
          }}
        >
          {children}
        </CardContent>

        {/* Footer */}
        {hasFooter && (
          <>
            {footerDivider && (
              <Divider
                sx={{
                  borderColor: ds.colors.border.muted,
                }}
              />
            )}
            <CardActions
              sx={{
                padding: `${padding}px`,
                paddingTop: footerDivider ? `${padding}px` : `${padding / 2}px`,
                backgroundColor:
                  variant === "filled"
                    ? ds.colors.surface.elevated1
                    : "transparent",
              }}
            >
              {footer}
            </CardActions>
          </>
        )}
      </MuiCard>
    );
  },
);

CardV3.displayName = "CardV3";

/**
 * Pre-configured card variants for common use cases
 */

export const MetricCard = forwardRef<HTMLDivElement, CardV3Props>(
  (props, ref) => (
    <CardV3 ref={ref} variant="gradient" size="sm" hoverable glow {...props} />
  ),
);

MetricCard.displayName = "MetricCard";

export const DashboardCard = forwardRef<HTMLDivElement, CardV3Props>(
  (props, ref) => (
    <CardV3
      ref={ref}
      variant="elevated"
      size="md"
      hoverable
      headerDivider
      {...props}
    />
  ),
);

DashboardCard.displayName = "DashboardCard";

export const FeatureCard = forwardRef<HTMLDivElement, CardV3Props>(
  (props, ref) => (
    <CardV3
      ref={ref}
      variant="soft"
      size="lg"
      hoverable
      interactive
      {...props}
    />
  ),
);

FeatureCard.displayName = "FeatureCard";

export const GlassCard = forwardRef<HTMLDivElement, CardV3Props>(
  (props, ref) => (
    <CardV3 ref={ref} variant="glass" size="md" hoverable {...props} />
  ),
);

GlassCard.displayName = "GlassCard";

export default CardV3;
