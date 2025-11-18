/**
 * @fileoverview Premium Metrics Dashboard Section Component for HomePage
 * @module MetricsSection
 * @version 2.0.0 - Industrial Performance Focus
 */

import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  RecyclingOutlined as WasteIcon,
  Analytics as AnalyticsIcon,
  Timer as TimerIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import { FadeIn, Badge, PrimaryButton } from "@/shared";
import { MetricsSectionProps } from "../types";

/**
 * Premium Metrics Dashboard Section Component
 */
export const MetricsSection: React.FC<MetricsSectionProps> = ({
  metrics = [],
}) => {
  const ds = useDesignSystem();
  const { tokens } = useAdaptiveUIContext();

  // Industrial performance metrics
  const industrialMetrics = [
    {
      id: "waste-reduction",
      title: "Atık Azalması",
      value: 42,
      unit: "%",
      description: "Malzeme atık oranında belirgin azalma",
      icon: WasteIcon,
      color: ds.colors.success.main,
      change: "+15%",
      target: 50,
    },
    {
      id: "cost-savings",
      title: "Maliyet Tasarrufu",
      value: 285000,
      unit: "TL",
      description: "Yıllık maliyet tasarrufu",
      icon: CostIcon,
      color: ds.colors.primary.main,
      change: "+23%",
      target: 300000,
    },
    {
      id: "production-speed",
      title: "Üretim Hızı",
      value: 340,
      unit: "%",
      description: "Kesim hızında önemli artış",
      icon: SpeedIcon,
      color: ds.colors.primary.main,
      change: "+8%",
      target: 400,
    },
    {
      id: "accuracy-rate",
      title: "Doğruluk Oranı",
      value: 96.8,
      unit: "%",
      description: "Yüksek kesim doğruluğu",
      icon: AnalyticsIcon,
      color: ds.colors.primary.main,
      change: "+2.1%",
      target: 98,
    },
    {
      id: "efficiency-gain",
      title: "Verimlilik Artışı",
      value: 78,
      unit: "%",
      description: "Genel verimlilik artışı",
      icon: TrendingUpIcon,
      color: ds.colors.primary.main,
      change: "+12%",
      target: 85,
    },
    {
      id: "time-savings",
      title: "Zaman Tasarrufu",
      value: 45,
      unit: "%",
      description: "Kesim süresinde azalma",
      icon: TimerIcon,
      color: ds.colors.primary.main,
      change: "+6%",
      target: 50,
    },
  ];

  const formatValue = (value: number, unit: string) => {
    if (unit === "TL") {
      // 285000 -> "285K" format (daha kompakt)
      if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
      }
      return value.toLocaleString("tr-TR");
    }
    // Sayısal değerler için ondalık kontrolü
    if (unit === "%" && value % 1 !== 0) {
      return value.toFixed(1);
    }
    return value.toString();
  };

  return (
    <Box
      sx={{
        py: { xs: ds.spacing["8"], md: ds.spacing["12"] },
        backgroundColor: ds.colors.surface.base,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 2,
          px: {
            xs: ds.spacing["3"],
            sm: ds.spacing["4"],
            md: ds.spacing["6"],
            lg: ds.spacing["8"],
            xl: "clamp(2rem, 5vw, 4rem)",
          },
          maxWidth: {
            xs: "100%",
            sm: "600px",
            md: "900px",
            lg: "1200px",
            xl: "1400px",
            "2xl": "1600px",
          },
        }}
      >
        {/* Section Header */}
        <FadeIn duration={0.4}>
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: ds.spacing["8"], md: ds.spacing["10"] },
            }}
          >
            <Badge variant="soft" color="success">
              <Typography
                sx={{
                  fontSize: tokens.typography.xs,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: ds.colors.text.secondary,
                }}
              >
                PERFORMANS METRİKLERİ
              </Typography>
            </Badge>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: `clamp(${tokens.typography.xl * 1.2}px, 4vw + ${tokens.typography.base}px, ${tokens.typography.xxl * 1.5}px)`,
                mb: ds.spacing["3"],
                color: ds.colors.text.primary,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                mt: ds.spacing["3"],
              }}
            >
              Kanıtlanmış Sonuçlar
            </Typography>

            <Typography
              variant="body1"
              sx={{
                maxWidth: { xs: "100%", sm: "700px", md: "800px", lg: "900px" },
                mx: "auto",
                color: ds.colors.text.secondary,
                lineHeight: 1.75,
                fontSize: `clamp(${tokens.typography.base}px, 1vw + ${tokens.typography.base * 0.25}px, ${tokens.typography.lg}px)`,
                fontWeight: 400,
              }}
            >
              LEMNIX ile elde edilen gerçek performans verileri. İşletmenizin
              verimliliğini artıracak somut sonuçlar.
            </Typography>
          </Box>
        </FadeIn>

        {/* Main Metrics Grid */}
        <Grid
          container
          spacing={{ xs: ds.spacing["3"], sm: ds.spacing["4"], md: ds.spacing["5"], lg: ds.spacing["6"] }}
          sx={{ mb: { xs: ds.spacing["8"], md: ds.spacing["10"], lg: ds.spacing["12"] } }}
        >
          {industrialMetrics.map((metric, index) => {
            const MetricIcon = metric.icon;
            return (
            <Grid item xs={12} sm={6} lg={4} key={metric.id}>
              <FadeIn delay={0.05 * index} duration={0.3}>
                <Card
                  sx={{
                    height: "100%",
                    minHeight: { xs: "200px", sm: "240px", md: "280px" },
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: ds.colors.surface.elevated1,
                    border: `1px solid ${ds.colors.border.muted}`,
                    borderRadius: `${ds.borderRadius.lg}px`,
                    boxShadow: ds.shadows.soft.sm,
                    transition: ds.transitions.base,
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: metric.color,
                      borderRadius: `${ds.borderRadius.lg}px ${ds.borderRadius.lg}px 0 0`,
                    },
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.md,
                      borderColor: alpha(metric.color, 0.2),
                    },
                  }}
                >
                    <CardContent
                      sx={{
                        p: { xs: ds.spacing["4"], sm: ds.spacing["5"] },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        "&:last-child": {
                          pb: { xs: ds.spacing["4"], sm: ds.spacing["5"] },
                        },
                      }}
                    >
                    {/* Header - Icon + Chip */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: { xs: ds.spacing["3"], sm: ds.spacing["4"] },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          borderRadius: `${ds.borderRadius.md}px`,
                          background: alpha(metric.color, 0.08),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: ds.transitions.base,
                          flexShrink: 0,
                        }}
                      >
                        <MetricIcon sx={{ fontSize: { xs: 20, sm: 22, md: 24 }, color: metric.color }} />
                      </Box>

                      {/* Trend Indicator */}
                      <Chip
                        icon={<TrendingUpIcon sx={{ fontSize: { xs: 12, sm: 13 } }} />}
                        label={metric.change}
                        size="small"
                        sx={{
                          backgroundColor: alpha(metric.color, 0.08),
                          color: metric.color,
                          fontWeight: 600,
                          fontSize: { xs: tokens.typography.xs * 0.9, sm: tokens.typography.xs },
                          height: { xs: 24, sm: 26 },
                          "& .MuiChip-icon": {
                            fontSize: { xs: 12, sm: 13 },
                          },
                        }}
                      />
                    </Box>

                    {/* Value + Title */}
                    <Box sx={{ mb: { xs: ds.spacing["2"], sm: ds.spacing["3"] }, flexGrow: 1 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: ds.colors.text.primary,
                          fontSize: { 
                            xs: `clamp(${tokens.typography.xl}px, 4vw + ${tokens.typography.base * 0.5}px, ${tokens.typography.xxl * 1.2}px)`,
                            sm: `clamp(${tokens.typography.xl * 1.2}px, 3vw + ${tokens.typography.base}px, ${tokens.typography.xxl * 1.4}px)`,
                            md: `clamp(${tokens.typography.xl * 1.3}px, 2.5vw + ${tokens.typography.base * 1.2}px, ${tokens.typography.xxl * 1.6}px)`
                          },
                          lineHeight: 1.1,
                          letterSpacing: "-0.01em",
                          mb: { xs: ds.spacing["1"], sm: ds.spacing["2"] },
                        }}
                      >
                        {formatValue(metric.value, metric.unit)}
                        <Typography
                          component="span"
                          sx={{
                            color: ds.colors.text.secondary,
                            fontWeight: 600,
                            ml: ds.spacing["1"],
                            fontSize: { 
                              xs: `clamp(${tokens.typography.sm * 0.9}px, 2vw + ${tokens.typography.base * 0.3}px, ${tokens.typography.base}px)`,
                              sm: tokens.typography.base,
                              md: tokens.typography.lg 
                            },
                          }}
                        >
                          {metric.unit}
                        </Typography>
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: ds.colors.text.primary,
                          fontSize: { 
                            xs: `clamp(${tokens.typography.base * 0.95}px, 2vw + ${tokens.typography.base * 0.4}px, ${tokens.typography.lg}px)`,
                            sm: tokens.typography.lg,
                            md: tokens.typography.xl 
                          },
                          mb: { xs: ds.spacing["1"], sm: ds.spacing["2"] },
                          lineHeight: 1.3,
                        }}
                      >
                        {metric.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: ds.colors.text.secondary,
                          lineHeight: 1.6,
                          fontSize: { 
                            xs: tokens.typography.xs,
                            sm: tokens.typography.sm,
                            md: tokens.typography.base 
                          },
                          fontWeight: 400,
                          display: { xs: "none", sm: "block" },
                        }}
                      >
                        {metric.description}
                      </Typography>
                    </Box>

                    {/* Progress Bar - Compact */}
                    <Box sx={{ mt: "auto" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: { xs: ds.spacing["1"], sm: ds.spacing["2"] },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: ds.colors.text.secondary,
                            fontWeight: 500,
                            fontSize: { xs: tokens.typography.xs * 0.85, sm: tokens.typography.xs },
                          }}
                        >
                          Hedef: {formatValue(metric.target, metric.unit)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: metric.color,
                            fontWeight: 600,
                            fontSize: { xs: tokens.typography.xs * 0.85, sm: tokens.typography.xs },
                          }}
                        >
                          {Math.round((metric.value / metric.target) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          (metric.value / metric.target) * 100,
                          100,
                        )}
                        sx={{
                          height: { xs: 4, sm: 5, md: 6 },
                          borderRadius: ds.borderRadius.sm,
                          backgroundColor: alpha(metric.color, 0.08),
                          "& .MuiLinearProgress-bar": {
                            background: metric.color,
                            borderRadius: ds.borderRadius.sm,
                          },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </FadeIn>
            </Grid>
          );
          })}
        </Grid>

        {/* Summary Stats */}
        <FadeIn delay={0.2} duration={0.4}>
          <Card
            sx={{
              backgroundColor: ds.colors.surface.elevated1,
              border: `1px solid ${ds.colors.border.muted}`,
              borderRadius: `${ds.borderRadius.lg}px`,
              p: ds.spacing["5"],
              mb: { xs: ds.spacing["8"], md: ds.spacing["10"] },
            }}
          >
            <Grid container spacing={ds.spacing["4"]} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: ds.colors.text.primary,
                    mb: ds.spacing["3"],
                    fontSize: { xs: tokens.typography.lg, sm: tokens.typography.xl },
                  }}
                >
                  Ortalama Performans Artışı
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: ds.colors.text.secondary,
                    lineHeight: 1.75,
                    fontSize: { xs: tokens.typography.sm, sm: tokens.typography.base },
                    fontWeight: 400,
                  }}
                >
                  LEMNIX kullanan işletmeler ortalama %65 verimlilik artışı, %40
                  atık azalması ve 280 bin TL maliyet tasarrufu elde ediyor.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      color: ds.colors.text.primary,
                      mb: ds.spacing["2"],
                      fontSize: { xs: `clamp(${tokens.typography.xl * 1.5}px, 3vw + ${tokens.typography.base}px, ${tokens.typography.xxl * 2}px)`, md: `clamp(${tokens.typography.xxl * 1.3}px, 3.5vw + ${tokens.typography.base}px, ${tokens.typography.xxl * 2.2}px)` },
                      lineHeight: 1.1,
                    }}
                  >
                    %65
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: ds.colors.text.secondary,
                      fontWeight: 500,
                      fontSize: tokens.typography.base,
                    }}
                  >
                    Ortalama Verimlilik Artışı
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </FadeIn>

        {/* Action CTA */}
        <FadeIn delay={0.3} duration={0.4}>
          <Box sx={{ textAlign: "center" }}>
            <PrimaryButton
              size="large"
              startIcon={<AnalyticsIcon sx={{ fontSize: 20 }} />}
              sx={{
                px: { xs: ds.spacing["8"], sm: ds.spacing["10"] },
                py: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                fontSize: { xs: tokens.typography.base, sm: tokens.typography.lg },
                fontWeight: 600,
              }}
            >
              Detaylı Raporları İncele
            </PrimaryButton>
          </Box>
        </FadeIn>
      </Container>
    </Box>
  );
};
