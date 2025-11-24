/**
 * @fileoverview Shared Select Component
 * @module shared/ui/Select
 * @version 1.0.0
 *
 * Unified select/dropdown component with design system integration.
 * Replaces all custom Select implementations.
 */

import React, { forwardRef } from "react";
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  SelectProps as MuiSelectProps,
  FormHelperText,
  Box,
  Chip,
} from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";
import {
  zoomAwareInput,
  fluidFontSize,
  fluidSpacing,
  pxToRem,
} from "@/shared/lib/zoom-aware";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  color?: string;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<MuiSelectProps, "size"> {
  /**
   * Select size from design system
   */
  size?: "small" | "medium" | "large";

  /**
   * Options array
   */
  options: SelectOption[];

  /**
   * Helper text below select
   */
  helperText?: string;

  /**
   * Show color chip for each option
   */
  showColorChip?: boolean;

  /**
   * Custom empty text
   */
  emptyText?: string;
}

/**
 * Select Component
 *
 * Design system compliant dropdown/select with icons and colors.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Renk"
 *   value={color}
 *   onChange={(e) => setColor(e.target.value)}
 *   options={[
 *     { value: 'PRES', label: 'PRES', color: '#059669' },
 *     { value: 'BEYAZ', label: 'BEYAZ', color: '#ffffff' }
 *   ]}
 *   showColorChip
 * />
 * ```
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      size = "medium",
      options,
      helperText,
      showColorChip,
      emptyText = "Seçiniz...",
      label,
      error,
      required,
      disabled,
      value,
      sx,
      ...props
    },
    ref,
  ) => {
    const { componentSizes, colors, borderRadius, spacing, zIndex } =
      useDesignSystem();

    // ✅ Zoom-aware size config with fluid sizing
    const baseSizeConfig = componentSizes.input[size] as {
      height: number;
      fontSize: string;
      padding: string;
    };
    // Extract numeric fontSize value (handle both px and rem)
    const baseFontSizeNum =
      typeof baseSizeConfig.fontSize === "string"
        ? parseFloat(
            baseSizeConfig.fontSize.replace("rem", "").replace("px", ""),
          ) * (baseSizeConfig.fontSize.includes("rem") ? 16 : 1)
        : 16;

    const sizeConfig = {
      ...baseSizeConfig,
      fontSize: fluidFontSize(
        pxToRem(baseFontSizeNum * 0.9), // Min: 90%
        pxToRem(baseFontSizeNum * 1.1), // Max: 110%
        0.3,
      ),
      height: baseSizeConfig.height, // Keep height for now, can be made fluid later
    };
    const labelId = `select-label-${label?.toString().replace(/\s+/g, "-").toLowerCase()}`;

    return (
      <FormControl
        ref={ref}
        fullWidth
        {...(error !== undefined ? { error } : {})}
        {...(disabled !== undefined ? { disabled } : {})}
        {...(required !== undefined ? { required } : {})}
        {...(sx ? { sx } : {})}
      >
        {label && (
          <InputLabel id={labelId} sx={{ fontSize: sizeConfig.fontSize }}>
            {label}
          </InputLabel>
        )}

        <MuiSelect
          labelId={labelId}
          value={value}
          label={label}
          displayEmpty={!!emptyText}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
                borderRadius: `${borderRadius.md}px`,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                mt: 0.5,
              },
            },
            // ✅ FIXED: Consistent z-index from design system
            sx: {
              zIndex: zIndex.dropdown,
            },
          }}
          sx={{
            ...zoomAwareInput, // ✅ Zoom-aware base styles
            height: sizeConfig.height,
            fontSize: sizeConfig.fontSize,
            minHeight: sizeConfig.height,

            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: `${borderRadius.input}px`,
              borderColor: colors.neutral[200],
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.neutral[300],
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.primary[600],
              borderWidth: 2,
            },

            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.error[500],
            },

            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
            },
          }}
          {...props}
        >
          {/* Empty option */}
          {emptyText && !required && (
            <MenuItem value="" sx={{ color: colors.neutral[500] }}>
              <em>{emptyText}</em>
            </MenuItem>
          )}

          {/* Options */}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              {...(option.disabled !== undefined
                ? { disabled: option.disabled }
                : {})}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: spacing.xs,
                minHeight: 40,

                "&:hover": {
                  backgroundColor: colors.neutral[50],
                },

                "&.Mui-selected": {
                  backgroundColor: colors.primary[50],

                  "&:hover": {
                    backgroundColor: colors.primary[100],
                  },
                },
              }}
            >
              {/* Option icon */}
              {option.icon && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {option.icon}
                </Box>
              )}

              {/* Option label */}
              <span>{option.label}</span>

              {/* Color chip */}
              {showColorChip && option.color && (
                <Chip
                  size="small"
                  sx={{
                    ml: "auto",
                    height: 20,
                    backgroundColor: option.color,
                    border: `1px solid ${colors.neutral[300]}`,
                    "& .MuiChip-label": {
                      px: 1,
                      fontSize: "0.625rem",
                      color: "#000000",
                      mixBlendMode: "difference",
                    },
                  }}
                />
              )}
            </MenuItem>
          ))}
        </MuiSelect>

        {/* Helper Text */}
        {helperText && (
          <FormHelperText
            sx={{
              color: error ? colors.error[500] : colors.neutral[600],
              fontSize: "0.75rem",
              mx: spacing.sm,
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  },
);

Select.displayName = "Select";
