/**
 * EmptyState Component v3.0 - Enhanced Empty States
 *
 * @module shared/ui/EmptyState
 * @version 3.0.0 - Complete UI/UX Modernization
 */

import React, { forwardRef } from "react";
import { Box, BoxProps, Typography, Stack, alpha } from "@mui/material";
import {
  Inbox,
  SearchOff,
  ErrorOutline,
  CloudOff,
  FolderOpen,
  AssignmentLate,
  Description,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { ButtonV3 } from "../Button/Button.v3";

type EmptyStateVariant =
  | "default"
  | "search"
  | "error"
  | "offline"
  | "noData"
  | "noResults";
type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateV3Props extends BoxProps {
  readonly variant?: EmptyStateVariant;
  readonly size?: EmptyStateSize;
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "ghost";
  };
  readonly secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  readonly illustration?: React.ReactNode;
}

/**
 * Get default icon for variant
 */
const getDefaultIcon = (variant: EmptyStateVariant) => {
  const iconMap = {
    default: Inbox,
    search: SearchOff,
    error: ErrorOutline,
    offline: CloudOff,
    noData: FolderOpen,
    noResults: AssignmentLate,
  };

  return iconMap[variant] || Inbox;
};

/**
 * EmptyStateV3 Component
 *
 * Modern empty state with illustrations and actions
 */
export const EmptyStateV3 = forwardRef<HTMLDivElement, EmptyStateV3Props>(
  (
    {
      variant = "default",
      size = "md",
      icon: customIcon,
      title,
      description,
      action,
      secondaryAction,
      illustration,
      sx = {},
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    // Size configurations
    const sizeConfig = {
      sm: {
        iconSize: 48,
        titleVariant: "h6" as const,
        spacing: ds.spacing["4"],
        padding: ds.spacing["8"],
      },
      md: {
        iconSize: 64,
        titleVariant: "h5" as const,
        spacing: ds.spacing["6"],
        padding: ds.spacing["12"],
      },
      lg: {
        iconSize: 80,
        titleVariant: "h4" as const,
        spacing: ds.spacing["8"],
        padding: ds.spacing["16"],
      },
    };

    const config = sizeConfig[size];
    const DefaultIcon = getDefaultIcon(variant);

    // Variant-specific colors
    const variantColors = {
      default: ds.colors.neutral[400],
      search: ds.colors.info.main,
      error: ds.colors.error.main,
      offline: ds.colors.warning.main,
      noData: ds.colors.neutral[400],
      noResults: ds.colors.neutral[400],
    };

    const iconColor = variantColors[variant];

    return (
      <Box
        ref={ref}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: `${config.padding}px`,
          minHeight: "400px",
          ...sx,
        }}
        {...props}
      >
        <Stack
          spacing={config.spacing}
          alignItems="center"
          sx={{ maxWidth: "500px" }}
        >
          {/* Icon or Illustration */}
          {illustration ? (
            <Box
              sx={{
                width: config.iconSize * 2,
                height: config.iconSize * 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {illustration}
            </Box>
          ) : (
            <Box
              sx={{
                width: config.iconSize * 1.5,
                height: config.iconSize * 1.5,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${alpha(iconColor, 0.1)} 0%, ${alpha(iconColor, 0.05)} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",

                // Animated pulse effect
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${alpha(iconColor, 0.2)} 0%, ${alpha(iconColor, 0.1)} 100%)`,
                  animation: "pulse 2s ease-in-out infinite",
                },
              }}
            >
              {customIcon || (
                <DefaultIcon
                  sx={{
                    fontSize: config.iconSize,
                    color: iconColor,
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              )}
            </Box>
          )}

          {/* Content */}
          <Stack spacing={2} alignItems="center">
            <Typography
              variant={config.titleVariant}
              sx={{
                fontWeight: ds.fontWeight.semibold,
                color: ds.colors.text.primary,
              }}
            >
              {title}
            </Typography>

            {description && (
              <Typography
                variant="body2"
                sx={{
                  color: ds.colors.text.secondary,
                  maxWidth: "400px",
                  lineHeight: ds.lineHeight.relaxed,
                }}
              >
                {description}
              </Typography>
            )}
          </Stack>

          {/* Actions */}
          {(action || secondaryAction) && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              {action && (
                <ButtonV3
                  variant={action.variant || "primary"}
                  onClick={action.onClick}
                  size={size === "sm" ? "sm" : "md"}
                >
                  {action.label}
                </ButtonV3>
              )}
              {secondaryAction && (
                <ButtonV3
                  variant="ghost"
                  onClick={secondaryAction.onClick}
                  size={size === "sm" ? "sm" : "md"}
                >
                  {secondaryAction.label}
                </ButtonV3>
              )}
            </Stack>
          )}
        </Stack>
      </Box>
    );
  },
);

EmptyStateV3.displayName = "EmptyStateV3";

/**
 * NoDataEmptyState - Pre-configured for no data scenarios
 */
export const NoDataEmptyState = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateV3Props, "variant">
>(
  (
    {
      title = "No data available",
      description = "There is no data to display at this time.",
      ...props
    },
    ref,
  ) => (
    <EmptyStateV3
      ref={ref}
      variant="noData"
      title={title}
      description={description}
      {...props}
    />
  ),
);

NoDataEmptyState.displayName = "NoDataEmptyState";

/**
 * SearchEmptyState - Pre-configured for search results
 */
export const SearchEmptyState = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateV3Props, "variant">
>(
  (
    {
      title = "No results found",
      description = "Try adjusting your search or filter criteria.",
      ...props
    },
    ref,
  ) => (
    <EmptyStateV3
      ref={ref}
      variant="search"
      title={title}
      description={description}
      {...props}
    />
  ),
);

SearchEmptyState.displayName = "SearchEmptyState";

/**
 * ErrorEmptyState - Pre-configured for error states
 */
export const ErrorEmptyState = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateV3Props, "variant">
>(
  (
    {
      title = "Something went wrong",
      description = "We encountered an error loading this data. Please try again.",
      ...props
    },
    ref,
  ) => (
    <EmptyStateV3
      ref={ref}
      variant="error"
      title={title}
      description={description}
      {...props}
    />
  ),
);

ErrorEmptyState.displayName = "ErrorEmptyState";

/**
 * OfflineEmptyState - Pre-configured for offline states
 */
export const OfflineEmptyState = forwardRef<
  HTMLDivElement,
  Omit<EmptyStateV3Props, "variant">
>(
  (
    {
      title = "You're offline",
      description = "Please check your internet connection and try again.",
      ...props
    },
    ref,
  ) => (
    <EmptyStateV3
      ref={ref}
      variant="offline"
      title={title}
      description={description}
      {...props}
    />
  ),
);

OfflineEmptyState.displayName = "OfflineEmptyState";

export default EmptyStateV3;
