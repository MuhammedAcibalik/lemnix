/**
 * @fileoverview Product Categories Analysis Component
 * @module ProductCategoriesAnalysis
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Stack,
  Avatar,
  Divider,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Star as StarIcon,
} from "@mui/icons-material";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  BarElement,
);

// Premium Chart.js Themes - Ana Sayfa Renk Paletine Tam Uyum
const premiumTheme = {
  colors: {
    primary: "#10b981", // Ana sayfa success emerald
    secondary: "#3b82f6", // Ana sayfa info blue
    success: "#10b981", // Ana sayfa success emerald
    warning: "#f59e0b", // Ana sayfa warning amber
    error: "#ef4444", // Ana sayfa error red
    info: "#06b6d4", // Ana sayfa cyan
    purple: "#8b5cf6", // Ana sayfa purple
  },
  gradients: {
    primary: ["#10b981", "#059669"], // Emerald gradient
    secondary: ["#3b82f6", "#2563eb"], // Blue gradient
    success: ["#10b981", "#059669"], // Emerald gradient
    warning: ["#f59e0b", "#d97706"], // Amber gradient
    info: ["#06b6d4", "#0891b2"], // Cyan gradient
    error: ["#ef4444", "#dc2626"], // Red gradient
    purple: ["#8b5cf6", "#7c3aed"], // Purple gradient
  },
};

// Premium Chart Options
const getPremiumChartOptions = (
  title: string,
  colors: string[] = premiumTheme.gradients.primary,
) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
    },
  },
  animation: {
    duration: 2000,
    easing: "easeInOutQuart" as const,
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
});

const getPremiumDoughnutOptions = (title: string) => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
    },
  },
  animation: {
    duration: 2000,
    easing: "easeInOutQuart" as const,
  },
});

interface ProductCategoriesAnalysisProps {
  data: {
    totalCategories: number;
    categories: Array<{
      name: string;
      itemCount: number;
      totalQuantity: number;
      percentage: string;
      listCount?: number;
    }>;
    averageItemsPerCategory: number;
    mostActiveCategory: string;
    categoryPerformance: Array<{
      name: string;
      itemCount: number;
      totalQuantity: number;
      percentage: string;
      listCount?: number;
    }>;
  };
}

export const ProductCategoriesAnalysis: React.FC<
  ProductCategoriesAnalysisProps
> = ({ data }) => {
  // Chart data preparation
  const categoryDoughnutData = {
    labels: data?.categories?.map((item) => item.name) || [],
    datasets: [
      {
        data: data?.categories?.map((item) => item.itemCount) || [],
        backgroundColor: [
          premiumTheme.colors.primary,
          premiumTheme.colors.secondary,
          premiumTheme.colors.success,
          premiumTheme.colors.warning,
          premiumTheme.colors.error,
          premiumTheme.colors.info,
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const performanceDoughnutData = {
    labels: data?.categoryPerformance?.map((item) => item.name) || [],
    datasets: [
      {
        data: data?.categoryPerformance?.map((item) => item.itemCount) || [],
        backgroundColor: [
          premiumTheme.colors.info,
          premiumTheme.colors.warning,
          premiumTheme.colors.success,
          premiumTheme.colors.error,
          premiumTheme.colors.purple,
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Ürün Kategorileri Analizi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kategori performansları, trend analizleri ve detaylı istatistikler
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {data?.totalCategories || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Kategori
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {data?.averageItemsPerCategory || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ort. İş Emri/Kategori
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {(data?.categories || []).reduce(
                      (sum, cat) => sum + cat.totalQuantity,
                      0,
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Miktar
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {data?.mostActiveCategory || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    En Aktif Kategori
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Category Performance Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#1e293b",
                }}
              >
                📊 Kategori Performansı
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    position: "relative",
                  }}
                >
                  <Doughnut
                    data={categoryDoughnutData}
                    options={getPremiumDoughnutOptions("Category Performance")}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 3 }}>
                  {(data?.categories || []).map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                        p: 1,
                        borderRadius: "8px",
                        background: "rgba(248, 250, 252, 0.8)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor:
                              categoryDoughnutData.datasets[0].backgroundColor[
                                index
                              ],
                            mr: 1,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: "#64748b",
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#1e293b",
                        }}
                      >
                        {item.itemCount} adet
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Trends Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  color: "#1e293b",
                }}
              >
                📈 Kategori Trendleri
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    position: "relative",
                  }}
                >
                  <Doughnut
                    data={performanceDoughnutData}
                    options={getPremiumDoughnutOptions("Category Trends")}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 3 }}>
                  {(data?.categoryPerformance || []).map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                        p: 1,
                        borderRadius: "8px",
                        background: "rgba(248, 250, 252, 0.8)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor:
                              performanceDoughnutData.datasets[0]
                                .backgroundColor[index],
                            mr: 1,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: "#64748b",
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#1e293b",
                        }}
                      >
                        {item.itemCount} adet
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Performance Table */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Kategori Performans Detayı
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Kategori
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        İş Emri Sayısı
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Toplam Miktar
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Kullanım Oranı
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Performans
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.categoryPerformance || []).map(
                      (category, index) => (
                        <TableRow key={category.name} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  bgcolor: premiumTheme.colors.primary,
                                  mr: 2,
                                }}
                              />
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: "medium" }}
                              >
                                {category.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={category.itemCount}
                              size="small"
                              sx={{
                                bgcolor: premiumTheme.colors.primary,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "medium" }}
                            >
                              {category.totalQuantity.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: "100%", maxWidth: 100 }}>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(category.percentage)}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: "rgba(0,0,0,0.1)",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: premiumTheme.colors.primary,
                                    borderRadius: 4,
                                  },
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mt: 0.5,
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                %{category.percentage}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                parseFloat(category.percentage) > 30
                                  ? "Yüksek"
                                  : parseFloat(category.percentage) > 15
                                    ? "Orta"
                                    : "Düşük"
                              }
                              size="small"
                              color={
                                parseFloat(category.percentage) > 30
                                  ? "success"
                                  : parseFloat(category.percentage) > 15
                                    ? "warning"
                                    : "default"
                              }
                              variant="outlined"
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

      {/* Category Distribution */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Kategori Dağılımı
              </Typography>
              <Stack spacing={2}>
                {(data?.categories || []).map((category, index) => (
                  <Box key={category.name}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                        {category.name}
                      </Typography>
                      <Chip
                        label={`${category.itemCount} adet`}
                        size="small"
                        sx={{
                          bgcolor: premiumTheme.colors.primary,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(category.percentage)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "rgba(0,0,0,0.1)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: premiumTheme.colors.primary,
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      %{category.percentage} •{" "}
                      {category.totalQuantity.toLocaleString()} toplam miktar
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Öne Çıkan Kategoriler
              </Typography>
              <Stack spacing={2}>
                {(data?.categories || []).slice(0, 5).map((category, index) => (
                  <Card
                    key={category.name}
                    sx={{
                      bgcolor: index === 0 ? "primary.50" : "grey.50",
                      border: index === 0 ? "2px solid" : "1px solid",
                      borderColor: index === 0 ? "primary.main" : "grey.300",
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: "bold",
                              color:
                                index === 0 ? "primary.main" : "text.primary",
                            }}
                          >
                            #{index + 1} {category.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {category.itemCount} iş emri •{" "}
                            {category.totalQuantity.toLocaleString()} miktar
                          </Typography>
                        </Box>
                        <Chip
                          label={`%${category.percentage}`}
                          color={index === 0 ? "primary" : "default"}
                          variant={index === 0 ? "filled" : "outlined"}
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductCategoriesAnalysis;
