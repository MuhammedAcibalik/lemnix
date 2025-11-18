/**
 * @fileoverview Kesim Detayları Dialog Component - 3 Sekme ile
 * @module KesimDetaylariDialog
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import { WorkOrder, Cut, StockSummary } from "../types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  alpha,
} from "@mui/material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import {
  Engineering as EngineeringIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  ContentCut as CutIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material";

interface KesimDetaylariDialogProps {
  open: boolean;
  workOrder: WorkOrder;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const { tokens } = useAdaptiveUIContext();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`kesim-detaylari-tabpanel-${index}`}
      aria-labelledby={`kesim-detaylari-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            px: tokens.spacing.xl * 2,
            py: tokens.spacing.md,
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export const KesimDetaylariDialog: React.FC<KesimDetaylariDialogProps> = ({
  open,
  workOrder,
  onClose,
}) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Veri hesaplamaları
  const summaryData = useMemo(() => {
    if (!workOrder) return null;

    const totalPieces = workOrder.totalSegments || 0;
    const profileCount = workOrder.stockCount || 0;
    const totalWaste =
      (workOrder.cuts as Cut[])?.reduce(
        (sum: number, cut: Cut) => sum + (cut.remainingLength || 0),
        0,
      ) || 0;
    const totalUsed =
      (workOrder.cuts as Cut[])?.reduce(
        (sum: number, cut: Cut) => sum + (cut.usedLength || 0),
        0,
      ) || 0;
    const efficiency = workOrder.efficiency || 0;

    return {
      totalPieces,
      profileCount,
      totalWaste,
      totalUsed,
      efficiency,
      avgWastePerProfile:
        profileCount > 0 ? Math.round(totalWaste / profileCount) : 0,
      avgPiecesPerProfile:
        profileCount > 0 ? Math.round(totalPieces / profileCount) : 0,
    };
  }, [workOrder]);

  // Stock summary computation for multi-stock optimization display
  const stockSummary = useMemo(() => {
    if (!workOrder?.cuts) return [];

    // Group cuts by stock length
    const grouped = new Map<number, Cut[]>();
    (workOrder.cuts as Cut[]).forEach((cut) => {
      const stockLength = cut.stockLength;
      if (!grouped.has(stockLength)) {
        grouped.set(stockLength, []);
      }
      grouped.get(stockLength)!.push(cut);
    });

    // Create summary for each stock length
    return Array.from(grouped.entries()).map(([stockLength, stockCuts]) => {
      // Group patterns by planLabel
      const patternMap = new Map<string, number>();
      stockCuts.forEach((cut) => {
        const pattern =
          cut.planLabel ||
          `${cut.segmentCount || cut.segments?.length || 0} segments`;
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
      });

      const patterns = Array.from(patternMap.entries()).map(
        ([pattern, count]) => ({
          pattern,
          count,
        }),
      );

      const totalWaste = stockCuts.reduce(
        (sum, cut) => sum + (cut.remainingLength || 0),
        0,
      );
      const totalUsed = stockCuts.reduce(
        (sum, cut) => sum + (cut.usedLength || 0),
        0,
      );
      const totalStock = stockCuts.reduce(
        (sum, cut) => sum + cut.stockLength,
        0,
      );
      const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;

      return {
        stockLength,
        cutCount: stockCuts.length,
        patterns,
        avgWaste: stockCuts.length > 0 ? totalWaste / stockCuts.length : 0,
        totalWaste,
        efficiency,
      };
    });
  }, [workOrder]);

  // Profil detayları
  const profileDetails = useMemo(() => {
    if (!workOrder?.cuts) return [];

    return (workOrder.cuts as Cut[]).map((cut: Cut, index: number) => {
      const waste = cut.remainingLength || 0;
      const used = cut.usedLength || 0;
      const efficiency =
        cut.stockLength > 0 ? (used / cut.stockLength) * 100 : 0;

      return {
        id: cut.id || index,
        stockLength: cut.stockLength || 0,
        usedLength: used,
        wasteLength: waste,
        efficiency: efficiency,
        segmentCount: cut.segmentCount || cut.segments?.length || 0,
        profileType: cut.profileType || "N/A",
      };
    });
  }, [workOrder]);

  // Trend verileri (örnek veriler - gerçek uygulamada API'den gelecek)
  const trendData = useMemo(() => {
    if (!workOrder) return null;

    // Örnek trend verileri
    // Real data from API - no mock data
    const last7Days: Array<{
      efficiency: number;
      date: string;
      waste: number;
      pieces: number;
    }> = [];

    const avgEfficiency =
      last7Days.reduce((sum, day) => sum + day.efficiency, 0) /
      last7Days.length;
    const totalWaste = last7Days.reduce((sum, day) => sum + day.waste, 0);
    const totalPieces = last7Days.reduce((sum, day) => sum + day.pieces, 0);

    return {
      last7Days,
      avgEfficiency,
      totalWaste,
      totalPieces,
      improvement: avgEfficiency - (workOrder.efficiency || 0),
    };
  }, [workOrder]);

  if (!workOrder || !summaryData) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: "95%",
          maxWidth: "1800px",
          borderRadius: `${tokens.borderRadius.xl}px`,
          background: ds.colors.background.paper,
          backdropFilter: "blur(20px)",
          border: `2px solid ${alpha(ds.colors.primary.main, 0.1)}`,
          boxShadow: ds.shadows.soft["3xl"],
          minHeight: "550px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: tokens.spacing.xl * 2,
          py: tokens.spacing.sm,
          background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.secondary.main} 100%)`,
          color: "white",
          fontWeight: ds.typography.fontWeight.bold,
          display: "flex",
          alignItems: "center",
          gap: tokens.spacing.sm,
          fontSize: `${tokens.typography.lg}px`,
        }}
      >
        <EngineeringIcon
          sx={{
            fontSize: tokens.components.icon.lg,
          }}
        />
        İş Emri: {workOrder.workOrderId} - Kesim Detayları
      </DialogTitle>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: tokens.spacing.xl * 2,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="kesim detayları sekmeleri"
          sx={{
            "& .MuiTab-root": {
              minHeight: device.isTouch ? tokens.components.minTouchTarget : 56,
              fontSize: `${tokens.typography.base}px`,
              fontWeight: ds.typography.fontWeight.semibold,
              textTransform: "none",
              gap: tokens.spacing.xs,
              px: tokens.spacing.md,
              transition: ds.transitions.fast,
              "&.Mui-selected": {
                color: ds.colors.primary.main,
                fontWeight: ds.typography.fontWeight.bold,
              },
              "&:hover": !device.isTouch ? {
                backgroundColor: alpha(ds.colors.primary.main, 0.04),
              } : {},
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: `${tokens.borderRadius.sm}px 3px 0 0`,
              background: `linear-gradient(90deg, ${ds.colors.primary.main} 0%, ${ds.colors.secondary.main} 100%)`,
            },
          }}
        >
          <Tab
            label="Genel Özet"
            icon={<AssessmentIcon />}
            iconPosition="start"
          />
          <Tab
            label="Profil Detayları"
            icon={<InventoryIcon />}
            iconPosition="start"
          />
          <Tab
            label="Trend Analizi"
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Sekme 1: Genel Özet */}
      <TabPanel value={tabValue} index={0}>
        {/* Stock Summary Cards - Multi-stock optimization display */}
        {stockSummary.length > 0 && (
          <Box sx={{ mb: tokens.spacing.lg }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: ds.typography.fontWeight.bold,
                color: ds.colors.primary.main,
                mb: tokens.spacing.md,
                fontSize: {
                  xs: `${tokens.typography.lg}px`,
                  md: `${tokens.typography.xl}px`,
                },
              }}
            >
              Stok Bazında Kesim Özeti
            </Typography>
            <Grid container spacing={tokens.layout.gridGap}>
              {stockSummary.map((summary, index) => (
                <Grid item xs={12} md={6} lg={4} key={summary.stockLength}>
                  <Card
                    sx={{
                      background: ds.colors.background.paper,
                      border: `1px solid ${alpha(ds.colors.primary.main, 0.12)}`,
                      borderRadius: `${tokens.borderRadius.lg}px`,
                      height: "100%",
                      transition: ds.transitions.fast,
                      boxShadow: ds.shadows.soft.sm,
                      "&:hover": !device.isTouch ? {
                        transform: "translateY(-2px)",
                        boxShadow: ds.shadows.soft.md,
                        borderColor: alpha(ds.colors.primary.main, 0.2),
                      } : {},
                    }}
                  >
                    <CardContent sx={{ p: tokens.components.card.padding }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: tokens.spacing.sm,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            color: ds.colors.primary.main,
                            fontSize: `${tokens.typography.lg}px`,
                          }}
                        >
                          {summary.stockLength}mm Profil
                        </Typography>
                        <Chip
                          label={`${summary.cutCount} kesim`}
                          color="primary"
                          size="small"
                          sx={{
                            fontWeight: ds.typography.fontWeight.semibold,
                            fontSize: `${tokens.typography.xs}px`,
                            height: tokens.components.button.sm,
                            backgroundColor: alpha(ds.colors.primary.main, 0.1),
                            color: ds.colors.primary.main,
                            border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: tokens.spacing.sm }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{ fontSize: `${tokens.typography.sm}px` }}
                        >
                          Kesim Desenleri:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={tokens.spacing.xs}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {summary.patterns.map((pattern, patternIndex) => (
                            <Chip
                              key={patternIndex}
                              label={`${pattern.pattern} (${pattern.count})`}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: `${tokens.typography.xs}px`,
                                height: tokens.components.button.sm,
                                fontWeight: ds.typography.fontWeight.medium,
                                borderColor: alpha(ds.colors.neutral[300], 0.5),
                                color: ds.colors.text.secondary,
                                "&:hover": !device.isTouch ? {
                                  borderColor: ds.colors.primary.main,
                                  backgroundColor: alpha(ds.colors.primary.main, 0.04),
                                } : {},
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Divider sx={{ my: tokens.spacing.sm }} />

                      <Grid container spacing={tokens.spacing.sm}>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: `${tokens.typography.sm}px`,
                              mb: tokens.spacing.xxs,
                            }}
                          >
                            Toplam Fire
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: ds.typography.fontWeight.bold,
                              color: ds.colors.warning.main,
                              fontSize: `${tokens.typography.lg}px`,
                            }}
                          >
                            {summary.totalWaste.toLocaleString()}mm
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: `${tokens.typography.sm}px`,
                              mb: tokens.spacing.xxs,
                            }}
                          >
                            Verimlilik
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: ds.typography.fontWeight.bold,
                              color: ds.colors.success.main,
                              fontSize: `${tokens.typography.lg}px`,
                            }}
                          >
                            {summary.efficiency.toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: tokens.spacing.sm }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{ fontSize: `${tokens.typography.sm}px` }}
                        >
                          Ortalama Fire/Kesim
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={ds.typography.fontWeight.semibold}
                          sx={{ fontSize: `${tokens.typography.base}px` }}
                        >
                          {summary.avgWaste.toFixed(0)}mm
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Grid container spacing={tokens.layout.gridGap}>
          {/* Toplam Parça */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: ds.colors.background.paper,
                border: `1px solid ${alpha(ds.colors.primary.main, 0.12)}`,
                borderRadius: `${tokens.borderRadius.lg}px`,
                height: "100%",
                transition: ds.transitions.fast,
                boxShadow: ds.shadows.soft.sm,
                "&:hover": !device.isTouch ? {
                  transform: "translateY(-2px)",
                  boxShadow: ds.shadows.soft.md,
                  borderColor: alpha(ds.colors.primary.main, 0.2),
                } : {},
              }}
            >
              <CardContent sx={{ textAlign: "center", p: tokens.components.card.padding }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: tokens.spacing.sm }}>
                  <AssessmentIcon
                    sx={{
                      fontSize: {
                        xs: tokens.components.icon.lg,
                        md: 40,
                      },
                      color: ds.colors.primary.main,
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.primary.main,
                    mb: tokens.spacing.xs,
                    fontSize: {
                      xs: `${tokens.typography.xl}px`,
                      md: `${tokens.typography.xxl}px`,
                    },
                  }}
                >
                  {summaryData.totalPieces}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: `${tokens.typography.sm}px` }}
                >
                  Toplam Parça
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Profil Adedi */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: ds.colors.background.paper,
                border: `1px solid ${alpha(ds.colors.success.main, 0.12)}`,
                borderRadius: `${tokens.borderRadius.lg}px`,
                height: "100%",
                transition: ds.transitions.fast,
                boxShadow: ds.shadows.soft.sm,
                "&:hover": !device.isTouch ? {
                  transform: "translateY(-2px)",
                  boxShadow: ds.shadows.soft.md,
                  borderColor: alpha(ds.colors.success.main, 0.2),
                } : {},
              }}
            >
              <CardContent sx={{ textAlign: "center", p: tokens.components.card.padding }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: tokens.spacing.sm }}>
                  <InventoryIcon
                    sx={{
                      fontSize: {
                        xs: tokens.components.icon.lg,
                        md: 40,
                      },
                      color: ds.colors.success.main,
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.success.main,
                    mb: tokens.spacing.xs,
                    fontSize: {
                      xs: `${tokens.typography.xl}px`,
                      md: `${tokens.typography.xxl}px`,
                    },
                  }}
                >
                  {summaryData.profileCount}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: `${tokens.typography.sm}px` }}
                >
                  Profil Adedi
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Fire Miktarı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: ds.colors.background.paper,
                border: `1px solid ${alpha(ds.colors.warning.main, 0.12)}`,
                borderRadius: `${tokens.borderRadius.lg}px`,
                height: "100%",
                transition: ds.transitions.fast,
                boxShadow: ds.shadows.soft.sm,
                "&:hover": !device.isTouch ? {
                  transform: "translateY(-2px)",
                  boxShadow: ds.shadows.soft.md,
                  borderColor: alpha(ds.colors.warning.main, 0.2),
                } : {},
              }}
            >
              <CardContent sx={{ textAlign: "center", p: tokens.components.card.padding }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: tokens.spacing.sm }}>
                  <WarningIcon
                    sx={{
                      fontSize: {
                        xs: tokens.components.icon.lg,
                        md: 40,
                      },
                      color: ds.colors.warning.main,
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.warning.main,
                    mb: tokens.spacing.xs,
                    fontSize: {
                      xs: `${tokens.typography.xl}px`,
                      md: `${tokens.typography.xxl}px`,
                    },
                  }}
                >
                  {summaryData.totalWaste.toLocaleString()}mm
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: `${tokens.typography.sm}px` }}
                >
                  Toplam Fire
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Verimlilik Oranı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: ds.colors.background.paper,
                border: `1px solid ${alpha(ds.colors.secondary.main, 0.12)}`,
                borderRadius: `${tokens.borderRadius.lg}px`,
                height: "100%",
                transition: ds.transitions.fast,
                boxShadow: ds.shadows.soft.sm,
                "&:hover": !device.isTouch ? {
                  transform: "translateY(-2px)",
                  boxShadow: ds.shadows.soft.md,
                  borderColor: alpha(ds.colors.secondary.main, 0.2),
                } : {},
              }}
            >
              <CardContent sx={{ textAlign: "center", p: tokens.components.card.padding }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: tokens.spacing.sm }}>
                  <TrendingUpIcon
                    sx={{
                      fontSize: {
                        xs: tokens.components.icon.lg,
                        md: 40,
                      },
                      color: ds.colors.secondary.main,
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.secondary.main,
                    mb: tokens.spacing.xs,
                    fontSize: {
                      xs: `${tokens.typography.xl}px`,
                      md: `${tokens.typography.xxl}px`,
                    },
                  }}
                >
                  {summaryData.efficiency.toFixed(1)}%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: `${tokens.typography.sm}px` }}
                >
                  Verimlilik Oranı
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detaylı Bilgiler */}
          <Grid item xs={12}>
            <Card
              sx={{
                mt: tokens.spacing.md,
                border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
                borderRadius: `${tokens.borderRadius.lg}px`,
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              <CardContent sx={{ p: tokens.components.card.padding }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    mb: tokens.spacing.sm,
                    fontSize: {
                      xs: `${tokens.typography.lg}px`,
                      md: `${tokens.typography.xl}px`,
                    },
                  }}
                >
                  Detaylı Analiz
                </Typography>
                <Grid container spacing={tokens.spacing.md}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.spacing.md,
                        mb: tokens.spacing.sm,
                      }}
                    >
                      <Box
                        sx={{
                          p: tokens.spacing.xs,
                          borderRadius: `${tokens.borderRadius.md}px`,
                          backgroundColor: alpha(ds.colors.primary.main, 0.08),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TimelineIcon
                          sx={{
                            fontSize: tokens.components.icon.md,
                            color: ds.colors.primary.main,
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: `${tokens.typography.sm}px`,
                            mb: tokens.spacing.xxs,
                          }}
                        >
                          Ortalama Fire/Profil
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.lg}px`,
                            color: ds.colors.text.primary,
                          }}
                        >
                          {summaryData.avgWastePerProfile}mm
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.spacing.md,
                        mb: tokens.spacing.sm,
                      }}
                    >
                      <Box
                        sx={{
                          p: tokens.spacing.xs,
                          borderRadius: `${tokens.borderRadius.md}px`,
                          backgroundColor: alpha(ds.colors.success.main, 0.08),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CutIcon
                          sx={{
                            fontSize: tokens.components.icon.md,
                            color: ds.colors.success.main,
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: `${tokens.typography.sm}px`,
                            mb: tokens.spacing.xxs,
                          }}
                        >
                          Ortalama Parça/Profil
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.lg}px`,
                            color: ds.colors.text.primary,
                          }}
                        >
                          {summaryData.avgPiecesPerProfile} adet
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Verimlilik Progress Bar */}
                <Box sx={{ mt: tokens.spacing.lg }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Verimlilik Dağılımı
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={summaryData.efficiency}
                    sx={{
                      height: 10,
                      borderRadius: `${tokens.borderRadius.md}px`,
                      backgroundColor: alpha(ds.colors.neutral[200], 0.5),
                      overflow: "hidden",
                      "& .MuiLinearProgress-bar": {
                        background:
                          summaryData.efficiency >= 95
                            ? `linear-gradient(90deg, ${ds.colors.success.main} 0%, ${ds.colors.success[600]} 100%)`
                            : summaryData.efficiency >= 90
                              ? `linear-gradient(90deg, ${ds.colors.warning.main} 0%, ${ds.colors.warning[600]} 100%)`
                              : `linear-gradient(90deg, ${ds.colors.error.main} 0%, ${ds.colors.error[600]} 100%)`,
                        borderRadius: `${tokens.borderRadius.md}px`,
                        transition: ds.transitions.fast,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: tokens.spacing.xs,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: `${tokens.typography.xs}px`,
                        fontWeight: ds.typography.fontWeight.medium,
                      }}
                    >
                      0%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: `${tokens.typography.xs}px`,
                        fontWeight: ds.typography.fontWeight.bold,
                        color:
                          summaryData.efficiency >= 95
                            ? ds.colors.success.main
                            : summaryData.efficiency >= 90
                              ? ds.colors.warning.main
                              : ds.colors.error.main,
                      }}
                    >
                      {summaryData.efficiency.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: `${tokens.typography.xs}px`,
                        fontWeight: ds.typography.fontWeight.medium,
                      }}
                    >
                      100%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sekme 2: Profil Detayları */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: `${tokens.borderRadius.lg}px`,
            border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
            boxShadow: ds.shadows.soft.sm,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: alpha(ds.colors.primary.main, 0.05),
                  borderBottom: `2px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Profil #
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Stok Uzunluğu
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Kullanılan
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Fire
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Verimlilik
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Parça Sayısı
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.primary.main,
                    py: tokens.spacing.sm,
                  }}
                >
                  Profil Tipi
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profileDetails.map((profile, index) => (
                <TableRow
                  key={profile.id}
                  hover
                  sx={{
                    transition: ds.transitions.fast,
                    "&:hover": !device.isTouch ? {
                      backgroundColor: alpha(ds.colors.primary.main, 0.02),
                    } : {},
                    borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.3)}`,
                  }}
                >
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                      fontSize: `${tokens.typography.sm}px`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: tokens.spacing.xs,
                      }}
                    >
                      <Box
                        sx={{
                          p: tokens.spacing.xxs,
                          borderRadius: `${tokens.borderRadius.sm}px`,
                          backgroundColor: alpha(ds.colors.primary.main, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <EngineeringIcon
                          sx={{
                            fontSize: tokens.components.icon.xs,
                            color: ds.colors.primary.main,
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: ds.typography.fontWeight.semibold,
                          color: ds.colors.text.primary,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                      fontSize: `${tokens.typography.sm}px`,
                      color: ds.colors.text.primary,
                      fontWeight: ds.typography.fontWeight.medium,
                    }}
                  >
                    {profile.stockLength}mm
                  </TableCell>
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                    }}
                  >
                    <Typography
                      sx={{
                        color: ds.colors.success.main,
                        fontWeight: ds.typography.fontWeight.semibold,
                        fontSize: `${tokens.typography.sm}px`,
                      }}
                    >
                      {profile.usedLength}mm
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                    }}
                  >
                    <Typography
                      sx={{
                        color: ds.colors.warning.main,
                        fontWeight: ds.typography.fontWeight.semibold,
                        fontSize: `${tokens.typography.sm}px`,
                      }}
                    >
                      {profile.wasteLength}mm
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                    }}
                  >
                    <Chip
                      label={`${profile.efficiency.toFixed(1)}%`}
                      color={
                        profile.efficiency >= 95
                          ? "success"
                          : profile.efficiency >= 90
                            ? "warning"
                            : "error"
                      }
                      size="small"
                      sx={{
                        fontWeight: ds.typography.fontWeight.semibold,
                        fontSize: `${tokens.typography.xs}px`,
                        height: tokens.components.button.sm,
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: ds.typography.fontWeight.semibold,
                        fontSize: `${tokens.typography.sm}px`,
                        color: ds.colors.text.primary,
                      }}
                    >
                      {profile.segmentCount} adet
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: tokens.spacing.sm,
                    }}
                  >
                    <Chip
                      label={profile.profileType}
                      variant="outlined"
                      size="small"
                      sx={{
                        fontSize: `${tokens.typography.xs}px`,
                        height: tokens.components.button.sm,
                        fontWeight: ds.typography.fontWeight.medium,
                        borderColor: alpha(ds.colors.neutral[300], 0.5),
                        color: ds.colors.text.secondary,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Özet Kartları */}
        <Grid container spacing={tokens.spacing.md} sx={{ mt: tokens.spacing.md }}>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: tokens.spacing.md,
                textAlign: "center",
                bgcolor: alpha(ds.colors.primary.main, 0.05),
                borderRadius: `${tokens.borderRadius.md}px`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: ds.colors.primary.main,
                  fontWeight: ds.typography.fontWeight.bold,
                  fontSize: {
                    xs: `${tokens.typography.lg}px`,
                    md: `${tokens.typography.xl}px`,
                  },
                  mb: tokens.spacing.xxs,
                }}
              >
                {profileDetails
                  .reduce((sum, p) => sum + p.usedLength, 0)
                  .toLocaleString()}
                mm
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: `${tokens.typography.xs}px` }}
              >
                Toplam Kullanılan
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: tokens.spacing.md,
                textAlign: "center",
                bgcolor: alpha(ds.colors.warning.main, 0.05),
                borderRadius: `${tokens.borderRadius.md}px`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: ds.colors.warning.main,
                  fontWeight: ds.typography.fontWeight.bold,
                  fontSize: {
                    xs: `${tokens.typography.lg}px`,
                    md: `${tokens.typography.xl}px`,
                  },
                }}
              >
                {profileDetails
                  .reduce((sum, p) => sum + p.wasteLength, 0)
                  .toLocaleString()}
                mm
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: `${tokens.typography.xs}px` }}
              >
                Toplam Fire
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper
              sx={{
                p: tokens.spacing.md,
                textAlign: "center",
                bgcolor: alpha(ds.colors.success.main, 0.05),
                borderRadius: `${tokens.borderRadius.md}px`,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: ds.colors.success.main,
                  fontWeight: ds.typography.fontWeight.bold,
                  fontSize: {
                    xs: `${tokens.typography.lg}px`,
                    md: `${tokens.typography.xl}px`,
                  },
                  mb: tokens.spacing.xxs,
                }}
              >
                {profileDetails.reduce((sum, p) => sum + p.segmentCount, 0)}{" "}
                adet
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: `${tokens.typography.xs}px` }}
              >
                Toplam Parça
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Sekme 3: Trend Analizi */}
      <TabPanel value={tabValue} index={2}>
        {trendData ? (
          <Stack spacing={tokens.spacing.lg}>
            {/* Trend Özeti */}
            <Grid container spacing={tokens.layout.gridGap}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    textAlign: "center",
                    p: tokens.spacing.md,
                    borderRadius: `${tokens.borderRadius.lg}px`,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.12)}`,
                    boxShadow: ds.shadows.soft.sm,
                    transition: ds.transitions.fast,
                    "&:hover": !device.isTouch ? {
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.md,
                    } : {},
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: tokens.spacing.sm,
                    }}
                  >
                    <AnalyticsIcon
                      sx={{
                        fontSize: tokens.components.icon.xl,
                        color: ds.colors.primary.main,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: ds.typography.fontWeight.bold,
                      color: ds.colors.primary.main,
                      fontSize: `${tokens.typography.xl}px`,
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {trendData.avgEfficiency.toFixed(1)}%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: `${tokens.typography.xs}px` }}
                  >
                    7 Günlük Ort. Verimlilik
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    textAlign: "center",
                    p: tokens.spacing.md,
                    borderRadius: `${tokens.borderRadius.lg}px`,
                    border: `1px solid ${alpha(
                      trendData.improvement >= 0
                        ? ds.colors.success.main
                        : ds.colors.error.main,
                      0.12
                    )}`,
                    boxShadow: ds.shadows.soft.sm,
                    transition: ds.transitions.fast,
                    "&:hover": !device.isTouch ? {
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.md,
                    } : {},
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: tokens.spacing.sm,
                    }}
                  >
                    <ShowChartIcon
                      sx={{
                        fontSize: tokens.components.icon.xl,
                        color:
                          trendData.improvement >= 0
                            ? ds.colors.success.main
                            : ds.colors.error.main,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: ds.typography.fontWeight.bold,
                      color:
                        trendData.improvement >= 0
                          ? ds.colors.success.main
                          : ds.colors.error.main,
                      fontSize: `${tokens.typography.xl}px`,
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {trendData.improvement >= 0 ? "+" : ""}
                    {trendData.improvement.toFixed(1)}%
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: `${tokens.typography.xs}px` }}
                  >
                    Verimlilik Değişimi
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    textAlign: "center",
                    p: tokens.spacing.md,
                    borderRadius: `${tokens.borderRadius.lg}px`,
                    border: `1px solid ${alpha(ds.colors.warning.main, 0.12)}`,
                    boxShadow: ds.shadows.soft.sm,
                    transition: ds.transitions.fast,
                    "&:hover": !device.isTouch ? {
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.md,
                    } : {},
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: tokens.spacing.sm,
                    }}
                  >
                    <WarningIcon
                      sx={{
                        fontSize: tokens.components.icon.xl,
                        color: ds.colors.warning.main,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: ds.typography.fontWeight.bold,
                      color: ds.colors.warning.main,
                      fontSize: `${tokens.typography.xl}px`,
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {Math.round(trendData.totalWaste)}mm
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: `${tokens.typography.xs}px` }}
                  >
                    7 Günlük Toplam Fire
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    textAlign: "center",
                    p: tokens.spacing.md,
                    borderRadius: `${tokens.borderRadius.lg}px`,
                    border: `1px solid ${alpha(ds.colors.info.main, 0.12)}`,
                    boxShadow: ds.shadows.soft.sm,
                    transition: ds.transitions.fast,
                    "&:hover": !device.isTouch ? {
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.md,
                    } : {},
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: tokens.spacing.sm,
                    }}
                  >
                    <AssessmentIcon
                      sx={{
                        fontSize: tokens.components.icon.xl,
                        color: ds.colors.info.main,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: ds.typography.fontWeight.bold,
                      color: ds.colors.info.main,
                      fontSize: `${tokens.typography.xl}px`,
                      mb: tokens.spacing.xs,
                    }}
                  >
                    {trendData.totalPieces}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: `${tokens.typography.xs}px` }}
                  >
                    7 Günlük Toplam Parça
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Günlük Trend Tablosu */}
            <Card
              sx={{
                border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
                borderRadius: `${tokens.borderRadius.lg}px`,
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              <CardContent sx={{ p: tokens.components.card.padding }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: ds.typography.fontWeight.bold,
                    mb: tokens.spacing.md,
                    fontSize: {
                      xs: `${tokens.typography.lg}px`,
                      md: `${tokens.typography.xl}px`,
                    },
                    color: ds.colors.text.primary,
                  }}
                >
                  Son 7 Gün Trend Analizi
                </Typography>
                <TableContainer
                  sx={{
                    borderRadius: `${tokens.borderRadius.md}px`,
                    border: `1px solid ${alpha(ds.colors.neutral[200], 0.3)}`,
                    overflow: "hidden",
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: alpha(ds.colors.primary.main, 0.05),
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.sm}px`,
                            color: ds.colors.primary.main,
                            py: tokens.spacing.sm,
                          }}
                        >
                          Tarih
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.sm}px`,
                            color: ds.colors.primary.main,
                            py: tokens.spacing.sm,
                          }}
                        >
                          Verimlilik
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.sm}px`,
                            color: ds.colors.primary.main,
                            py: tokens.spacing.sm,
                          }}
                        >
                          Fire
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.sm}px`,
                            color: ds.colors.primary.main,
                            py: tokens.spacing.sm,
                          }}
                        >
                          Parça Sayısı
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: ds.typography.fontWeight.bold,
                            fontSize: `${tokens.typography.sm}px`,
                            color: ds.colors.primary.main,
                            py: tokens.spacing.sm,
                          }}
                        >
                          Trend
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trendData.last7Days.map((day, index) => (
                        <TableRow
                          key={day.date}
                          sx={{
                            transition: ds.transitions.fast,
                            "&:hover": !device.isTouch ? {
                              backgroundColor: alpha(ds.colors.primary.main, 0.02),
                            } : {},
                            borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.3)}`,
                          }}
                        >
                          <TableCell
                            sx={{
                              py: tokens.spacing.sm,
                              fontSize: `${tokens.typography.sm}px`,
                              color: ds.colors.text.primary,
                            }}
                          >
                            {new Date(day.date).toLocaleDateString("tr-TR")}
                          </TableCell>
                          <TableCell
                            sx={{
                              py: tokens.spacing.sm,
                            }}
                          >
                            <Chip
                              label={`${day.efficiency.toFixed(1)}%`}
                              color={
                                day.efficiency >= 95
                                  ? "success"
                                  : day.efficiency >= 90
                                    ? "warning"
                                    : "error"
                              }
                              size="small"
                              sx={{
                                fontWeight: ds.typography.fontWeight.semibold,
                                fontSize: `${tokens.typography.xs}px`,
                                height: tokens.components.button.sm,
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              py: tokens.spacing.sm,
                              fontSize: `${tokens.typography.sm}px`,
                              color: ds.colors.text.primary,
                              fontWeight: ds.typography.fontWeight.medium,
                            }}
                          >
                            {day.waste.toFixed(0)}mm
                          </TableCell>
                          <TableCell
                            sx={{
                              py: tokens.spacing.sm,
                              fontSize: `${tokens.typography.sm}px`,
                              color: ds.colors.text.primary,
                              fontWeight: ds.typography.fontWeight.medium,
                            }}
                          >
                            {day.pieces} adet
                          </TableCell>
                          <TableCell
                            sx={{
                              py: tokens.spacing.sm,
                            }}
                          >
                            <TrendingUpIcon
                              sx={{
                                fontSize: tokens.components.icon.sm,
                                color:
                                  day.efficiency >= 95
                                    ? ds.colors.success.main
                                    : ds.colors.warning.main,
                                transform:
                                  day.efficiency >= 95
                                    ? "none"
                                    : "rotate(180deg)",
                                transition: ds.transitions.fast,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Performans Önerileri */}
            <Alert
              severity={
                trendData.avgEfficiency >= 95
                  ? "success"
                  : trendData.avgEfficiency >= 90
                    ? "warning"
                    : "error"
              }
              sx={{
                borderRadius: `${tokens.borderRadius.lg}px`,
                border: `1px solid ${alpha(
                  trendData.avgEfficiency >= 95
                    ? ds.colors.success.main
                    : trendData.avgEfficiency >= 90
                      ? ds.colors.warning.main
                      : ds.colors.error.main,
                  0.2
                )}`,
              }}
            >
              <AlertTitle
                sx={{
                  fontWeight: ds.typography.fontWeight.bold,
                  fontSize: `${tokens.typography.base}px`,
                  mb: tokens.spacing.xs,
                }}
              >
                {trendData.avgEfficiency >= 95
                  ? "Mükemmel Performans!"
                  : trendData.avgEfficiency >= 90
                    ? "İyi Performans"
                    : "İyileştirme Gerekli"}
              </AlertTitle>
              <Typography
                sx={{
                  fontSize: `${tokens.typography.sm}px`,
                  color: ds.colors.text.secondary,
                }}
              >
                {trendData.avgEfficiency >= 95
                  ? "Verimlilik oranınız çok yüksek. Bu seviyeyi koruyun!"
                  : trendData.avgEfficiency >= 90
                    ? "Verimlilik oranınız iyi seviyede. %95 hedefine odaklanın."
                    : "Verimlilik oranınızı artırmak için profil optimizasyonu önerilir."}
              </Typography>
            </Alert>
          </Stack>
        ) : (
          <Alert
            severity="info"
            sx={{
              borderRadius: `${tokens.borderRadius.lg}px`,
              border: `1px solid ${alpha(ds.colors.info.main, 0.2)}`,
            }}
          >
            <AlertTitle
              sx={{
                fontWeight: ds.typography.fontWeight.bold,
                fontSize: `${tokens.typography.base}px`,
                mb: tokens.spacing.xs,
              }}
            >
              Trend Verisi Yok
            </AlertTitle>
            <Typography
              sx={{
                fontSize: `${tokens.typography.sm}px`,
                color: ds.colors.text.secondary,
              }}
            >
              Bu iş emri için henüz trend verisi bulunmuyor.
            </Typography>
          </Alert>
        )}
      </TabPanel>

      <DialogActions
        sx={{
          px: tokens.spacing.xl * 2,
          py: tokens.spacing.sm,
          borderTop: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.secondary.main} 100%)`,
            color: "white",
            fontWeight: ds.typography.fontWeight.semibold,
            px: tokens.spacing.xl,
            py: tokens.spacing.sm,
            borderRadius: `${tokens.borderRadius.md}px`,
            minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
            fontSize: {
              xs: `${tokens.typography.sm}px`,
              md: `${tokens.typography.base}px`,
            },
            boxShadow: ds.shadows.soft.md,
            "&:hover": !device.isTouch ? {
              background: `linear-gradient(135deg, ${ds.colors.primary[700]} 0%, ${ds.colors.secondary[700]} 100%)`,
              transform: "translateY(-2px)",
              boxShadow: ds.shadows.soft.lg,
            } : {},
            transition: ds.transitions.fast,
          }}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};
