/**
 * @fileoverview Button Component v3.0
 * @module shared/ui/Button
 * @version 3.0.0
 */

import React, { forwardRef, useMemo } from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box,
  alpha,
} from "@mui/material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";

// Support both new size tokens (xs/sm/md/lg/xl)
// and legacy size names (small/medium/large) for backward compatibility
type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "small"
  | "medium"
  | "large";

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

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly glow?: boolean;
  readonly shimmer?: boolean;
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
 * Get size-specific styles (adaptive token-aware)
 */
const getSizeStyles = (
  ds: ReturnType<typeof useDesignSystem>,
  tokens: ReturnType<typeof useAdaptiveUIContext>["tokens"],
  size: ButtonSize,
  device: ReturnType<typeof useAdaptiveUIContext>["device"],
) => {
  // Map size to adaptive token heights
  const heightMap = {
    xs: tokens.components.button.sm * 0.8,
    sm: tokens.components.button.sm,
    md: tokens.components.button.md,
    lg: tokens.components.button.lg,
    xl: tokens.components.button.lg * 1.2,
    // Legacy aliases
    small: tokens.components.button.sm,
    medium: tokens.components.button.md,
    large: tokens.components.button.lg,
  };

  // Map size to adaptive font sizes
  const fontSizeMap = {
    xs: tokens.typography.xs,
    sm: tokens.typography.sm,
    md: tokens.typography.base,
    lg: tokens.typography.lg,
    xl: tokens.typography.xl,
    // Legacy aliases
    small: tokens.typography.sm,
    medium: tokens.typography.base,
    large: tokens.typography.lg,
  };

  // Use adaptive heights, fallback to design system if needed
  const adaptiveHeight = heightMap[size] ?? tokens.components.button.md;
  const adaptiveFontSize = fontSizeMap[size] ?? tokens.typography.base;
  
  // Touch devices: ensure minimum interaction size
  const finalHeight = device.isTouch
    ? Math.max(adaptiveHeight, tokens.components.minTouchTarget * 0.9)
    : adaptiveHeight;

  // Padding based on adaptive spacing
  const paddingMap = {
    xs: `${tokens.spacing.fn(1)} ${tokens.spacing.fn(1.5)}`,
    sm: `${tokens.spacing.fn(1.5)} ${tokens.spacing.fn(2)}`,
    md: `${tokens.spacing.fn(2)} ${tokens.spacing.fn(2.5)}`,
    lg: `${tokens.spacing.fn(2.5)} ${tokens.spacing.fn(3)}`,
    xl: `${tokens.spacing.fn(3)} ${tokens.spacing.fn(4)}`,
    small: `${tokens.spacing.fn(1.5)} ${tokens.spacing.fn(2)}`,
    medium: `${tokens.spacing.fn(2)} ${tokens.spacing.fn(2.5)}`,
    large: `${tokens.spacing.fn(2.5)} ${tokens.spacing.fn(3)}`,
  };

  return {
    height: finalHeight,
    minHeight: finalHeight,
    padding: paddingMap[size] ?? `${tokens.spacing.fn(2)} ${tokens.spacing.fn(2.5)}`,
    fontSize: adaptiveFontSize,
    gap: tokens.spacing.fn(1),
    borderRadius: tokens.borderRadius.md,
  };
};

/**
 * Button Component
 *
 * Modern button with enhanced visual design and interactions
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
    const { device, tokens } = useAdaptiveUIContext();

    const variantStyles = useMemo(
      () => buildVariantStyles(ds, variant, glow),
      [ds, variant, glow],
    );

    const sizeStyles = useMemo(
      () => getSizeStyles(ds, tokens, size, device),
      [ds, tokens, size, device],
    );

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
        {loading && (() => {
          const { icon } = tokens.components;
          const loadingSize = 
            size === "xs" || size === "small" ? icon.sm * 0.8 :
            size === "sm" ? icon.sm :
            size === "lg" || size === "xl" || size === "large" ? icon.md :
            icon.sm * 1.1;
          
          return (
            <CircularProgress
              size={loadingSize}
              sx={{
                color: "currentColor",
                marginRight: tokens.spacing.fn(1),
              }}
            />
          );
        })()}
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

Button.displayName = "Button";

/**
 * PrimaryButton - Pre-configured primary button variant
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);

PrimaryButton.displayName = "PrimaryButton";

/**
 * SecondaryButton - Pre-configured secondary button variant
 */
export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
);

SecondaryButton.displayName = "SecondaryButton";

/**
 * TextButton - Pre-configured text/link button variant
 */
export const TextButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="link" {...props} />
);

TextButton.displayName = "TextButton";

/**
 * DangerButton - Pre-configured danger button variant
 */
export const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="danger" {...props} />
);

DangerButton.displayName = "DangerButton";

/**
 * SuccessButton - Pre-configured success button variant
 */
export const SuccessButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="success" {...props} />
);

SuccessButton.displayName = "SuccessButton";

/**
 * GhostButton - Pre-configured ghost button variant
 */
export const GhostButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />
);

GhostButton.displayName = "GhostButton";

/**
 * GradientButton - Pre-configured gradient button variant
 */
export const GradientButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="gradient" {...props} />
);

GradientButton.displayName = "GradientButton";

/**
 * SoftButton - Pre-configured soft button variant
 */
export const SoftButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="soft" {...props} />
);

SoftButton.displayName = "SoftButton";

/**
 * LinkButton - Pre-configured link button variant (alias for TextButton)
 */
export const LinkButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <Button ref={ref} variant="link" {...props} />
);

LinkButton.displayName = "LinkButton";

export default Button;
