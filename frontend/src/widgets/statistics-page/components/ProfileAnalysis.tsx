/**
 * @fileoverview Profile Analysis Component
 * @module ProfileAnalysis
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
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Palette as PaletteIcon,
  Straighten as StraightenIcon,
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

interface ProfileAnalysisProps {
  data: {
    totalProfiles: number;
    profileTypes: Array<{
      name: string;
      count: number;
      percentage: string;
    }>;
    sizeDistribution: Array<{
      size: string;
      count: number;
      percentage: string;
    }>;
    averageQuantityPerProfile: number;
    mostUsedProfileType: string;
    mostUsedSize: string;
  };
}

export const ProfileAnalysis: React.FC<ProfileAnalysisProps> = ({ data }) => {
  // Chart data preparation
  const profileDoughnutData = {
    labels: data?.profileTypes?.map((item) => item.name) || [],
    datasets: [
      {
        data: data?.profileTypes?.map((item) => item.count) || [],
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

  const sizeDoughnutData = {
    labels: data?.sizeDistribution?.map((item) => item.size) || [],
    datasets: [
      {
        data: data?.sizeDistribution?.map((item) => item.count) || [],
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
    <Box sx={{ p: 2 }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${premiumTheme.gradients.success[0]} 0%, ${premiumTheme.gradients.success[1]} 100%)`,
              color: "white",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 1.5,
                    width: 40,
                    height: 40,
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: "1.2rem" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.8rem",
                      mb: 0.5,
                    }}
                  >
                    {data?.totalProfiles || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: "0.85rem",
                    }}
                  >
                    Toplam Profil
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${premiumTheme.gradients.info[0]} 0%, ${premiumTheme.gradients.info[1]} 100%)`,
              color: "white",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 1.5,
                    width: 40,
                    height: 40,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: "1.2rem" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.8rem",
                      mb: 0.5,
                    }}
                  >
                    {data?.averageQuantityPerProfile || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: "0.85rem",
                    }}
                  >
                    Ortalama Miktar
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${premiumTheme.gradients.purple[0]} 0%, ${premiumTheme.gradients.purple[1]} 100%)`,
              color: "white",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 1.5,
                    width: 40,
                    height: 40,
                  }}
                >
                  <PaletteIcon sx={{ fontSize: "1.2rem" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      mb: 0.5,
                    }}
                  >
                    {data?.mostUsedProfileType || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: "0.85rem",
                    }}
                  >
                    En Çok Kullanılan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${premiumTheme.gradients.secondary[0]} 0%, ${premiumTheme.gradients.secondary[1]} 100%)`,
              color: "white",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    mr: 1.5,
                    width: 40,
                    height: 40,
                  }}
                >
                  <StraightenIcon sx={{ fontSize: "1.2rem" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      mb: 0.5,
                    }}
                  >
                    {data?.mostUsedSize || "N/A"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.9,
                      fontSize: "0.85rem",
                    }}
                  >
                    En Popüler Ebat
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Profile Types Chart */}
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
                📊 Profil Tipleri Dağılımı
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
                    data={profileDoughnutData}
                    options={getPremiumDoughnutOptions(
                      "Profile Types Distribution",
                    )}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 3 }}>
                  {(data?.profileTypes || []).map((item, index) => (
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
                              profileDoughnutData.datasets[0].backgroundColor[
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
                        {item.count} ({item.percentage}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Size Distribution Chart */}
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
                    width: 120,
                    height: 120,
                    position: "relative",
                  }}
                >
                  <Doughnut
                    data={sizeDoughnutData}
                    options={getPremiumDoughnutOptions("Size Distribution")}
                  />
                </Box>

                <Box sx={{ flex: 1, ml: 3 }}>
                  {(data?.sizeDistribution || []).map((item, index) => (
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
      </Grid>

      {/* Detailed Lists */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Profile Types List */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Profil Tipleri Detayı
              </Typography>
              <Stack spacing={2}>
                {(data?.profileTypes || []).map((profile, index) => (
                  <Box key={profile.name}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                        {profile.name}
                      </Typography>
                      <Chip
                        label={`${profile.count} adet`}
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
                      value={parseFloat(profile.percentage)}
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
                      %{profile.percentage}
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Size Distribution List */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                Ebat Dağılımı Detayı
              </Typography>
              <Stack spacing={2}>
                {(data?.sizeDistribution || []).map((size, index) => (
                  <Box key={size.size}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                        {size.size}
                      </Typography>
                      <Chip
                        label={`${size.count} adet`}
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
                      value={parseFloat(size.percentage)}
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
                      %{size.percentage}
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileAnalysis;
