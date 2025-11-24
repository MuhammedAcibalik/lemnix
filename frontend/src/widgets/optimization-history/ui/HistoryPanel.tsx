/**
 * @fileoverview Optimization History Panel Widget
 * @module widgets/optimization-history
 * @version 1.0.0
 *
 * ✅ P0-4: Optimization history timeline
 * ✅ BACKEND: GET /enterprise/history
 * ✅ FSD: Widget layer (composition of features + entities)
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Pagination,
  Tooltip,
  alpha,
  Divider,
} from "@mui/material";
import {
  History as HistoryIcon,
  PlayArrow as LoadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  CalendarToday as DateIcon,
  TrendingUp as EfficiencyIcon,
  Speed as TimeIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import {
  useOptimizationHistory,
  optimizationKeys,
} from "@/entities/optimization/api/optimizationQueries";
import type { AlgorithmType } from "@/entities/optimization/model/types";
import { FadeIn, ScaleIn } from "@/shared";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface HistoryPanelProps {
  readonly onLoadResult?: (resultId: string) => void;
  readonly maxHeight?: number;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  onLoadResult,
  maxHeight = 600,
}) => {
  const ds = useDesignSystem();
  const [page, setPage] = useState(1);
  const [algorithmFilter, setAlgorithmFilter] = useState<AlgorithmType | "all">(
    "all",
  );
  const pageSize = 10;

  const queryParams = {
    page,
    pageSize,
    ...(algorithmFilter !== "all" ? { algorithm: algorithmFilter } : {}),
  };
  const {
    data: history,
    isLoading,
    refetch,
  } = useOptimizationHistory(queryParams, {
    staleTime: 1 * 60 * 1000, // 1 minute
  } as Parameters<typeof useOptimizationHistory>[1]);

  const handleFilterChange = (algorithm: AlgorithmType | "all") => {
    setAlgorithmFilter(algorithm);
    setPage(1); // Reset to first page
  };

  const getAlgorithmColor = (algorithm: string) => {
    switch (algorithm) {
      case "ffd":
        return ds.colors.primary.main;
      case "bfd":
        return ds.colors.accent.main;
      case "genetic":
        return ds.colors.success.main;
      case "pooling":
        return ds.colors.warning.main;
      default:
        return ds.colors.neutral[500];
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return ds.colors.success.main;
    if (efficiency >= 80) return ds.colors.warning.main;
    return ds.colors.error.main;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: `${ds.borderRadius.lg}px`,
        border: `1px solid ${ds.colors.neutral[300]}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: ds.spacing["3"],
          background: alpha(ds.colors.primary.main, 0.05),
          borderBottom: `1px solid ${ds.colors.neutral[200]}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={ds.spacing["2"]}>
            <HistoryIcon
              sx={{
                color: ds.colors.primary.main,
                fontSize: ds.componentSizes.icon.large,
              }}
            />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                Optimizasyon Geçmişi
              </Typography>
              <Typography
                sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
              >
                {history?.length || 0} kayıt
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Yenile" arrow>
            <IconButton
              onClick={() => refetch()}
              size="small"
              sx={{
                color: ds.colors.primary.main,
                "&:hover": {
                  background: alpha(ds.colors.primary.main, 0.1),
                },
              }}
            >
              <RefreshIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Filter Bar */}
      <Box
        sx={{
          p: ds.spacing["2"],
          borderBottom: `1px solid ${ds.colors.neutral[200]}`,
        }}
      >
        <Stack direction="row" spacing={ds.spacing["2"]} alignItems="center">
          <FilterIcon sx={{ fontSize: 16, color: ds.colors.text.secondary }} />
          <Stack direction="row" spacing={ds.spacing["1"]} sx={{ flex: 1 }}>
            <Chip
              label="Tümü"
              size="small"
              onClick={() => handleFilterChange("all")}
              sx={{
                background:
                  algorithmFilter === "all"
                    ? ds.gradients.primary
                    : "transparent",
                color:
                  algorithmFilter === "all"
                    ? "white"
                    : ds.colors.text.secondary,
                border: `1px solid ${ds.colors.neutral[300]}`,
                fontWeight: algorithmFilter === "all" ? 600 : 400,
                cursor: "pointer",
              }}
            />
            {(["ffd", "bfd", "genetic", "pooling"] as AlgorithmType[]).map(
              (alg) => (
                <Chip
                  key={alg}
                  label={alg.toUpperCase()}
                  size="small"
                  onClick={() => handleFilterChange(alg)}
                  sx={{
                    background:
                      algorithmFilter === alg
                        ? getAlgorithmColor(alg)
                        : "transparent",
                    color:
                      algorithmFilter === alg
                        ? "white"
                        : ds.colors.text.secondary,
                    border: `1px solid ${ds.colors.neutral[300]}`,
                    fontWeight: algorithmFilter === alg ? 600 : 400,
                    cursor: "pointer",
                  }}
                />
              ),
            )}
          </Stack>
        </Stack>
      </Box>

      {/* History List */}
      <Box sx={{ flex: 1, overflowY: "auto", maxHeight, p: ds.spacing["2"] }}>
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: ds.spacing["6"] }}>
            <CircularProgress size={32} />
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: ds.colors.text.secondary,
                mt: ds.spacing["2"],
              }}
            >
              Geçmiş yükleniyor...
            </Typography>
          </Box>
        ) : !history || history.length === 0 ? (
          <Box sx={{ textAlign: "center", py: ds.spacing["6"] }}>
            <HistoryIcon
              sx={{
                fontSize: 48,
                color: ds.colors.neutral[400],
                mb: ds.spacing["2"],
              }}
            />
            <Typography
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: ds.colors.text.primary,
              }}
            >
              Henüz optimizasyon geçmişi yok
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: ds.colors.text.secondary,
                mt: ds.spacing["1"],
              }}
            >
              İlk optimizasyonunuzu yapın ve buradan takip edin
            </Typography>
          </Box>
        ) : (
          <Stack spacing={ds.spacing["2"]}>
            {history.map((entry, index) => {
              const result = entry.result;
              const efficiencyColor = getEfficiencyColor(
                result.totalEfficiency,
              );

              return (
                <ScaleIn key={entry.id} delay={index * 50}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: `${ds.borderRadius.md}px`,
                      border: `1px solid ${ds.colors.neutral[300]}`,
                      transition: ds.transitions.base,
                      "&:hover": {
                        borderColor: ds.colors.primary.main,
                        boxShadow: ds.shadows.soft.md,
                        transform: "translateY(-2px)",
                      },
                      cursor: "pointer",
                    }}
                    onClick={() => onLoadResult?.(entry.id)}
                  >
                    <CardContent
                      sx={{
                        p: ds.spacing["2"],
                        "&:last-child": { pb: ds.spacing["2"] },
                      }}
                    >
                      <Stack spacing={ds.spacing["2"]}>
                        {/* Header */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Chip
                            label={result.algorithm.toUpperCase()}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              background: getAlgorithmColor(result.algorithm),
                              color: "white",
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.6875rem",
                              color: ds.colors.text.secondary,
                            }}
                          >
                            {formatDistanceToNow(new Date(entry.createdAt), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </Typography>
                        </Stack>

                        {/* Metrics */}
                        <Stack direction="row" spacing={ds.spacing["3"]}>
                          <Box sx={{ flex: 1 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={ds.spacing["1"]}
                            >
                              <EfficiencyIcon
                                sx={{ fontSize: 14, color: efficiencyColor }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: efficiencyColor,
                                }}
                              >
                                %{result.totalEfficiency.toFixed(1)}
                              </Typography>
                            </Stack>
                            <Typography
                              sx={{
                                fontSize: "0.625rem",
                                color: ds.colors.text.secondary,
                              }}
                            >
                              Verimlilik
                            </Typography>
                          </Box>

                          <Divider orientation="vertical" flexItem />

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                            >
                              {result.totalStocks}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.625rem",
                                color: ds.colors.text.secondary,
                              }}
                            >
                              Stok
                            </Typography>
                          </Box>

                          <Divider orientation="vertical" flexItem />

                          <Box sx={{ flex: 1 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={ds.spacing["1"]}
                            >
                              <TimeIcon
                                sx={{
                                  fontSize: 14,
                                  color: ds.colors.accent.main,
                                }}
                              />
                              <Typography
                                sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                              >
                                {result.executionTime}ms
                              </Typography>
                            </Stack>
                            <Typography
                              sx={{
                                fontSize: "0.625rem",
                                color: ds.colors.text.secondary,
                              }}
                            >
                              Süre
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Load Button */}
                        <Button
                          startIcon={<LoadIcon />}
                          size="small"
                          fullWidth
                          variant="outlined"
                          sx={{
                            textTransform: "none",
                            fontSize: "0.75rem",
                            py: 0.5,
                            borderRadius: `${ds.borderRadius.sm}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadResult?.(entry.id);
                          }}
                        >
                          Bu Sonucu Yükle
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </ScaleIn>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Pagination */}
      {history && history.length > 0 && (
        <Box
          sx={{
            p: ds.spacing["2"],
            borderTop: `1px solid ${ds.colors.neutral[200]}`,
          }}
        >
          <Pagination
            count={Math.ceil((history.length || 0) / pageSize)}
            page={page}
            onChange={(_, value) => setPage(value)}
            size="small"
            sx={{
              display: "flex",
              justifyContent: "center",
              "& .MuiPaginationItem-root": {
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>
      )}
    </Card>
  );
};
