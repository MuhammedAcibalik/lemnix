/**
 * @fileoverview Modern Kesim Planı Komponenti
 * @module ModernCuttingPlan
 * @version 1.0.0
 *
 * Modern, şık ve kullanıcı dostu kesim planı tasarımı
 */

import React from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Engineering,
  ContentCut,
  TrendingUp,
  Warning,
} from "@mui/icons-material";

interface Cut {
  id: string;
  stockLength: number;
  usedLength: number;
  remainingLength: number;
  segmentCount?: number;
  segments: Array<{
    id: string;
    length: number;
    quantity?: number;
    workOrderId?: string;
    workOrderItemId?: string;
    profileType: string;
  }>;
}

interface ModernCuttingPlanProps {
  cuts: Cut[];
}

export const ModernCuttingPlan: React.FC<ModernCuttingPlanProps> = ({
  cuts,
}) => {
  const theme = useTheme();

  if (!cuts || cuts.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Kesim planı verisi bulunamadı
        </Typography>
      </Box>
    );
  }

  // Stok boylarına göre grupla
  const stockGroups = cuts.reduce((acc: Record<number, Cut[]>, cut) => {
    const stockLength = cut.stockLength;
    if (!acc[stockLength]) {
      acc[stockLength] = [];
    }
    acc[stockLength]!.push(cut);
    return acc;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {Object.entries(stockGroups)
        .sort(([a], [b]) => Number(b) - Number(a)) // Büyükten küçüğe
        .map(([stockLength, stockCuts]) => (
          <Card
            key={stockLength}
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: theme.shadows[2],
            }}
          >
            {/* Stok Başlığı */}
            <Box
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 48,
                      height: 48,
                      boxShadow: theme.shadows[3],
                    }}
                  >
                    <Engineering />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="primary.dark"
                    >
                      📏 {stockLength}mm Stok
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stockCuts.length} kesim •{" "}
                      {stockCuts.reduce(
                        (sum, cut) =>
                          sum + (cut.segmentCount || cut.segments.length),
                        0,
                      )}{" "}
                      parça
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Chip
                    label={`${((stockCuts.reduce((sum, cut) => sum + cut.usedLength, 0) / (Number(stockLength) * stockCuts.length)) * 100).toFixed(1)}% Verimlilik`}
                    color="success"
                    sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Kesim Detayları */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {stockCuts.map((cut, index) => (
                  <Grid item xs={12} md={6} lg={4} key={cut.id}>
                    <Paper
                      sx={{
                        p: 2.5,
                        border: "1px solid",
                        borderColor: alpha(theme.palette.divider, 0.5),
                        borderRadius: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: theme.shadows[4],
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {/* Kesim Başlığı */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary"
                        >
                          Kesim #{index + 1}
                        </Typography>
                        <Chip
                          label={`${cut.segmentCount || cut.segments.length} parça`}
                          size="small"
                          color="info"
                        />
                      </Box>

                      {/* Parça Listesi */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="text.secondary"
                          gutterBottom
                        >
                          Parçalar:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          {cut.segments.map((segment, segIndex) => (
                            <Chip
                              key={segIndex}
                              label={`${segment.length}mm`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.75rem",
                                height: 24,
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Kullanım ve Atık */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            Kullanılan
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="success.main"
                          >
                            {cut.usedLength}mm
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            Atık
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={
                              cut.remainingLength > 500
                                ? "error.main"
                                : "warning.main"
                            }
                          >
                            {cut.remainingLength}mm
                          </Typography>
                        </Box>
                      </Box>

                      {/* Verimlilik Bar */}
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Verimlilik
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {((cut.usedLength / cut.stockLength) * 100).toFixed(
                              1,
                            )}
                            %
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(cut.usedLength / cut.stockLength) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(theme.palette.grey[300], 0.3),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                            },
                          }}
                        />
                      </Box>

                      {/* Kesim Talimatı */}
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          color="info.dark"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          📋 KESİM TALİMATI:
                        </Typography>
                        <Typography
                          variant="caption"
                          color="info.dark"
                          sx={{
                            display: "block",
                            fontSize: "0.75rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {cut.segments
                            .map((seg) => `${seg.length}mm`)
                            .join(" + ")}{" "}
                          + {cut.remainingLength}mm atık
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Card>
        ))}
    </Box>
  );
};

export default ModernCuttingPlan;
