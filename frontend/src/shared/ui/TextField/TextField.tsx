/**
 * @fileoverview TextField Component v3.0
 * @module shared/ui/TextField
 * @version 3.0.0
 */

import React, { forwardRef, useState } from "react";
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import {
  zoomAwareInput,
  fluidFontSize,
  fluidSpacing,
  pxToRem,
} from "@/shared/lib/zoom-aware";

type TextFieldVariant = "standard" | "outlined" | "filled" | "modern";
type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<MuiTextFieldProps, "variant" | "size"> {
  readonly variant?: TextFieldVariant;
  readonly size?: TextFieldSize;
  readonly success?: boolean;
  readonly helperIcon?: React.ReactNode;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
  readonly showPasswordToggle?: boolean;
  readonly characterCount?: boolean;
  readonly maxCharacters?: number;
}

/**
 * TextField Component
 *
 * Modern text field with enhanced visual design and UX features
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
      variant = "modern",
      size = "md",
      type: typeProp = "text",
      success = false,
      error = false,
      helperText,
      helperIcon,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      characterCount = false,
      maxCharacters,
      value,
      onChange,
      sx = {},
      InputProps = {},
      ...props
    },
    ref,
  ) => {
    const ds = useDesignSystem();
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const type = showPasswordToggle && showPassword ? "text" : typeProp;
    const isPassword = typeProp === "password" && showPasswordToggle;

    // Calculate character count
    const currentLength = typeof value === "string" ? value.length : 0;
    const showCount = characterCount && (maxCharacters || focused);

    // Size configurations with safe fallbacks
    const sizeConfig = {
      sm: {
        height: 36,
        fontSize: ds.fontSize?.sm || "0.875rem", // 14px fallback
        padding: `${ds.spacing?.["2"] || 8}px ${ds.spacing?.["3"] || 12}px`,
      },
      md: {
        height: 44,
        fontSize: ds.fontSize?.base || "1rem", // 16px fallback
        padding: `${ds.spacing?.["2.5"] || 10}px ${ds.spacing?.["3"] || 12}px`,
      },
      lg: {
        height: 52,
        fontSize: ds.fontSize?.lg || "1.125rem", // 18px fallback
        padding: `${ds.spacing?.["3"] || 12}px ${ds.spacing?.["4"] || 16}px`,
      },
    };

    // Ensure size is valid, fallback to 'md'
    const validSize: TextFieldSize = size && sizeConfig[size] ? size : "md";
    const currentSize = sizeConfig[validSize];

    // Variant styles
    const variantStyles = {
      standard: {},
      outlined: {},
      filled: {},
      modern: {
        "& .MuiOutlinedInput-root": {
          borderRadius: `${ds.borderRadius.input}px`,
          transition: `all ${ds.duration.base}ms ${ds.easing.easeOut}`,
          backgroundColor: focused
            ? ds.colors.surface.base
            : alpha(ds.colors.surface.elevated1, 0.5),
          backdropFilter: focused ? "blur(8px)" : "none",

          "& fieldset": {
            borderColor: error
              ? ds.colors.error.main
              : success
                ? ds.colors.success.main
                : ds.colors.border.default,
            borderWidth: focused ? 2 : 1,
            transition: `all ${ds.duration.fast}ms ${ds.easing.easeOut}`,
          },

          "&:hover fieldset": {
            borderColor: error
              ? ds.colors.error.dark
              : success
                ? ds.colors.success.dark
                : ds.colors.primary.main,
          },

          "&.Mui-focused": {
            backgroundColor: ds.colors.surface.base,
            boxShadow: error
              ? ds.focus.ring.error
              : success
                ? ds.focus.ring.success
                : ds.focus.ring.primary,

            "& fieldset": {
              borderColor: error
                ? ds.colors.error.main
                : success
                  ? ds.colors.success.main
                  : ds.colors.primary.main,
            },
          },

          "&.Mui-error": {
            "& fieldset": {
              borderColor: ds.colors.error.main,
            },
          },
        },

        "& .MuiInputLabel-root": {
          color: ds.colors.text.secondary,
          fontWeight: ds.fontWeight.medium,
          fontSize: currentSize.fontSize,

          "&.Mui-focused": {
            color: error
              ? ds.colors.error.main
              : success
                ? ds.colors.success.main
                : ds.colors.primary.main,
          },

          "&.Mui-error": {
            color: ds.colors.error.main,
          },
        },

        "& .MuiInputBase-input": {
          fontSize: currentSize.fontSize,
          padding: currentSize.padding,
          height: "auto",
          color: ds.colors.text.primary,
          fontWeight: ds.fontWeight.normal,

          "&::placeholder": {
            color: ds.colors.text.disabled,
            opacity: 1,
          },
        },
      },
    };

    // Status icon
    const getStatusIcon = () => {
      if (error) {
        return (
          <ErrorIcon
            sx={{
              color: ds.colors.error.main,
              fontSize: size === "sm" ? 18 : size === "md" ? 20 : 22,
            }}
          />
        );
      }
      if (success) {
        return (
          <CheckCircle
            sx={{
              color: ds.colors.success.main,
              fontSize: size === "sm" ? 18 : size === "md" ? 20 : 22,
            }}
          />
        );
      }
      return null;
    };

    // Build InputProps
    const mergedInputProps = {
      ...InputProps,
      startAdornment: leftIcon && (
        <InputAdornment position="start">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: focused
                ? ds.colors.primary.main
                : ds.colors.text.secondary,
              transition: `color ${ds.duration.fast}ms ${ds.easing.easeOut}`,
            }}
          >
            {leftIcon}
          </Box>
        </InputAdornment>
      ),
      endAdornment: (
        <>
          {(rightIcon || isPassword || error || success) && (
            <InputAdornment position="end">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {rightIcon}
                {getStatusIcon()}
                {isPassword && (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{
                      color: ds.colors.text.secondary,
                      "&:hover": {
                        color: ds.colors.text.primary,
                        backgroundColor: alpha(ds.colors.primary.main, 0.08),
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                )}
              </Box>
            </InputAdornment>
          )}
        </>
      ),
    };

    return (
      <Box sx={{ width: "100%" }}>
        <MuiTextField
          ref={ref}
          type={type}
          variant={variant === "modern" ? "outlined" : variant}
          error={error}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          InputProps={mergedInputProps}
          sx={{
            ...zoomAwareInput, // ✅ Zoom-aware base styles
            width: "100%",
            ...variantStyles[variant],
            // ✅ Apply fluid sizing
            "& .MuiOutlinedInput-input": {
              fontSize: currentSize.fontSize,
              padding: currentSize.padding,
            },
            "& .MuiOutlinedInput-root": {
              height: currentSize.height,
              minHeight: currentSize.height,
            },
            ...sx,
          }}
          {...props}
        />

        {/* Helper text with icon and character count */}
        {(helperText || showCount) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mt: 1,
              px: 0.5,
            }}
          >
            {helperText && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  flex: 1,
                }}
              >
                {helperIcon && (
                  <Box
                    sx={{
                      display: "flex",
                      color: error
                        ? ds.colors.error.main
                        : success
                          ? ds.colors.success.main
                          : ds.colors.text.secondary,
                    }}
                  >
                    {helperIcon}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: error
                      ? ds.colors.error.main
                      : success
                        ? ds.colors.success.main
                        : ds.colors.text.secondary,
                    fontSize: ds.fontSize.xs,
                  }}
                >
                  {helperText}
                </Typography>
              </Box>
            )}

            {showCount && (
              <Typography
                variant="caption"
                sx={{
                  color:
                    maxCharacters && currentLength > maxCharacters
                      ? ds.colors.error.main
                      : ds.colors.text.secondary,
                  fontSize: ds.fontSize.xs,
                  fontWeight: ds.fontWeight.medium,
                  ml: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {currentLength}
                {maxCharacters && ` / ${maxCharacters}`}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  },
);

TextField.displayName = "TextField";

/**
 * SearchField - Pre-configured for search inputs
 */
export const SearchField = forwardRef<
  HTMLDivElement,
  Omit<TextFieldProps, "type">
>((props, ref) => (
  <TextField ref={ref} type="search" placeholder="Search..." {...props} />
));

SearchField.displayName = "SearchField";

/**
 * PasswordField - Pre-configured for password inputs
 */
export const PasswordField = forwardRef<
  HTMLDivElement,
  Omit<TextFieldProps, "type">
>((props, ref) => (
  <TextField ref={ref} type="password" showPasswordToggle {...props} />
));

PasswordField.displayName = "PasswordField";

export default TextField;
