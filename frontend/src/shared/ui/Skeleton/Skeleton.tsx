/**
 * Skeleton Component v3.0 - Enhanced Loading States
 *
 * @module shared/ui/Skeleton
 * @version 3.0.0 - Complete UI/UX Modernization
 */

import React, { forwardRef } from "react";
import {
  Box,
  BoxProps,
  Skeleton as MuiSkeleton,
  Stack,
  alpha,
} from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";

type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";
type SkeletonAnimation = "pulse" | "wave" | "shimmer" | false;

export interface SkeletonV3Props extends Omit<BoxProps, "variant"> {
  readonly variant?: SkeletonVariant;
  readonly animation?: SkeletonAnimation;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly glow?: boolean;
}

// Export SkeletonProps as alias for SkeletonV3Props for backward compatibility
export type SkeletonProps = SkeletonV3Props;

/**
 * SkeletonV3 Component
 *
 * Modern skeleton loader with enhanced animations
 */
export const SkeletonV3 = forwardRef<HTMLDivElement, SkeletonV3Props>(
  (
    {
      variant = "rectangular",
      animation = "shimmer",
      width = "100%",
      height,
      glow = false,
      sx = {},
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();

    // Custom shimmer animation
    const shimmerAnimation =
      animation === "shimmer"
        ? {
            "@keyframes shimmer": {
              "0%": {
                backgroundPosition: "-1000px 0",
              },
              "100%": {
                backgroundPosition: "1000px 0",
              },
            },
            animation: "shimmer 2s infinite linear",
            backgroundImage: `linear-gradient(
        90deg,
        ${ds.colors.neutral[200]} 0px,
        ${alpha(ds.colors.neutral[100], 0.5)} 40px,
        ${ds.colors.neutral[200]} 80px
      )`,
            backgroundSize: "1000px 100%",
          }
        : {};

    const baseStyles = {
      backgroundColor: ds.colors.neutral[200],
      borderRadius:
        variant === "circular"
          ? "50%"
          : variant === "rounded"
            ? `${ds.borderRadius.lg}px`
            : variant === "text"
              ? `${ds.borderRadius.sm}px`
              : `${ds.borderRadius.md}px`,
      ...(glow && {
        boxShadow: `0 0 20px ${alpha(ds.colors.neutral[300], 0.5)}`,
      }),
      ...shimmerAnimation,
    };

    if (animation === "shimmer") {
      return (
        <Box
          ref={ref}
          sx={{
            width,
            height:
              height ||
              (variant === "text" ? 24 : variant === "circular" ? 40 : 120),
            ...baseStyles,
            ...sx,
          }}
          {...props}
        />
      );
    }

    // Extract only MuiSkeleton-compatible props, exclude BoxProps that conflict
    const { color, border, component, ...skeletonProps } = props;

    return (
      <MuiSkeleton
        ref={ref}
        variant={variant}
        animation={animation}
        {...(width !== undefined ? { width } : {})}
        {...(height !== undefined ? { height } : {})}
        sx={{
          ...baseStyles,
          ...(color && { color }),
          ...(border && { border }),
          ...sx,
        }}
        {...skeletonProps}
      />
    );
  },
);

SkeletonV3.displayName = "SkeletonV3";

/**
 * CardSkeleton - Pre-configured skeleton for card layouts
 */
export const CardSkeleton = forwardRef<HTMLDivElement, { lines?: number }>(
  ({ lines = 3 }, ref) => {
    const ds = useDesignSystem();

    return (
      <Box
        ref={ref}
        sx={{
          p: ds.spacing["6"],
          borderRadius: `${ds.borderRadius.card}px`,
          border: `1px solid ${ds.colors.border.muted}`,
          backgroundColor: ds.colors.surface.base,
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <SkeletonV3 variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <SkeletonV3 variant="text" width="60%" height={20} />
              <SkeletonV3 variant="text" width="40%" height={16} />
            </Box>
          </Stack>

          {/* Content */}
          <Stack spacing={1}>
            {Array.from({ length: lines }).map((_, index) => (
              <SkeletonV3
                key={index}
                variant="text"
                width={index === lines - 1 ? "70%" : "100%"}
                height={16}
              />
            ))}
          </Stack>

          {/* Footer */}
          <Stack direction="row" spacing={2}>
            <SkeletonV3 variant="rounded" width={80} height={32} />
            <SkeletonV3 variant="rounded" width={80} height={32} />
          </Stack>
        </Stack>
      </Box>
    );
  },
);

CardSkeleton.displayName = "CardSkeleton";

/**
 * TableSkeleton - Pre-configured skeleton for table layouts
 */
export const TableSkeleton = forwardRef<
  HTMLDivElement,
  { rows?: number; columns?: number }
>(({ rows = 5, columns = 4 }, ref) => {
  const ds = useDesignSystem();

  return (
    <Box
      ref={ref}
      sx={{
        border: `1px solid ${ds.colors.border.muted}`,
        borderRadius: `${ds.borderRadius.lg}px`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 2,
          p: 2,
          backgroundColor: ds.colors.surface.elevated1,
          borderBottom: `1px solid ${ds.colors.border.muted}`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonV3 key={index} variant="text" height={20} />
        ))}
      </Box>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 2,
            p: 2,
            borderBottom:
              rowIndex < rows - 1
                ? `1px solid ${ds.colors.border.muted}`
                : "none",
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonV3 key={colIndex} variant="text" height={16} />
          ))}
        </Box>
      ))}
    </Box>
  );
});

TableSkeleton.displayName = "TableSkeleton";

/**
 * ListSkeleton - Pre-configured skeleton for list layouts
 */
export const ListSkeleton = forwardRef<HTMLDivElement, { items?: number }>(
  ({ items = 5 }, ref) => {
    const ds = useDesignSystem();

    return (
      <Stack ref={ref} spacing={2}>
        {Array.from({ length: items }).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderRadius: `${ds.borderRadius.lg}px`,
              border: `1px solid ${ds.colors.border.muted}`,
            }}
          >
            <SkeletonV3 variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <SkeletonV3 variant="text" width="70%" height={20} />
              <SkeletonV3 variant="text" width="50%" height={16} />
            </Box>
            <SkeletonV3 variant="rounded" width={80} height={32} />
          </Box>
        ))}
      </Stack>
    );
  },
);

ListSkeleton.displayName = "ListSkeleton";

/**
 * DashboardSkeleton - Pre-configured skeleton for dashboard layouts
 */
export const DashboardSkeleton = forwardRef<HTMLDivElement, BoxProps>(
  (props, ref) => {
    const ds = useDesignSystem();

    return (
      <Box ref={ref} {...props}>
        {/* Stats Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                borderRadius: `${ds.borderRadius.card}px`,
                border: `1px solid ${ds.colors.border.muted}`,
              }}
            >
              <SkeletonV3 variant="text" width="50%" height={16} />
              <SkeletonV3 variant="text" width="70%" height={32} />
              <SkeletonV3 variant="text" width="40%" height={16} />
            </Box>
          ))}
        </Box>

        {/* Charts Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
            mb: 4,
          }}
        >
          <CardSkeleton lines={1} />
          <CardSkeleton lines={5} />
        </Box>

        {/* Table */}
        <TableSkeleton rows={8} columns={5} />
      </Box>
    );
  },
);

DashboardSkeleton.displayName = "DashboardSkeleton";

// Export Skeleton as alias for SkeletonV3 for backward compatibility
export const Skeleton = SkeletonV3;

export default SkeletonV3;
