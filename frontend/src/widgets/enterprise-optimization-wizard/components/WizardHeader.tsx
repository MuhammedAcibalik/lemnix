/**
 * @fileoverview Wizard Header Component - Design System v2.0
 * @module EnterpriseOptimizationWizard/Components/WizardHeader
 * @version 2.0.0
 */

import React from "react";
import { Box, Typography, IconButton, Tooltip, alpha } from "@mui/material";
import {
  AutoAwesome as SparklesIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";

interface WizardHeaderProps {
  onInfoClick: () => void;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({ onInfoClick }) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        height: 60,
        px: ds.spacing["4"],
        py: ds.spacing["3"],
        background: alpha(ds.colors.surface.elevated1, 0.8),
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Title with Icon */}
      <Box sx={{ display: "flex", alignItems: "center", gap: ds.spacing["2"] }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: `${ds.borderRadius.md}px`,
            background: ds.gradients.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: ds.shadows.soft.sm,
          }}
        >
          <SparklesIcon sx={{ fontSize: 18, color: "white" }} />
        </Box>
        <Typography
          sx={{
            fontSize: "1.125rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
            lineHeight: 1,
          }}
        >
          Enterprise Optimizasyon
        </Typography>
      </Box>

      {/* Info Button */}
      <Tooltip title="Optimizasyon Sistemi Hakkında Bilgi" arrow>
        <IconButton
          onClick={onInfoClick}
          sx={{
            width: 32,
            height: 32,
            borderRadius: `${ds.borderRadius.sm}px`,
            color: ds.colors.text.secondary,
            transition: ds.transitions.fast,
            "&:hover": {
              backgroundColor: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
            },
          }}
        >
          <InfoIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
