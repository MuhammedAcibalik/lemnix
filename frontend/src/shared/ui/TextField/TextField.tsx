/**
 * @fileoverview Shared TextField Component
 * @module shared/ui/TextField
 * @version 1.0.0
 * 
 * Unified text field component with design system integration.
 * Replaces all custom TextField implementations.
 */

import React, { forwardRef, useMemo } from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  Box,
  Typography,
  InputAdornment,
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';

type FieldSize = 'small' | 'medium' | 'large';

type FieldVariant = 'outlined' | 'filled' | 'standard';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'size' | 'variant'> {
  readonly size?: FieldSize;
  readonly variant?: FieldVariant;
  readonly startIcon?: React.ReactNode;
  readonly endIcon?: React.ReactNode;
  readonly helperText?: string;
  readonly showCharCount?: boolean;
  readonly maxLength?: number;
}

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
      size = 'medium',
      variant = 'outlined',
      startIcon,
      endIcon,
      helperText,
      showCharCount,
      maxLength,
      value,
      error,
      sx,
      InputProps,
      inputProps,
      ...props
    },
    ref
  ) => {
    const ds = useDesignSystem();

    const sizeConfig = ds.componentSizes.input[size];
    const characterCount = typeof value === 'string' ? value.length : 0;
    const isOverLimit = maxLength ? characterCount > maxLength : false;

    const adornmentColor = ds.colors.neutral[500];

    const focusRing = ds.getFocusRing?.() ?? {
      boxShadow: `${ds.focus.ring}, ${ds.focus.ringOffset}`,
      outline: 'none',
    };

    const mergedInputProps = useMemo(() => ({
      startAdornment: startIcon && (
        <InputAdornment position="start">
          <Box sx={{ display: 'flex', alignItems: 'center', color: adornmentColor }}>
            {startIcon}
          </Box>
        </InputAdornment>
      ),
      endAdornment: endIcon && (
        <InputAdornment position="end">
          <Box sx={{ display: 'flex', alignItems: 'center', color: adornmentColor }}>
            {endIcon}
          </Box>
        </InputAdornment>
      ),
      ...InputProps,
    }), [InputProps, adornmentColor, startIcon, endIcon]);

    return (
      <Box sx={{ width: '100%' }}>
        <MuiTextField
          ref={ref}
          variant={variant}
          value={value}
          error={error || isOverLimit}
          InputProps={mergedInputProps}
          inputProps={{
            maxLength,
            ...inputProps,
          }}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              height: sizeConfig.height,
              fontSize: sizeConfig.fontSize,
              borderRadius: `${ds.borderRadius.input}px`,
              transition: ds.transitions.base,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: ds.colors.neutral[200],
              },
              '&:hover fieldset': {
                borderColor: ds.colors.neutral[300],
              },
              '&.Mui-focused fieldset': {
                borderColor: ds.colors.primary.main,
                borderWidth: 2,
              },
              '&:focus-visible': focusRing,
              '&.Mui-error fieldset': {
                borderColor: ds.colors.error.main,
              },
            },
            '& .MuiFilledInput-root': {
              borderRadius: `${ds.borderRadius.input}px`,
              backgroundColor: ds.colors.surface.elevated1,
              '&:hover': {
                backgroundColor: ds.colors.surface.elevated2,
              },
              '&.Mui-focused': {
                backgroundColor: ds.colors.surface.elevated1,
              },
            },
            ...sx,
          }}
          {...props}
        />

        {(helperText || showCharCount) && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 0.5,
              px: ds.spacing['2'],
              gap: ds.spacing['2'],
            }}
          >
            {helperText && (
              <Typography
                variant="caption"
                sx={{
                  color: error || isOverLimit ? ds.colors.error.main : ds.colors.neutral[600],
                  fontSize: '0.75rem',
                }}
              >
                {helperText}
              </Typography>
            )}

            {showCharCount && maxLength && (
              <Typography
                variant="caption"
                sx={{
                  color: isOverLimit ? ds.colors.error.main : ds.colors.neutral[500],
                  fontWeight: isOverLimit ? ds.typography.fontWeight.semibold : ds.typography.fontWeight.normal,
                }}
              >
                {characterCount}/{maxLength}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

TextField.displayName = 'TextField';

