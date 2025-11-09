/**
 * @fileoverview Stock Card Component
 * @module StockCard
 * @version 1.0.0
 */

import React, { useState } from "react";
import { Cut } from "../../types";
import {
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  LinearProgress,
  Paper,
  Box,
  Button,
  Collapse,
} from "@mui/material";
import {
  Engineering as EngineeringIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

interface StockSummaryItem {
  length: number;
  count: number;
  used: number;
  waste: number;
}

interface StockCardProps {
  stock: StockSummaryItem;
  onCuttingPlanDetails: (stock: Cut) => void;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  onCuttingPlanDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const efficiency = (stock.used / (stock.length * stock.count)) * 100;
  const wastePercentage = (stock.waste / (stock.length * stock.count)) * 100;

  // ✅ FIX: Remove debug log causing console spam
  // console.log('StockCard Debug:', {
  //   stock: { length: stock.length, count: stock.count, used: stock.used, waste: stock.waste },
  //   efficiency: efficiency,
  //   wastePercentage: wastePercentage,
  //   isValid: !isNaN(efficiency) && isFinite(efficiency),
  //   efficiencyCalculation: `${stock.used} / (${stock.length} * ${stock.count}) * 100 = ${efficiency}`
  // });

  return (
    <Grid item xs={12} sm={6} md={4} key={stock.length}>
      <Card
        sx={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: "2px solid rgba(0,0,0,0.08)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              efficiency >= 90
                ? "linear-gradient(90deg, #059669 0%, #22c55e 100%)"
                : efficiency >= 80
                  ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)"
                  : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
            zIndex: 1,
          },
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
            border: "2px solid rgba(59,130,246,0.2)",
          },
          transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <CardContent
          sx={{
            p: 3,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background:
                    "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
                  color: "white",
                  boxShadow: "0 3px 8px rgba(30,64,175,0.25)",
                }}
              >
                <EngineeringIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {stock.length} mm Stok Uzunluğu
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stock.count} profil x 4 x 1730 mm
                </Typography>
                <Chip
                  label="Profil Tipi: 19X25"
                  color="primary"
                  variant="filled"
                  size="small"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    px: 1,
                    py: 0.3,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>
            <Chip
              label={`${efficiency.toFixed(1)}% Verimlilik`}
              color="success"
              variant="filled"
              size="small"
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.5,
                background: "linear-gradient(135deg, #059669 0%, #22c55e 100%)",
                color: "white",
                boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
              }}
            />
          </Box>

          {/* Kesim Detayları Button */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                console.log("🔍 StockCard Kesim Detayları clicked:", {
                  isExpanded,
                  stock,
                });
                setIsExpanded(!isExpanded);
              }}
              sx={{
                minWidth: "140px",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "0.8rem",
                background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 12px rgba(30,64,175,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(124,58,237,0.4)",
                },
                transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
              startIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                />
              }
            >
              Kesim Detayları
            </Button>
          </Box>

          {/* Expandable Details - 4 Cards */}
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background: "rgba(59,130,246,0.05)",
                      border: "1px solid rgba(59,130,246,0.1)",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <DescriptionIcon
                        sx={{ fontSize: 16, color: "primary.main" }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                    >
                      40
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Parça
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background: "rgba(16,185,129,0.05)",
                      border: "1px solid rgba(16,185,129,0.1)",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <InventoryIcon
                        sx={{ fontSize: 16, color: "success.main" }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {stock.count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Profil Sayısı
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background: "rgba(245,158,11,0.05)",
                      border: "1px solid rgba(245,158,11,0.1)",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <WarningIcon
                        sx={{ fontSize: 16, color: "warning.main" }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {stock.count
                        ? Math.round((stock.waste || 0) / stock.count)
                        : 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ort. Atık (mm)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background: "rgba(139,92,246,0.05)",
                      border: "1px solid rgba(139,92,246,0.1)",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <TrendingUpIcon
                        sx={{ fontSize: 16, color: "secondary.main" }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="secondary.main"
                    >
                      {efficiency.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Verimlilik
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          {/* Efficiency Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Verimlilik Oranı
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="text.primary"
              >
                {efficiency.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={efficiency}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(0,0,0,0.1)",
                "& .MuiLinearProgress-bar": {
                  background:
                    efficiency >= 90
                      ? "linear-gradient(90deg, #059669 0%, #22c55e 100%)"
                      : efficiency >= 80
                        ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)"
                        : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Summary Text */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
              fontStyle: "italic",
              mt: 1,
            }}
          >
            Bu gruptan kesilen toplam parça: 40 adet • Her profilden ortalama
            kalan atık:{" "}
            {stock.count ? Math.round(stock.waste / stock.count) : 0} mm
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};
