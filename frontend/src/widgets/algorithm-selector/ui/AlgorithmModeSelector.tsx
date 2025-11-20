/**
 * @fileoverview Algorithm Mode Selector Widget
 * @module widgets/algorithm-selector
 * @version 1.0.0
 *
 * FSD: Widget layer - Reusable UI component for algorithm selection
 * Design System v2.0: Uses tokens and glassmorphism
 */

import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Chip,
  Stack,
  alpha,
} from "@mui/material";
import { FlashOn, Analytics, AutoAwesome } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import {
  ALGORITHM_CONFIGS,
  getRecommendedMode,
  type AlgorithmMode,
} from "@/entities/algorithm";

/**
 * Component props (readonly for immutability)
 */
export interface AlgorithmModeSelectorProps {
  readonly value: AlgorithmMode;
  readonly onChange: (mode: AlgorithmMode) => void;
  readonly itemCount?: number;
  readonly disabled?: boolean;
}

/**
 * Icon mapping for algorithm modes
 */
const ICON_MAP = {
  flash: FlashOn,
  analytics: Analytics,
  auto_awesome: AutoAwesome,
} as const;

/**
 * Algorithm Mode Selector Component
 *
 * Features:
 * - 3 modes: Standard (fast), Advanced (Pareto), Auto (smart)
 * - Smart recommendation based on item count
 * - Visual feedback with icons and badges
 * - Design System v2.0 compliant
 */
export const AlgorithmModeSelector: React.FC<AlgorithmModeSelectorProps> = ({
  value,
  onChange,
  itemCount,
  disabled = false,
}) => {
  const ds = useDesignSystem();

  // Get recommendation based on item count
  const recommendedMode =
    itemCount !== undefined ? getRecommendedMode(itemCount) : "standard";

  // Debug: Log render
  React.useEffect(() => {
    console.log("[AlgorithmModeSelector] Rendered:", {
      value,
      itemCount,
      recommendedMode,
      disabled,
    });
  }, [value, itemCount, recommendedMode, disabled]);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          fontSize: { xs: "0.9375rem", md: "1rem", lg: "1.125rem" }, // ✅ Biraz küçültüldü
          fontWeight: ds.typography.fontWeight.bold,
          color: ds.colors.text.primary,
          mb: { xs: ds.spacing["1.5"], md: ds.spacing["2"] }, // ✅ Spacing azaltıldı
        }}
      >
        Algoritma Modu
      </Typography>

      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newMode: AlgorithmMode | null) => {
          if (newMode) onChange(newMode);
        }}
        fullWidth
        disabled={disabled}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: { xs: ds.spacing["1.5"], md: ds.spacing["2"] }, // ✅ Spacing azaltıldı
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid",
            borderColor: ds.colors.neutral[200],
            borderRadius: `${ds.borderRadius.sm}px !important`, // ✅ Border radius küçültüldü
            margin: 0,
          },
        }}
      >
        {(["standard", "advanced", "auto"] as const).map((mode) => {
          const config = ALGORITHM_CONFIGS[mode];
          const isRecommended = recommendedMode === mode;
          const isSelected = value === mode;
          const IconComponent = ICON_MAP[config.icon];

          return (
            <ToggleButton
              key={mode}
              value={mode}
              sx={{
                flexDirection: "column",
                alignItems: "flex-start",
                p: {
                  xs: ds.spacing["2"],
                  md: ds.spacing["2.5"],
                  lg: ds.spacing["3"],
                }, // ✅ Padding azaltıldı
                textAlign: "left",
                minHeight: { xs: 100, md: 120, lg: 140 }, // ✅ Min height azaltıldı
                backgroundColor: isSelected
                  ? alpha(ds.colors.primary.main, 0.1)
                  : ds.colors.background.paper,
                "&:hover": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.12),
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(ds.colors.primary.main, 0.12),
                  borderColor: ds.colors.primary.main,
                  borderWidth: "1px",
                  "&:hover": {
                    backgroundColor: alpha(ds.colors.primary.main, 0.16),
                  },
                },
              }}
            >
              <Stack
                direction="row"
                spacing={ds.spacing["1"]} // ✅ Spacing azaltıldı
                alignItems="center"
                sx={{ mb: ds.spacing["1"], width: "100%" }} // ✅ Margin azaltıldı
              >
                <IconComponent
                  sx={{
                    fontSize: { xs: 20, md: 24, lg: 28 }, // ✅ Icon küçültüldü
                    color: isSelected
                      ? ds.colors.primary.main
                      : ds.colors.text.secondary,
                  }}
                />
                {isRecommended && config.badge && (
                  <Chip
                    label={config.badge}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      height: { xs: 20, md: 22 }, // ✅ Chip height küçültüldü
                      fontSize: { xs: "0.625rem", md: "0.6875rem" }, // ✅ Font size küçültüldü
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>

              <Typography
                sx={{
                  fontSize: { xs: "0.875rem", md: "0.9375rem", lg: "1rem" }, // ✅ Font size küçültüldü
                  fontWeight: ds.typography.fontWeight.bold,
                  color: isSelected
                    ? ds.colors.primary.main
                    : ds.colors.text.primary,
                  mb: ds.spacing["0.5"],
                }}
              >
                {config.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "0.6875rem", md: "0.75rem", lg: "0.8125rem" }, // ✅ Font size küçültüldü
                  color: ds.colors.text.secondary,
                  mb: ds.spacing["1"], // ✅ Margin azaltıldı
                  display: "block",
                  lineHeight: 1.4,
                }}
              >
                {config.description}
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "0.6875rem", md: "0.75rem" }, // ✅ Font size küçültüldü
                  color: ds.colors.primary.main,
                  fontWeight: ds.typography.fontWeight.semibold,
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["0.5"],
                }}
              >
                ⏱️ {config.estimatedTime}
              </Typography>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {/* Features list for selected mode */}
      <Box
        sx={{
          mt: { xs: ds.spacing["1.5"], md: ds.spacing["2"] }, // ✅ Margin azaltıldı
          p: { xs: ds.spacing["2"], md: ds.spacing["2.5"] }, // ✅ Padding azaltıldı
          bgcolor: alpha(ds.colors.primary.main, 0.05),
          borderRadius: `${ds.borderRadius.sm}px`,
          border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "0.75rem", md: "0.8125rem" }, // ✅ Font size küçültüldü
            fontWeight: ds.typography.fontWeight.bold,
            color: ds.colors.text.primary,
            display: "block",
            mb: ds.spacing["1"], // ✅ Margin azaltıldı
          }}
        >
          Özellikler:
        </Typography>
        <Stack spacing={ds.spacing["0.5"]}>
          {ALGORITHM_CONFIGS[value].features.map((feature, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: { xs: "0.6875rem", md: "0.75rem", lg: "0.8125rem" }, // ✅ Font size küçültüldü
                color: ds.colors.text.secondary,
                display: "flex",
                alignItems: "center",
                gap: ds.spacing["0.5"],
                lineHeight: 1.4,
              }}
            >
              • {feature}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};
