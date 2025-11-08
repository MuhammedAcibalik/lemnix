/**
 * @fileoverview Styled Components for CuttingListBuilder
 * @module CuttingListBuilderStyled
 * @version 3.0.0 - Design System v2 Migration
 * 
 * DEPRECATED: Most components now use CardV2/ButtonV2 directly
 * This file maintained for legacy compatibility only
 */

import React from 'react';
import {
  Card,
  Button,
  TextField,
  Chip,
  Box,
  Typography,
  Stack,
  Grid,
  alpha,
} from '@mui/material';

// Design System v2.0
import { useDesignSystem } from '@/shared/hooks';
import {
  StyledCardProps,
  StyledButtonProps,
  StyledTextFieldProps,
  StyledChipProps,
  PageHeaderProps,
  ActionToolbarProps,
  CuttingListStatsProps,
  StatsItem,
} from './types';

// ============================================================================
// LEGACY STYLED COMPONENTS (Use CardV2/ButtonV2 for new code)
// ============================================================================

export const StyledCard: React.FC<StyledCardProps> = ({
  children,
  variant = 'default',
  sx = {},
  ...props
}) => {
  const ds = useDesignSystem();

  return (
    <Card
      {...props}
      sx={{
        borderRadius: `${ds.borderRadius.lg}px`,
        background: ds.glass.background,
        border: ds.glass.border,
        backdropFilter: ds.glass.backdropFilter,
        boxShadow: ds.shadows.soft.sm,
        transition: ds.transitions.base,
        '&:hover': {
          boxShadow: ds.shadows.soft.md,
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

export const StyledButton: React.FC<StyledButtonProps> = ({
  children,
  variant = 'contained',
  size = 'medium',
  sx = {},
  ...props
}) => {
  const ds = useDesignSystem();

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      sx={{
        borderRadius: `${ds.borderRadius.md}px`,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.8125rem' : size === 'large' ? '0.9375rem' : '0.875rem',
        textTransform: 'none',
        padding: size === 'large' ? '10px 20px' : size === 'small' ? '6px 12px' : '8px 16px',
        background: variant === 'contained'
          ? ds.gradients.primary
          : undefined,
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: ds.shadows.soft.sm,
        },
        transition: ds.transitions.fast,
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

export const StyledTextField: React.FC<StyledTextFieldProps> = ({
  sx = {},
  ...props
}) => {
  const ds = useDesignSystem();

  return (
    <TextField
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: `${ds.borderRadius.md}px`,
          '&:hover fieldset': {
            borderColor: ds.colors.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: ds.colors.primary.main,
          },
        },
        ...sx,
      }}
    />
  );
};

export const StyledChip: React.FC<StyledChipProps> = ({
  sx = {},
  ...props
}) => {
  const ds = useDesignSystem();

  return (
    <Chip
      {...props}
      sx={{
        borderRadius: `${ds.borderRadius.sm}px`,
        fontWeight: 600,
        fontSize: '0.75rem',
        ...sx,
      }}
    />
  );
};

// ============================================================================
// PAGE HEADER (Legacy - Use CardV2 header pattern instead)
// ============================================================================

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
}) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        p: ds.spacing['4'],
        mb: ds.spacing['4'],
        borderRadius: `${ds.borderRadius.lg}px`,
        background: ds.glass.background,
        border: ds.glass.border,
        backdropFilter: ds.glass.backdropFilter,
        boxShadow: ds.shadows.soft.sm,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={ds.spacing['3']}>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: `${ds.borderRadius.lg}px`,
                background: ds.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: ds.colors.text.inverse,
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: ds.colors.text.primary,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  color: ds.colors.text.secondary,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

// ============================================================================
// ACTION TOOLBAR (Legacy - Use CardV2 action header instead)
// ============================================================================

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  primaryAction,
  secondaryActions = [],
  loading = false,
  children,
}) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        p: ds.spacing['3'],
        mb: ds.spacing['4'],
        borderRadius: `${ds.borderRadius.lg}px`,
        background: ds.glass.background,
        border: ds.glass.border,
        backdropFilter: ds.glass.backdropFilter,
        boxShadow: ds.shadows.soft.sm,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={ds.spacing['2']} flexWrap="wrap">
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            startIcon={primaryAction.icon}
            disabled={loading}
            sx={{
              borderRadius: `${ds.borderRadius.md}px`,
              textTransform: 'none',
              fontWeight: 600,
              background: ds.gradients.primary,
              color: ds.colors.text.inverse,
            }}
          >
            {primaryAction.label}
          </Button>
        )}

        {secondaryActions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            startIcon={action.icon}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: `${ds.borderRadius.md}px`,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {action.label}
          </Button>
        ))}

        {children}
      </Stack>
    </Box>
  );
};

// ============================================================================
// CUTTING LIST STATS (Legacy)
// ============================================================================

export const CuttingListStats: React.FC<CuttingListStatsProps> = ({ stats }) => {
  const ds = useDesignSystem();

  return (
    <Grid container spacing={ds.spacing['2']}>
      {stats.map((item, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Box
            sx={{
              p: ds.spacing['3'],
              borderRadius: `${ds.borderRadius.md}px`,
              background: alpha(item.color ?? ds.colors.primary.main, 0.1),
              border: `1px solid ${alpha(item.color ?? ds.colors.primary.main, 0.2)}`,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: item.color ?? ds.colors.primary.main, mb: 0.5 }}>
              {item.value}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
              {item.title}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
