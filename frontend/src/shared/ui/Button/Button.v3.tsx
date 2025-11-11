/**
 * Button Component v3.0 - Enhanced Modern Design
 *
 * @module shared/ui/Button
 * @version 3.0.0 - Complete UI/UX Modernization
 */

import React, { forwardRef, useMemo } from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box,
  alpha,
} from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "gradient"
  | "soft"
  | "link"
  | "danger"
  | "success"
  | "warning"
  | "glass";

export interface ButtonV3Props
  extends Omit<MuiButtonProps, "variant" | "size"> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly glow?: boolean;
}

/**
 * Build comprehensive variant styles with v3 design system
 */
const buildVariantStyles = (
  ds: ReturnType<typeof useDesignSystem>,
  variant: ButtonVariant,
  glow?: boolean,
) => {
  const focusRing = ds.getFocusRing?.("primary") ?? {
    boxShadow: `${ds.focus.ring.primary}`,
    outline: "none",
  };

  const baseStyles = {
    borderRadius: `${ds.borderRadius.button}px`,
    fontWeight: ds.fontWeight.semibold,
    transition: `all ${ds.duration.base}ms ${ds.easing.easeOut}`,
    textTransform: "none" as const,
    letterSpacing: ds.letterSpacing.wide,
    position: "relative" as const,
    overflow: "hidden" as const,

    // Shimmer effect on hover
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background: ds.gradients.shimmer,
      transition: `left ${ds.duration.slow}ms ${ds.easing.easeOut}`,
    },
    "&:hover::before": {
      left: "100%",
    },

    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      boxShadow: ds.shadows.none,
      transform: "none",
      "&::before": {
        display: "none",
      },
    },
    "&:focus-visible": focusRing,
  };

  const variants: Record<ButtonVariant, Record<string, unknown>> = {
    primary: {
      background: ds.gradients.primary.default,
      color: ds.colors.primary.contrast,
      boxShadow: glow ? ds.shadows.glow.primary : ds.shadows.button.default,
      border: "none",
      "&:hover": {
        background: ds.gradients.primary.soft,
        boxShadow: glow ? ds.shadows.glow.primary : ds.shadows.button.hover,
        transform: "translateY(-2px)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: ds.shadows.button.active,
      },
    },

    secondary: {
      background: ds.gradients.secondary.default,
      color: ds.colors.secondary.contrast,
      boxShadow: glow ? ds.shadows.glow.secondary : ds.shadows.button.default,
      border: "none",
      "&:hover": {
        background: ds.gradients.secondary.soft,
        boxShadow: glow ? ds.shadows.glow.secondary : ds.shadows.button.hover,
        transform: "translateY(-2px)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: ds.shadows.button.active,
      },
    },

    tertiary: {
      background: ds.colors.surface.base,
      color: ds.colors.text.primary,
      border: `2px solid ${ds.colors.border.default}`,
      boxShadow: ds.shadows.button.default,
      "&:hover": {
        borderColor: ds.colors.border.strong,
        backgroundColor: ds.colors.surface.elevated1,
        boxShadow: ds.shadows.button.hover,
        transform: "translateY(-1px)",
      },
    },

    ghost: {
      background: "transparent",
      color: ds.colors.primary.main,
      border: "none",
      boxShadow: ds.shadows.none,
      "&:hover": {
        backgroundColor: alpha(ds.colors.primary.main, 0.08),
        color: ds.colors.primary.dark,
      },
      "&:active": {
        backgroundColor: alpha(ds.colors.primary.main, 0.12),
      },
    },

    gradient: {
      background: ds.gradients.primary.default,
      color: ds.colors.primary.contrast,
      boxShadow: ds.shadows.glow.accent,
      border: "none",
      "&:hover": {
        background: ds.gradients.primary.reverse,
        boxShadow: ds.shadows.glow.primary,
        transform: "translateY(-2px) scale(1.02)",
      },
    },

    soft: {
      background: ds.gradients.primary.subtle,
      color: ds.colors.primary.dark,
      border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
      boxShadow: ds.shadows.none,
      "&:hover": {
        backgroundColor: alpha(ds.colors.primary.main, 0.15),
        borderColor: alpha(ds.colors.primary.main, 0.3),
        boxShadow: ds.shadows.soft.sm,
      },
    },

    link: {
      background: "transparent",
      color: ds.colors.text.link,
      border: "none",
      boxShadow: ds.shadows.none,
      padding: 0,
      minWidth: "auto",
      textDecoration: "underline",
      textDecorationColor: "transparent",
      transition: `all ${ds.duration.fast}ms ${ds.easing.easeOut}`,
      "&:hover": {
        color: ds.colors.text.linkHover,
        backgroundColor: "transparent",
        textDecorationColor: ds.colors.text.linkHover,
      },
      "&::before": {
        display: "none",
      },
    },

    danger: {
      background: ds.gradients.error,
      color: "#ffffff",
      boxShadow: glow ? ds.shadows.glow.error : ds.shadows.button.default,
      border: "none",
      "&:hover": {
        background: `linear-gradient(135deg, ${ds.colors.error[600]} 0%, ${ds.colors.error[700]} 100%)`,
        boxShadow: glow ? ds.shadows.glow.error : ds.shadows.button.hover,
        transform: "translateY(-2px)",
      },
    },

    success: {
      background: ds.gradients.success,
      color: "#ffffff",
      boxShadow: glow ? ds.shadows.glow.success : ds.shadows.button.default,
      border: "none",
      "&:hover": {
        background: `linear-gradient(135deg, ${ds.colors.success[700]} 0%, ${ds.colors.success[600]} 100%)`,
        boxShadow: glow ? ds.shadows.glow.success : ds.shadows.button.hover,
        transform: "translateY(-2px)",
      },
    },

    warning: {
      background: ds.gradients.warning,
      color: ds.colors.text.primary,
      boxShadow: glow ? ds.shadows.glow.warning : ds.shadows.button.default,
      border: "none",
      "&:hover": {
        background: `linear-gradient(135deg, ${ds.colors.warning[600]} 0%, ${ds.colors.warning[500]} 100%)`,
        boxShadow: glow ? ds.shadows.glow.warning : ds.shadows.button.hover,
        transform: "translateY(-2px)",
      },
    },

    glass: {
      ...ds.getGlassStyle("light"),
      color: ds.colors.text.primary,
      "&:hover": {
        ...ds.getGlassStyle("medium"),
        transform: "translateY(-1px)",
      },
    },
  };

  return {
    ...baseStyles,
    ...variants[variant],
  };
};

