/**
 * @fileoverview Selection Summary Component v2.0 - Modern Action Bar
 * @module SelectionSummary
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from "react";
import {
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  CircularProgress,
  alpha,
  Divider,
} from "@mui/material";
import {
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Transform as ConvertIcon,
  Inventory as InventoryIcon,
  Architecture as ProfileIcon,
  Straighten as LengthIcon,
} from "@mui/icons-material";
import { SelectionSummaryProps } from "../types";
import { textContent, accessibilityConstants } from "../constants";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared";

/**
 * Selection Summary Component
 */
export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectionState,
  onClearSelection,
  onSelectAll,
  onConvertSelection,
  isConverting,
}) => {
  const ds = useDesignSystem();

  return (
    <CardV2
      variant="elevated"
      sx={{
        mb: ds.spacing["4"],
        position: "sticky",
        top: ds.spacing["4"],
        zIndex: 10,
      }}
    >
      <Box sx={{ p: ds.spacing["4"] }}>
        {/* Header with Title */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={ds.spacing["3"]}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: ds.colors.text.primary,
            }}
          >
            Seçim Özeti
          </Typography>

          {/* Action Buttons */}
          <Stack direction="row" spacing={ds.spacing["2"]}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SelectAllIcon sx={{ fontSize: 18 }} />}
              onClick={onSelectAll}
              aria-label={accessibilityConstants.ariaLabels.selectAllButton}
              sx={{
                borderRadius: `${ds.borderRadius.md}px`,
                fontSize: "0.8125rem",
                fontWeight: 600,
                textTransform: "none",
                borderColor: alpha(ds.colors.primary.main, 0.3),
                "&:hover": {
                  borderColor: ds.colors.primary.main,
                  background: alpha(ds.colors.primary.main, 0.05),
                },
              }}
            >
              Tümünü Seç
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon sx={{ fontSize: 18 }} />}
              onClick={onClearSelection}
              disabled={selectionState.totalSelectedItems === 0}
              aria-label={
                accessibilityConstants.ariaLabels.clearSelectionButton
              }
              sx={{
                borderRadius: `${ds.borderRadius.md}px`,
                fontSize: "0.8125rem",
                fontWeight: 600,
                textTransform: "none",
                borderColor: alpha(ds.colors.error.main, 0.3),
                color: ds.colors.error.main,
                "&:hover": {
                  borderColor: ds.colors.error.main,
                  background: alpha(ds.colors.error.main, 0.05),
                },
              }}
            >
              Temizle
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: ds.spacing["3"], opacity: 0.5 }} />

        {/* Stats Badges */}
        <Stack
          direction="row"
          spacing={ds.spacing["2"]}
          flexWrap="wrap"
          mb={ds.spacing["3"]}
        >
          <Chip
            icon={<InventoryIcon sx={{ fontSize: 16 }} />}
            label={`${selectionState.totalSelectedItems} Parça`}
            sx={{
              height: 32,
              fontWeight: 600,
              fontSize: "0.8125rem",
              background: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          />
          <Chip
            icon={<ProfileIcon sx={{ fontSize: 16 }} />}
            label={`${selectionState.totalSelectedProfiles} Profil`}
            sx={{
              height: 32,
              fontWeight: 600,
              fontSize: "0.8125rem",
              background: alpha(ds.colors.secondary.main, 0.1),
              color: ds.colors.secondary.main,
              border: `1px solid ${alpha(ds.colors.secondary.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          />
          <Chip
            icon={<LengthIcon sx={{ fontSize: 16 }} />}
            label={`${selectionState.estimatedTotalLength.toFixed(0)} mm`}
            sx={{
              height: 32,
              fontWeight: 600,
              fontSize: "0.8125rem",
              background: alpha(ds.colors.success.main, 0.1),
              color: ds.colors.success.main,
              border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          />
        </Stack>

        {/* Convert Button - Primary Action */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={
            isConverting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <ConvertIcon />
            )
          }
          onClick={onConvertSelection}
          disabled={selectionState.totalSelectedItems === 0 || isConverting}
          aria-label={accessibilityConstants.ariaLabels.convertButton}
          sx={{
            height: 48,
            borderRadius: `${ds.borderRadius.lg}px`,
            fontSize: "0.9375rem",
            fontWeight: 700,
            background: ds.gradients.primary,
            boxShadow: ds.shadows.soft.md,
            textTransform: "none",
            transition: ds.transitions.base,
            "&:hover": {
              background: ds.gradients.primary.default,
              boxShadow: ds.shadows.soft.lg,
              transform: "translateY(-2px)",
            },
            "&:disabled": {
              background: alpha(ds.colors.neutral[400], 0.3),
              color: ds.colors.neutral[500],
            },
          }}
        >
          {isConverting ? "Dönüştürülüyor..." : "Seçimi Optimizasyona Aktar"}
        </Button>
      </Box>
    </CardV2>
  );
};
