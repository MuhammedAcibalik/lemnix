/**
 * @fileoverview Production Plan Statistics Page - Analytics Dashboard Tab
 * @module pages/production-plan-statistics-page
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import {
  useProductionPlanStatistics,
  type ProductionPlanFilters,
  type BackorderItem,
} from "@/entities/production-plan";
import { ProductionPlanFilters as ProductionPlanFiltersComponent } from "@/widgets/production-plan-manager/ui/ProductionPlanFilters";

export const ProductionPlanStatisticsPage: React.FC = () => {
  const theme = useTheme();
  const ds = useDesignSystem();

  const [filters, setFilters] = useState<ProductionPlanFilters>({
    status: "active",
    page: 1,
    limit: 50,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Query
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
  } = useProductionPlanStatistics(filters);

  const handleFiltersChange = (newFilters: ProductionPlanFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          p: ds.spacing["4"],
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          İstatistikler yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: ds.spacing["4"],
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: ds.spacing["2"],
        }}
      >
        <Typography variant="h6" color="error">
          Hata: {error.message}
        </Typography>
        <Button variant="outlined" onClick={() => refetch()}>
          Tekrar Dene
        </Button>
      </Box>
    );
  }

  if (!statistics) {
    return (
      <Box
        sx={{
          p: ds.spacing["4"],
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          İstatistik verisi bulunamadı
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[50],
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: ds.spacing["3"],
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: ds.spacing["2"],
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: "1.25rem",
              background: ds.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: ds.spacing["1"],
            }}
          >
            İstatistikler & Analiz
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[600],
              fontSize: "0.875rem",
            }}
          >
            Üretim planı performans metrikleri ve trend analizi
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: ds.spacing["2"] }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              px: ds.spacing["3"],
              py: ds.spacing["1"],
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: ds.borderRadius["sm"],
            }}
          >
            {showFilters ? "Filtreleri Gizle" : "Filtreler"}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
            sx={{
              px: ds.spacing["3"],
              py: ds.spacing["1"],
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: ds.borderRadius["sm"],
            }}
          >
            Yenile
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: ds.spacing["3"] }}>
          <Card variant="outlined">
            <ProductionPlanFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Card>
        </Box>
      )}

      {/* Overview Cards */}
      <Grid container spacing={ds.spacing["3"]} sx={{ mb: ds.spacing["4"] }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: ds.spacing["2"],
                }}
              >
                <AssignmentIcon
                  sx={{
                    color: theme.palette.primary.main,
                    mr: ds.spacing["1"],
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Toplam Plan
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                {statistics.overview.totalPlans}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aktif üretim planı
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: ds.spacing["2"],
                }}
              >
                <BarChartIcon
                  sx={{ color: theme.palette.info.main, mr: ds.spacing["1"] }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Toplam İş
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.info.main }}
              >
                {statistics.overview.totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Planlanan iş sayısı
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: ds.spacing["2"],
                }}
              >
                <CheckCircleIcon
                  sx={{
                    color: theme.palette.success.main,
                    mr: ds.spacing["1"],
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tamamlanan
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.success.main }}
              >
                {statistics.overview.completedItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                %{statistics.overview.completionRate.toFixed(1)} tamamlanma
                oranı
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: ds.spacing["2"],
                }}
              >
                <WarningIcon
                  sx={{ color: theme.palette.error.main, mr: ds.spacing["1"] }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Backorder
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: theme.palette.error.main }}
              >
                {statistics.overview.backorderCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gecikmiş iş sayısı
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Department Distribution */}
      <Grid container spacing={ds.spacing["3"]} sx={{ mb: ds.spacing["4"] }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: ds.spacing["3"] }}
              >
                Bölüm Dağılımı
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Bölüm</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Toplam
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Tamamlanan
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Oran
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.departmentDistribution.map(
                      (
                        dept: {
                          department: string;
                          total: number;
                          completed: number;
                        },
                        index: number,
                      ) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {dept.department}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {dept.total}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main">
                              {dept.completed}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`%${dept.total > 0 ? ((dept.completed / dept.total) * 100).toFixed(1) : "0"}`}
                              size="small"
                              color={
                                dept.completed / dept.total >= 0.8
                                  ? "success"
                                  : dept.completed / dept.total >= 0.5
                                    ? "warning"
                                    : "error"
                              }
                              sx={{ fontSize: "0.75rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: ds.spacing["3"] }}
              >
                Öncelik Dağılımı
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Öncelik</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Sayı
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Yüzde
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.priorityDistribution.map(
                      (
                        priority: { priority: string; count: number },
                        index: number,
                      ) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip
                              label={priority.priority}
                              size="small"
                              color={
                                priority.priority === "Yüksek"
                                  ? "error"
                                  : priority.priority === "Orta/Düşük"
                                    ? "warning"
                                    : "success"
                              }
                              sx={{ fontSize: "0.75rem" }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {priority.count}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              %
                              {statistics.overview.totalItems > 0
                                ? (
                                    (priority.count /
                                      statistics.overview.totalItems) *
                                    100
                                  ).toFixed(1)
                                : "0"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Trends */}
      <Grid container spacing={ds.spacing["3"]} sx={{ mb: ds.spacing["4"] }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: ds.spacing["3"] }}
              >
                Haftalık Trendler (Son 12 Hafta)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Hafta</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        İş Sayısı
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Tamamlanma Oranı
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Durum
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {statistics.weeklyTrends.slice(-8).map(
                      (
                        week: {
                          week: number;
                          year: number;
                          itemCount: number;
                          completionRate: number;
                        },
                        index: number,
                      ) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {week.year} - Hafta {week.week}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {week.itemCount}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`%${week.completionRate.toFixed(1)}`}
                              size="small"
                              color={
                                week.completionRate >= 80
                                  ? "success"
                                  : week.completionRate >= 50
                                    ? "warning"
                                    : "error"
                              }
                              sx={{ fontSize: "0.75rem" }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={
                                week.completionRate >= 80
                                  ? "İyi"
                                  : week.completionRate >= 50
                                    ? "Orta"
                                    : "Kötü"
                              }
                              size="small"
                              variant="outlined"
                              color={
                                week.completionRate >= 80
                                  ? "success"
                                  : week.completionRate >= 50
                                    ? "warning"
                                    : "error"
                              }
                              sx={{ fontSize: "0.75rem" }}
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Backorders */}
      {statistics.topBackorders.length > 0 && (
        <Grid container spacing={ds.spacing["3"]}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: ds.spacing["3"] }}
                >
                  En Kritik Backorder'lar
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
                          İş Tanımı
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Sipariş No
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          Gecikme
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          Risk
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {statistics.topBackorders.map(
                        (item: BackorderItem, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {item.ad}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "monospace" }}
                              >
                                {item.siparis}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${item.daysOverdue} gün`}
                                size="small"
                                color={
                                  item.riskLevel === "high"
                                    ? "error"
                                    : item.riskLevel === "medium"
                                      ? "warning"
                                      : "info"
                                }
                                sx={{ fontSize: "0.75rem" }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={
                                  item.riskLevel === "high"
                                    ? "Yüksek"
                                    : item.riskLevel === "medium"
                                      ? "Orta"
                                      : "Düşük"
                                }
                                size="small"
                                variant="outlined"
                                color={
                                  item.riskLevel === "high"
                                    ? "error"
                                    : item.riskLevel === "medium"
                                      ? "warning"
                                      : "info"
                                }
                                sx={{ fontSize: "0.75rem" }}
                              />
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ProductionPlanStatisticsPage;
