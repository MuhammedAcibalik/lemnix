/**
 * Badge Component v2.0 - Modern Industrial
 * 
 * @module shared/ui/Badge
 * @version 2.0.0
 */

import React from 'react';
import { Chip, ChipProps, alpha } from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

export type BadgeVariant = 'solid' | 'soft' | 'outlined' | 'ghost';
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

export interface BadgeV2Props extends Omit<ChipProps, 'variant' | 'color'> {
  readonly variant?: BadgeVariant;
  readonly color?: BadgeColor;
  readonly children: React.ReactNode;
}

export const BadgeV2: React.FC<BadgeV2Props> = ({
  variant = 'solid',
  color = 'primary',
  children,
  sx,
  ...props
}) => {
  const ds = useDesignSystem();

  const colorMap = {
    primary: ds.colors.primary.main,
    secondary: ds.colors.secondary.main,
    success: ds.colors.success.main,
    warning: ds.colors.warning.main,
    error: ds.colors.error.main,
    neutral: ds.colors.neutral[500],
  };

  const baseColor = colorMap[color];

  const variantStyles = {
    solid: {
      background: baseColor,
      color: '#ffffff',
      border: 'none',
      boxShadow: ds.shadows.soft.sm,
    },
    soft: {
      background: alpha(baseColor, 0.1),
      color: baseColor,
      border: 'none',
    },
    outlined: {
      background: 'transparent',
      color: baseColor,
      border: `1.5px solid ${baseColor}`,
    },
    ghost: {
      background: 'transparent',
      color: baseColor,
      border: 'none',
    },
  };

  return (
    <Chip
      label={children}
      sx={{
        ...variantStyles[variant],
        borderRadius: `${ds.borderRadius.chip}px`,
        fontSize: ds.typography.fontSize.xs,
        fontWeight: ds.typography.fontWeight.medium,
        letterSpacing: '0.02em',
        height: 24,
        padding: '0 8px',
        transition: ds.transitions.fast,
        
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: variant === 'solid' ? ds.shadows.soft.md : ds.shadows.soft.sm,
        },
        
        ...sx,
      }}
      {...props}
    />
  );
};