/**
 * Get size-specific styles
 */
const getSizeStyles = (
  ds: ReturnType<typeof useDesignSystem>,
  size: ButtonSize,
) => {
  const sizeMap = {
    xs: ds.componentSizes.button.xs,
    sm: ds.componentSizes.button.sm,
    md: ds.componentSizes.button.md,
    lg: ds.componentSizes.button.lg,
    xl: ds.componentSizes.button.xl,
  };

  const config = sizeMap[size];

  return {
    height: config.height,
    padding: config.padding,
    fontSize: config.fontSize,
    gap: `${config.gap}px`,
  };
};

/**
 * ButtonV3 Component
 *
 * Modern button with enhanced visual design and interactions
 */
export const ButtonV3 = forwardRef<HTMLButtonElement, ButtonV3Props>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      children,
      disabled = false,
      leftIcon,
      rightIcon,
      glow = false,
      sx = {},
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    const variantStyles = useMemo(
      () => buildVariantStyles(ds, variant, glow),
      [ds, variant, glow],
    );

    const sizeStyles = useMemo(() => getSizeStyles(ds, size), [ds, size]);

    const mergedSx = useMemo(
      () => ({
        ...variantStyles,
        ...sizeStyles,
        width: fullWidth ? "100%" : "auto",
        ...sx,
      }),
      [variantStyles, sizeStyles, fullWidth, sx],
    );

    return (
      <MuiButton
        ref={ref}
        disabled={disabled || loading}
        sx={mergedSx}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={size === "xs" ? 14 : size === "sm" ? 16 : 18}
            sx={{
              color: "currentColor",
              marginRight: 1,
            }}
          />
        )}
        {!loading && leftIcon && (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "inherit",
            }}
          >
            {leftIcon}
          </Box>
        )}
        <Box
          component="span"
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </Box>
        {!loading && rightIcon && (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "inherit",
            }}
          >
            {rightIcon}
          </Box>
        )}
      </MuiButton>
    );
  },
);

ButtonV3.displayName = "ButtonV3";

export default ButtonV3;
