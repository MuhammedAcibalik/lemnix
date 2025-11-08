/**
 * @fileoverview Shared Button Component
 * @module shared/ui/Button
 * @version 1.0.0
 * 
 * Unified button component with design system integration.
 * All buttons in the app MUST use this component.
 */

import React, { forwardRef } from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

export interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  /**
   * Button size from design system
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Loading state - shows spinner and disables button
   */
  loading?: boolean;
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Icon to show before text
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon to show after text
   */
  endIcon?: React.ReactNode;
}

/**
 * Button Component
 * 
 * Design system compliant button with loading states.
 * 
 * @example
 * ```tsx
 * <Button
 *   variant="contained"
 *   size="medium"
 *   loading={isLoading}
 *   onClick={handleClick}
 * >
 *   Submit
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'medium',
      loading = false,
      disabled,
      children,
      startIcon,
      endIcon,
      fullWidth,
      variant = 'contained',
      sx,
      ...props
    },
    ref
  ) => {
    const { componentSizes, spacing } = useDesignSystem();
    
    const sizeConfig = componentSizes.button[size];
    const isDisabled = disabled || loading;

    return (
      <MuiButton
        ref={ref}
        variant={variant}
        disabled={isDisabled}
        fullWidth={fullWidth}
        startIcon={!loading && startIcon}
        endIcon={!loading && endIcon}
        sx={{
          // Design system sizing
          height: sizeConfig.height,
          padding: sizeConfig.padding,
          fontSize: sizeConfig.fontSize,
          
          // Consistent spacing
          gap: spacing.xs,
          
          // Loading state
          ...(loading && {
            pointerEvents: 'none',
          }),
          
          // Custom sx props (can override)
          ...sx
        }}
        {...props}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: spacing.xs 
          }}>
            <CircularProgress
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
              color="inherit"
            />
            {children && <span>{children}</span>}
          </Box>
        ) : (
          children
        )}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

/**
 * Button variants for convenience
 */
export const PrimaryButton: React.FC<ButtonProps> = (props) => (
  <Button variant="contained" color="primary" {...props} />
);

export const SecondaryButton: React.FC<ButtonProps> = (props) => (
  <Button variant="outlined" color="primary" {...props} />
);

export const TextButton: React.FC<ButtonProps> = (props) => (
  <Button variant="text" color="primary" {...props} />
);

export const DangerButton: React.FC<ButtonProps> = (props) => (
  <Button variant="contained" color="error" {...props} />
);

export const SuccessButton: React.FC<ButtonProps> = (props) => (
  <Button variant="contained" color="success" {...props} />
);

