/**
 * Summary Card Component
 * Reusable summary card with grid items
 *
 * @module enterprise-optimization-wizard/components/results/shared
 * @version 1.0.0
 */

import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";

export interface SummaryItem {
  readonly label: string;
  readonly value: string | number;
  readonly color?: string;
}

export interface SummaryCardProps {
  readonly title: string;
  readonly items: readonly SummaryItem[];
}

/**
 * Summary Card
 * Displays a grid of summary items with title
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({ title, items }) => {
  const ds = useDesignSystem();

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["4"], mb: ds.spacing["4"] }}>
      <Typography
        sx={{
          fontSize: "1.125rem",
          fontWeight: ds.typography.fontWeight.bold,
          color: ds.colors.text.primary,
          mb: ds.spacing["3"],
        }}
      >
        {title}
      </Typography>

      <Grid container spacing={ds.spacing["3"]}>
        {items.map((item, index) => (
          <Grid item xs={12} md={Math.floor(12 / items.length)} key={index}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: ds.colors.text.secondary,
                  mb: ds.spacing["1"],
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: item.color || ds.colors.primary.main,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </CardV2>
  );
};
