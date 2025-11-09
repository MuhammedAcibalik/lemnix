/**
 * @fileoverview Color & Size Analysis Component
 * @module ColorSizeAnalysis
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
  Palette as PaletteIcon,
  Straighten as StraightenIcon,
  TrendingUp as TrendingUpIcon,
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
    orange: "#f97316", // Orange color
  },
  gradients: {
    primary: ["#10b981", "#059669"], // Emerald gradient
    secondary: ["#3b82f6", "#2563eb"], // Blue gradient
    success: ["#10b981", "#059669"], // Emerald gradient
    warning: ["#f59e0b", "#d97706"], // Amber gradient
    info: ["#06b6d4", "#0891b2"], // Cyan gradient
    error: ["#ef4444", "#dc2626"], // Red gradient
    purple: ["#8b5cf6", "#7c3aed"], // Purple gradient
    orange: ["#f97316", "#ea580c"], // Orange gradient
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

interface ColorSizeAnalysisProps {
  data: {
    colorAnalysis: Array<{
      color: string;
      count: number;
      percentage: string;
    }>;
    sizeAnalysis: Array<{
      size: string;
      count: number;
      percentage: string;
    }>;
    colorSizeCombinations: Array<{
      combination: string;
      count: number;
      percentage: string;
    }>;
    mostPopularColor: string;
    mostPopularSize: string;
    totalCombinations: number;
  };
}

export const ColorSizeAnalysis: React.FC<ColorSizeAnalysisProps> = ({
  data,
}) => {
  // Chart data preparation
  const colorDoughnutData = {
    labels: data?.colorAnalysis?.map((item) => item.color) || [],
    datasets: [
      {
        data: data?.colorAnalysis?.map((item) => item.count) || [],
        backgroundColor: [
          premiumTheme.colors.primary,
          premiumTheme.colors.secondary,
          premiumTheme.colors.success,
          premiumTheme.colors.warning,
          premiumTheme.colors.error,
          premiumTheme.colors.info,
          premiumTheme.colors.purple,
          premiumTheme.colors.orange,
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const sizeDoughnutData = {
    labels: data?.sizeAnalysis?.map((item) => item.size) || [],
    datasets: [
      {
        data: data?.sizeAnalysis?.map((item) => item.count) || [],
        backgroundColor: [
          premiumTheme.colors.info,
          premiumTheme.colors.warning,
          premiumTheme.colors.success,
          premiumTheme.colors.error,
          premiumTheme.colors.purple,
          premiumTheme.colors.orange,
          premiumTheme.colors.primary,
          premiumTheme.colors.secondary,
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const combinationDoughnutData = {
    labels: data?.colorSizeCombinations?.map((item) => item.combination) || [],
    datasets: [
      {
        data: data?.colorSizeCombinations?.map((item) => item.count) || [],
        backgroundColor: [
          premiumTheme.colors.primary,
          premiumTheme.colors.secondary,
          premiumTheme.colors.success,
          premiumTheme.colors.warning,
          premiumTheme.colors.error,
          premiumTheme.colors.info,
          premiumTheme.colors.purple,
          premiumTheme.colors.orange,
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
          Renk & Ebat Analizi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          En popüler renk ve ebat seçimleri, kullanım oranları ve tercih
          analizleri
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                  <PaletteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {data?.mostPopularColor || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    En Popüler Renk
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
                  <StraightenIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {data?.mostPopularSize || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    En Popüler Ebat
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {data?.totalCombinations || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Kombinasyon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
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
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {(data?.colorAnalysis?.length || 0) +
                      (data?.sizeAnalysis?.length || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Farklı Seçenek
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Color Analysis Chart */}
        <Grid item xs={12} md={4}>
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
                🎨 Renk Dağılımı
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
                    width: 100,
                    height: 100,
                    position: "relative",
                  }}
                >
                  <Doughnut
                    data={colorDoughnutData}
                    options={getPremiumDoughnutOptions("Color Distribution")}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 2 }}>
                  {(data?.colorAnalysis || [])
                    .slice(0, 3)
                    .map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          p: 0.5,
                          borderRadius: "8px",
                          background: "rgba(248, 250, 252, 0.8)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor:
                                colorDoughnutData.datasets[0].backgroundColor[
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
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.color}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            fontSize: "0.75rem",
                          }}
                        >
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Size Analysis Chart */}
        <Grid item xs={12} md={4}>
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
                📏 Ebat Dağılımı
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
                    width: 100,
                    height: 100,
                    position: "relative",
                  }}
                >
                  <Doughnut
                    data={sizeDoughnutData}
                    options={getPremiumDoughnutOptions("Size Distribution")}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 2 }}>
                  {(data?.sizeAnalysis || []).slice(0, 3).map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                        p: 0.5,
                        borderRadius: "8px",
                        background: "rgba(248, 250, 252, 0.8)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor:
                              sizeDoughnutData.datasets[0].backgroundColor[
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
                            fontSize: "0.75rem",
                          }}
                        >
                          {item.size}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "#1e293b",
                          fontSize: "0.75rem",
                        }}
                      >
                        {item.count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Combination Analysis Chart */}
        <Grid item xs={12} md={4}>
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
                🔗 Kombinasyonlar
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
                    width: 100,
                    height: 100,
                    position: "relative",
                  }}
                >
                  <Doughnut
                    data={combinationDoughnutData}
                    options={getPremiumDoughnutOptions(
                      "Color-Size Combinations",
                    )}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 2 }}>
                  {(data?.colorSizeCombinations || [])
                    .slice(0, 3)
                    .map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                          p: 0.5,
                          borderRadius: "8px",
                          background: "rgba(248, 250, 252, 0.8)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor:
                                combinationDoughnutData.datasets[0]
                                  .backgroundColor[index],
                              mr: 1,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: "#64748b",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.combination}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                            fontSize: "0.75rem",
                          }}
                        >
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Combination Analysis */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
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
                📊 Kombinasyon Detayları
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
                    data={combinationDoughnutData}
                    options={getPremiumDoughnutOptions("Combination Details")}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 3 }}>
                  {(data?.colorSizeCombinations || [])
                    .slice(0, 5)
                    .map((item, index) => (
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
                                combinationDoughnutData.datasets[0]
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
                            {item.combination}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: "#1e293b",
                          }}
                        >
                          {item.count} ({item.percentage}%)
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
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
                ⭐ En Popüler Kombinasyonlar
              </Typography>
              <Stack spacing={2}>
                {(data?.colorSizeCombinations || [])
                  .slice(0, 8)
                  .map((combo, index) => (
                    <Box key={combo.combination}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium", fontSize: "0.875rem" }}
                        >
                          {combo.combination}
                        </Typography>
                        <Chip
                          label={`${combo.count}`}
                          size="small"
                          sx={{
                            bgcolor: premiumTheme.colors.primary,
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(combo.percentage)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "rgba(0,0,0,0.1)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: premiumTheme.colors.primary,
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        %{combo.percentage}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tables */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Color Analysis Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Renk Analizi Detayı
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Renk</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Kullanım
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Yüzde
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Trend
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.colorAnalysis || []).map((color, index) => (
                      <TableRow key={color.color} hover>
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
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {color.color}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={color.count}
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
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            %{color.percentage}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              parseFloat(color.percentage) > 20
                                ? "Yüksek"
                                : parseFloat(color.percentage) > 10
                                  ? "Orta"
                                  : "Düşük"
                            }
                            size="small"
                            color={
                              parseFloat(color.percentage) > 20
                                ? "success"
                                : parseFloat(color.percentage) > 10
                                  ? "warning"
                                  : "default"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Size Analysis Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Ebat Analizi Detayı
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Ebat</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Kullanım
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Yüzde
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Trend
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.sizeAnalysis || []).map((size, index) => (
                      <TableRow key={size.size} hover>
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
                              variant="body2"
                              sx={{ fontWeight: "medium" }}
                            >
                              {size.size}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={size.count}
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
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            %{size.percentage}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              parseFloat(size.percentage) > 20
                                ? "Yüksek"
                                : parseFloat(size.percentage) > 10
                                  ? "Orta"
                                  : "Düşük"
                            }
                            size="small"
                            color={
                              parseFloat(size.percentage) > 20
                                ? "success"
                                : parseFloat(size.percentage) > 10
                                  ? "warning"
                                  : "default"
                            }
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ColorSizeAnalysis;
