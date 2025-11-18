/**
 * Stock Length Card Component - Professional Edition
 * Displays detailed summary card for each stock length group
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 2.0.0
 */

import React from "react";
import { Box, Typography, Stack, Chip, Divider, alpha } from "@mui/material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import {
  Straighten as StraightenIcon,
  Percent as PercentIcon,
  ContentCut as CutIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import type { StockLengthGroup } from "./utils";

interface StockLengthCardProps {
  readonly group: StockLengthGroup;
}

export const StockLengthCard: React.FC<StockLengthCardProps> = ({ group }) => {
  const ds = useDesignSystem();

  return (
    <CardV2
      variant="glass"
      sx={{
        height: "100%",
        p: ds.spacing["3"],
        border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
        transition: ds.transitions.base,
        "&:hover": {
          borderColor: alpha(ds.colors.primary.main, 0.3),
          boxShadow: ds.shadows.soft.md,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Header - Compact */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={ds.spacing["2"]}
        mb={ds.spacing["2"]}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: `${ds.borderRadius.md}px`,
            background: ds.gradients.primarySoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StraightenIcon
            sx={{ fontSize: 20, color: ds.colors.primary.main }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: ds.typography.fontWeight.bold,
            background: ds.gradients.primary,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}
        >
          {group.stockLength}mm
        </Typography>
      </Stack>

      {/* Stats - Compact Grid */}
      <Stack spacing={ds.spacing["2"]}>
        {/* Stock Count */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: ds.colors.text.secondary,
              fontWeight: 600,
            }}
          >
            Kesim Planı
          </Typography>
          <Chip
            label={group.totalStocks}
            size="small"
            icon={<InventoryIcon sx={{ fontSize: 12 }} />}
            sx={{
              height: 22,
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
              "& .MuiChip-icon": {
                color: ds.colors.primary.main,
                ml: 0.5,
              },
            }}
          />
        </Stack>

        {/* Total Pieces */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: ds.colors.text.secondary,
              fontWeight: 600,
            }}
          >
            Toplam Parça
          </Typography>
          <Chip
            label={group.totalPieces}
            size="small"
            icon={<CutIcon sx={{ fontSize: 12 }} />}
            sx={{
              height: 22,
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: alpha(ds.colors.info.main, 0.1),
              color: ds.colors.info.main,
              "& .MuiChip-icon": {
                color: ds.colors.info.main,
                ml: 0.5,
              },
            }}
          />
        </Stack>

        {/* Average Efficiency */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: ds.colors.text.secondary,
              fontWeight: 600,
            }}
          >
            Ort. Verimlilik
          </Typography>
          <Chip
            label={`${group.avgEfficiency.toFixed(1)}%`}
            size="small"
            icon={<PercentIcon sx={{ fontSize: 12 }} />}
            sx={{
              height: 22,
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: alpha(ds.colors.success.main, 0.1),
              color: ds.colors.success.main,
              "& .MuiChip-icon": {
                color: ds.colors.success.main,
                ml: 0.5,
              },
            }}
          />
        </Stack>
      </Stack>
    </CardV2>
  );
};
