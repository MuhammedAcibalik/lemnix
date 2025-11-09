/**
 * Button Component v2.0 - Modern Industrial
 *
 * @module shared/ui/Button
 * @version 2.0.0 - Full Transform
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

type ButtonSize = "small" | "medium" | "large";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "gradient"
  | "soft"
  | "link"
  | "danger"
  | "success";

export interface ButtonV2Props
  extends Omit<MuiButtonProps, "variant" | "size"> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
}

const buildVariantStyles = (
  ds: ReturnType<typeof useDesignSystem>,
  variant: ButtonVariant,
  disabled: boolean,
) => {
  const focusRing = ds.getFocusRing?.() ?? {
    boxShadow: `${ds.focus.ring}, ${ds.focus.ringOffset}`,
    outline: "none",
  };

  const baseInteractive = {
    borderRadius: `${ds.borderRadius.button}px`,
    fontWeight: ds.typography.fontWeight.semibold,
    transition: ds.transitions.base,
    textTransform: "none" as const,
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      boxShadow: ds.shadows.none,
      transform: "none",
    },
    "&:focus-visible": focusRing,
  };

  const variants: Record<ButtonVariant, Record<string, unknown>> = {
    primary: {
      background: ds.gradients.primary,
      color: ds.colors.primary.contrast,
      boxShadow: ds.shadows.crisp.sm,
      "&:hover": {
        background: ds.gradients.primaryHover,
        boxShadow: ds.shadows.crisp.md,
        transform: "translateY(-2px)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: ds.shadows.crisp.sm,
      },
    },
    secondary: {
      background: ds.colors.background.paper,
      color: ds.colors.primary.main,
      border: `2px solid ${ds.colors.primary.main}`,
      boxShadow: ds.shadows.none,
      "&:hover": {
        borderColor: ds.colors.primary.dark,
        color: ds.colors.primary.dark,
        backgroundColor: alpha(ds.colors.primary.main, 0.04),
        boxShadow: ds.shadows.soft.sm,
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
    },
    gradient: {
      background: ds.gradients.premium,
      color: ds.colors.primary.contrast,
      boxShadow: ds.shadows.glow.primary,
      "&:hover": {
        boxShadow: ds.shadows.glow.primary,
        transform: "translateY(-2px) scale(1.02)",
      },
    },
    soft: {
      background: alpha(ds.colors.primary.main, 0.12),
      color: ds.colors.primary.main,
      border: "none",
      "&:hover": {
        background: alpha(ds.colors.primary.main, 0.18),
        transform: "translateY(-1px)",
      },
    },
    link: {
      background: "transparent",
      color: ds.colors.primary.main,
      border: "none",
      paddingInline: 0,
      "&:hover": {
        color: ds.colors.primary.dark,
        textDecoration: "underline",
      },
    },
    danger: {
      background: alpha(ds.colors.error.main, 0.1),
      color: ds.colors.error.main,
      border: `2px solid ${ds.colors.error.main}`,
      boxShadow: ds.shadows.crisp.sm,
      "&:hover": {
        background: ds.colors.error.main,
        color: ds.colors.primary.contrast,
        boxShadow: ds.shadows.glow.error,
      },
    },
    success: {
      background: ds.gradients.secondary,
      color: ds.colors.secondary.contrast,
      boxShadow: ds.shadows.crisp.sm,
      "&:hover": {
        boxShadow: ds.shadows.glow.success,
        transform: "translateY(-2px)",
      },
    },
  };

  if (disabled) {
    return {
      ...baseInteractive,
      background: variant === "link" ? "transparent" : ds.colors.neutral[200],
      color: ds.colors.neutral[500],
      border:
        variant === "secondary" || variant === "danger"
          ? `2px solid ${ds.colors.neutral[300]}`
          : "none",
      boxShadow: ds.shadows.none,
    };
  }

  return {
    ...baseInteractive,
    ...variants[variant],
  };
};

export const ButtonV2 = forwardRef<HTMLButtonElement, ButtonV2Props>(
  (
    {
      variant = "primary",
      size = "medium",
      loading = false,
      disabled = false,
      children,
      startIcon,
      endIcon,
      fullWidth,
      sx,
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();
    const sizeConfig = ds.componentSizes.button[size];

    const computedStyles = useMemo(
      () => buildVariantStyles(ds, variant, disabled || loading),
      [ds, variant, disabled, loading],
    );

    const iconGap = variant === "link" ? ds.spacing["1"] : ds.spacing["2"];

    return (
      <MuiButton
        ref={ref}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        startIcon={!loading ? startIcon : undefined}
        endIcon={!loading ? endIcon : undefined}
        sx={{
          height: sizeConfig.height,
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          gap: iconGap,
          ...computedStyles,
          ...sx,
        }}
        {...props}
      >
        {loading ? (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: ds.spacing["2"] }}
          >
            <CircularProgress
              size={size === "small" ? 16 : size === "large" ? 24 : 20}
              color="inherit"
            />
            {children && <span>{children}</span>}
          </Box>
        ) : (
          children
        )}
      </MuiButton>
    );
  },
);

ButtonV2.displayName = "ButtonV2";

export const PrimaryButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="primary" {...props} />
);

export const SecondaryButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="secondary" {...props} />
);

export const GhostButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="ghost" {...props} />
);

export const GradientButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="gradient" {...props} />
);

export const SoftButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="soft" {...props} />
);

export const LinkButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="link" {...props} />
);

export const DangerButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="danger" {...props} />
);

export const SuccessButton: React.FC<ButtonV2Props> = (props) => (
  <ButtonV2 variant="success" {...props} />
);
