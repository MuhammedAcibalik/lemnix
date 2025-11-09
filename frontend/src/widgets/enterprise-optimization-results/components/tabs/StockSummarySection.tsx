/**
 * @fileoverview Stock Summary Section Component
 * @module StockSummarySection
 * @version 1.0.0
 */

import React from "react";
import { OptimizationResult, Cut } from "../../types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
} from "@mui/material";
import { BarChart as BarChartIcon } from "@mui/icons-material";
import { StockCard } from "./StockCard";

interface StockSummaryItem {
  length: number;
  count: number;
  used: number;
  waste: number;
}

interface StockSummarySectionProps {
  result: OptimizationResult;
  onCuttingPlanDetails: (stock: StockSummaryItem) => void;
}

export const StockSummarySection: React.FC<StockSummarySectionProps> = ({
  result,
  onCuttingPlanDetails,
}) => {
  if (!result.cuts || result.cuts.length === 0) {
    return null;
  }

  // Stock summary calculation
  const stockSummary = result.cuts.reduce(
    (acc: Record<string, StockSummaryItem>, cut: Cut) => {
      const key = String(cut.stockLength);
      if (!acc[key]) {
        acc[key] = {
          length: cut.stockLength,
          count: 0,
          used: 0,
          waste: 0,
        };
      }
      acc[key].count++;
      acc[key].used += cut.usedLength;
      acc[key].waste += cut.remainingLength;
      return acc;
    },
    {},
  );

  const stockItems = Object.values(stockSummary) as StockSummaryItem[];

  return (
    <Card
      sx={{
        mb: 3,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: "2px solid rgba(0,0,0,0.08)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, #1e40af 0%, #7c3aed 50%, #1e40af 100%)", // Industrial Harmony
          zIndex: 1,
        },
      }}
    >
      <CardContent sx={{ p: 3, position: "relative", zIndex: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", // Industrial Harmony
              color: "white",
              boxShadow: "0 4px 12px rgba(30,64,175,0.3)", // Industrial Harmony
            }}
          >
            <BarChartIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              📊 Stok Kullanım Özeti
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optimizasyon sonuçlarına göre stok kullanım analizi
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {stockItems
            .sort((a, b) => b.length - a.length)
            .map((stock) => (
              <StockCard
                key={stock.length}
                stock={stock}
                onCuttingPlanDetails={onCuttingPlanDetails}
              />
            ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
