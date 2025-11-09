/**
 * @fileoverview Plan Metrics Component
 * @module widgets/production-plan-manager/ui
 * @version 1.0.0
 */

import React from "react";
import { Grid, Box, Typography, useTheme } from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { Card } from "@/shared/ui/Card";
import type { ProductionPlanMetrics } from "@/entities/production-plan";

interface PlanMetricsProps {
  readonly metrics: ProductionPlanMetrics;
  readonly loading?: boolean;
}

export const PlanMetrics: React.FC<PlanMetricsProps> = ({
  metrics,
  loading = false,
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();

  if (loading) {
    return (
      <Grid container spacing={ds.spacing["2"]}>
        {Array.from({ length: 2 }).map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card variant="outlined" sx={{ p: ds.spacing["3"] }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["2"],
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: ds.borderRadius["md"],
                    backgroundColor: theme.palette.grey[200],
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      height: 24,
                      backgroundColor: theme.palette.grey[200],
                      borderRadius: ds.borderRadius["sm"],
                      mb: ds.spacing["1"],
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <Box
                    sx={{
                      height: 14,
                      backgroundColor: theme.palette.grey[200],
                      borderRadius: ds.borderRadius["sm"],
                      width: "60%",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const metricCards = [
    {
      title: "Toplam Plan",
      value: metrics.totalPlans,
      icon: <CalendarIcon />,
      color: theme.palette.primary.main,
      description: "Aktif üretim planı",
    },
    {
      title: "Toplam Öğe",
      value: metrics.totalItems,
      icon: <InventoryIcon />,
      color: theme.palette.info.main,
      description: "Planlanan üretim öğesi",
    },
  ];

  return (
    <Grid container spacing={ds.spacing["2"]}>
      {metricCards.map((card, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Card
            variant="outlined"
            sx={{
              p: ds.spacing["3"],
              height: "100%",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: ds.shadows.soft.md,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: ds.spacing["2"],
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: ds.borderRadius["md"],
                  backgroundColor: card.color + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.color,
                }}
              >
                {card.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 1.2,
                    mb: ds.spacing["1"],
                  }}
                >
                  {card.value.toLocaleString("tr-TR")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.grey[700],
                    fontSize: "0.875rem",
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.grey[500],
                    fontSize: "0.75rem",
                  }}
                >
                  {card.description}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
