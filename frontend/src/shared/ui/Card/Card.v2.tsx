/**
 * Card Component v2.0 - Modern Industrial
 * 
 * @module shared/ui/Card
 * @version 2.0.0 - Full Transform
 */

import React, { forwardRef, useMemo } from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  CardProps as MuiCardProps,
  alpha,
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

type CardVariant = 'elevated' | 'outlined' | 'glass' | 'gradient' | 'interactive';
export type { CardVariant };

export interface CardV2Props extends Omit<MuiCardProps, 'variant'> {
  readonly title?: string;
  readonly subtitle?: string;
  readonly children: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly headerAction?: React.ReactNode;
  readonly variant?: CardVariant;
  readonly hoverable?: boolean;
  readonly onClick?: () => void;
}

const buildVariantTokens = (
  ds: ReturnType<typeof useDesignSystem>,
  variant: CardVariant
) => {
  const base = {
    borderRadius: `${ds.borderRadius.card}px`,
    transition: ds.transitions.base,
    position: 'relative' as const,
    overflow: 'hidden',
  };

  const tokens: Record<CardVariant, Record<string, unknown>> = {
    elevated: {
      background: ds.gradients.card,
      border: `1px solid ${ds.colors.neutral[200]}`,
      boxShadow: ds.shadows.soft.md,
    },
    outlined: {
      background: ds.colors.background.paper,
      border: `1px solid ${ds.colors.neutral[200]}`,
      boxShadow: ds.shadows.none,
    },
    glass: {
      background: ds.glass.background,
      border: ds.glass.border,
      backdropFilter: ds.glass.backdropFilter,
      boxShadow: ds.glass.boxShadow,
    },
    gradient: {
      background: ds.gradients.primarySoft,
      border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
      boxShadow: ds.shadows.soft.lg,
    },
    interactive: {
      background: ds.gradients.card,
      border: `1px solid ${ds.colors.neutral[200]}`,
      boxShadow: ds.shadows.soft.sm,
      cursor: 'pointer',
      '&:hover': {
        borderColor: ds.colors.primary.main,
        boxShadow: ds.shadows.soft.xl,
        transform: 'translateY(-4px)',
      },
      '&:active': {
        transform: 'translateY(-2px)',
        boxShadow: ds.shadows.soft.md,
      },
    },
  };

  return {
    ...base,
    ...tokens[variant],
  };
};

export const CardV2 = forwardRef<HTMLDivElement, CardV2Props>(
  (
    {
      title,
      subtitle,
      children,
      actions,
      headerAction,
      variant = 'elevated',
      hoverable = false,
      onClick,
      sx,
      ...props
    },
    ref
  ) => {
    const ds = useDesignSystem();

    const cardStyles = useMemo(() => buildVariantTokens(ds, variant), [ds, variant]);

    const enableHover = hoverable && variant !== 'interactive';

    return (
      <MuiCard
        ref={ref}
        elevation={0}
        onClick={onClick}
        sx={{
          ...cardStyles,
          ...(enableHover && {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: ds.shadows.soft.lg,
              borderColor:
                variant === 'outlined' ? ds.colors.primary.light : undefined,
            },
          }),
          ...(onClick && {
            cursor: 'pointer',
          }),
          ...sx,
        }}
        {...props}
      >
        {(title || subtitle || headerAction) && (
          <CardHeader
            title={
              title && (
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: ds.typography.fontWeight.semibold,
                    color: ds.colors.text.primary,
                    letterSpacing: ds.typography.letterSpacing.tight,
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
                    mt: ds.spacing['1'],
                  }}
                >
                  {subtitle}
                </Typography>
              )
            }
            action={headerAction}
            sx={{
              pb: subtitle ? ds.spacing['2'] : ds.spacing['1'],
              px: ds.spacing['4'],
              pt: ds.spacing['4'],
            }}
          />
        )}

        <CardContent
          sx={{
            px: ds.spacing['4'],
            pt: title || subtitle ? 0 : ds.spacing['4'],
            pb: actions ? ds.spacing['2'] : ds.spacing['4'],
          }}
        >
          {children}
        </CardContent>

        {actions && (
          <CardActions
            sx={{
              px: ds.spacing['4'],
              pb: ds.spacing['4'],
              pt: 0,
              gap: ds.spacing['2'],
              justifyContent: 'flex-end',
            }}
          >
            {actions}
          </CardActions>
        )}
      </MuiCard>
    );
  }
);

CardV2.displayName = 'CardV2';

