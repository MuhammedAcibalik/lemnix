/**
 * @fileoverview Shared Card Component
 * @module shared/ui/Card
 * @version 2.0.0 - Design System Compliant
 * 
 * Unified card component with design system integration.
 */

import React, { forwardRef } from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  CardProps as MuiCardProps,
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Card actions (buttons, etc.)
   */
  actions?: React.ReactNode;
  
  /**
   * Header action (e.g., icon button)
   */
  headerAction?: React.ReactNode;
  
  /**
   * Card variant
   */
  variant?: 'elevated' | 'outlined' | 'glass';
  
  /**
   * Enable hover effect
   */
  hoverable?: boolean;
}

/**
 * Card Component
 * 
 * Design system compliant card with variants.
 * 
 * @example
 * ```tsx
 * <Card
 *   title="Kesim Planı"
 *   subtitle="FFD Algoritması"
 *   variant="elevated"
 *   hoverable
 *   actions={
 *     <Button>Detay</Button>
 *   }
 * >
 *   <Typography>İçerik...</Typography>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      children,
      actions,
      headerAction,
      variant = 'elevated',
      hoverable = false,
      sx,
      ...props
    },
    ref
  ) => {
    const { colors, borderRadius, shadows, spacing } = useDesignSystem();

    // Variant styles
    const variantStyles = {
      elevated: {
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `1px solid ${colors.neutral[100]}`,
        boxShadow: shadows.card,
      },
      outlined: {
        background: colors.background.paper,
        border: `1px solid ${colors.neutral[200]}`,
        boxShadow: 'none',
      },
      glass: {
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)`,
        border: `1px solid ${colors.neutral[100]}`,
        backdropFilter: 'blur(10px)',
        boxShadow: shadows.card,
      },
    };

    return (
      <MuiCard
        ref={ref}
        elevation={0}
        sx={{
          borderRadius: `${borderRadius.card}px`,
          transition: 'all 0.2s ease',
          ...variantStyles[variant],
          
          // Hover effect
          ...(hoverable && {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: shadows.cardHover,
            },
          }),
          
          // Custom sx props
          ...sx,
        }}
        {...props}
      >
        {/* Header */}
        {(title || subtitle || headerAction) && (
          <CardHeader
            title={
              title && (
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{ 
                    fontWeight: 600,
                    color: colors.text.primary 
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
                    color: colors.text.secondary,
                    mt: 0.5
                  }}
                >
                  {subtitle}
                </Typography>
              )
            }
            action={headerAction}
            sx={{
              pb: spacing.xs,
              '& .MuiCardHeader-content': {
                minWidth: 0,
              },
            }}
          />
        )}

        {/* Content */}
        <CardContent 
          sx={{ 
            pt: title || subtitle ? 0 : spacing.md,
          }}
        >
          {children}
        </CardContent>

        {/* Actions */}
        {actions && (
          <CardActions sx={{ pt: 0, px: spacing.md, pb: spacing.md }}>
            {actions}
          </CardActions>
        )}
      </MuiCard>
    );
  }
);

Card.displayName = 'Card';

