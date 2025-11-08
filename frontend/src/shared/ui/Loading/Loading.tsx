/**
 * @fileoverview Shared Loading Components
 * @module shared/ui/Loading
 * @version 2.0.0 - Design System Compliant
 * 
 * Unified loading components with design system integration.
 */

import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Stack,
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

// ============================================================================
// LOADING SPINNER
// ============================================================================

export interface LoadingSpinnerProps {
  /**
   * Size of spinner
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Loading message
   */
  message?: string;
  
  /**
   * Center in container
   */
  centered?: boolean;
  
  /**
   * Fullscreen overlay
   */
  fullscreen?: boolean;
}

/**
 * Loading Spinner Component
 * 
 * @example
 * ```tsx
 * <LoadingSpinner size="medium" message="Yükleniyor..." />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  centered = false,
  fullscreen = false,
}) => {
  const { colors, spacing } = useDesignSystem();

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const content = (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={spacing.sm}
      sx={{
        ...(centered && {
          minHeight: '200px',
        }),
        ...(fullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }),
      }}
    >
      <CircularProgress
        size={sizeMap[size]}
        sx={{
          color: colors.primary[600],
        }}
      />
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: colors.text.secondary,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Stack>
  );

  return content;
};

// ============================================================================
// LOADING BAR
// ============================================================================

export interface LoadingBarProps {
  /**
   * Show loading bar
   */
  loading?: boolean;
  
  /**
   * Progress value (0-100)
   */
  value?: number;
  
  /**
   * Loading message
   */
  message?: string;
}

/**
 * Loading Bar Component
 * 
 * @example
 * ```tsx
 * <LoadingBar loading={isLoading} value={progress} />
 * ```
 */
export const LoadingBar: React.FC<LoadingBarProps> = ({
  loading = true,
  value,
  message,
}) => {
  const { colors, spacing } = useDesignSystem();

  if (!loading) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgress
        variant={value !== undefined ? 'determinate' : 'indeterminate'}
        value={value}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.neutral[100],
          '& .MuiLinearProgress-bar': {
            backgroundColor: colors.primary[600],
            borderRadius: 2,
          },
        }}
      />
      {message && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: spacing.xs,
            color: colors.text.secondary,
            textAlign: 'center',
          }}
        >
          {message}
          {value !== undefined && ` (${Math.round(value)}%)`}
        </Typography>
      )}
    </Box>
  );
};

// ============================================================================
// LOADING SKELETON
// ============================================================================

export interface LoadingSkeletonProps {
  /**
   * Skeleton variant
   */
  variant?: 'text' | 'rectangular' | 'circular';
  
  /**
   * Width
   */
  width?: number | string;
  
  /**
   * Height
   */
  height?: number | string;
  
  /**
   * Number of lines (for text variant)
   */
  lines?: number;
}

/**
 * Loading Skeleton Component
 * 
 * @example
 * ```tsx
 * <LoadingSkeleton variant="text" lines={3} />
 * ```
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const { borderRadius, spacing } = useDesignSystem();

  if (variant === 'text' && lines > 1) {
    return (
      <Stack spacing={spacing.xs}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? '60%' : '100%'}
            sx={{
              borderRadius: `${borderRadius.sm}px`,
            }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      sx={{
        borderRadius:
          variant === 'circular'
            ? '50%'
            : `${borderRadius[variant === 'text' ? 'sm' : 'base']}px`,
      }}
    />
  );
};

// ============================================================================
// LOADING CONTAINER
// ============================================================================

export interface LoadingContainerProps {
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Content to show when loaded
   */
  children: React.ReactNode;
  
  /**
   * Loading component
   */
  loader?: React.ReactNode;
  
  /**
   * Minimum loading time (ms) to prevent flicker
   */
  minLoadingTime?: number;
}

/**
 * Loading Container Component
 * 
 * Wraps content and shows loading state.
 * 
 * @example
 * ```tsx
 * <LoadingContainer loading={isLoading}>
 *   <DataTable data={data} />
 * </LoadingContainer>
 * ```
 */
export const LoadingContainer: React.FC<LoadingContainerProps> = ({
  loading,
  children,
  loader = <LoadingSpinner centered />,
  minLoadingTime = 0,
}) => {
  const [showLoading, setShowLoading] = React.useState(loading);

  React.useEffect(() => {
    if (loading) {
      setShowLoading(true);
    } else if (minLoadingTime > 0) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [loading, minLoadingTime]);

  if (showLoading) {
    return <>{loader}</>;
  }

  return <>{children}</>;
};

