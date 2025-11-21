/**
 * @fileoverview Hero Section v3.0 - Modern Industrial with Shimmer
 * @description Stunning hero with glassmorphism, animations, and shimmer effect
 * @version 3.0.0 - UI/UX v3.0 Enhancement
 */

import React, { useMemo, useCallback, memo } from "react";
<<<<<<< HEAD
import { Box, Typography, Grid, Stack, alpha } from "@mui/material";
=======
import { Box, Typography, Container, Grid, Stack, alpha } from "@mui/material";
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
import {
  TrendingUp,
  Speed,
  Security,
  Analytics,
  Engineering,
  PrecisionManufacturing,
  AutoAwesome,
} from "@mui/icons-material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import { FadeIn, Badge, PrimaryButton, SecondaryButton } from "@/shared";

// Constants
const SENTENCES = [
  "Yapay zeka destekli optimizasyon algoritmaları ile %92'nin üzerinde verimlilik sağlayın.",
  "WebGPU hızlandırma teknolojisi ile üretim süreçlerinizi optimize edin.",
  "4 gelişmiş algoritma ve gerçek zamanlı analiz ile endüstri devrimi yaşayın.",
] as const;

const FEATURES = [
  { text: "Güvenli Veri İşleme", icon: Security },
  { text: "Endüstriyel Standartlar", icon: PrecisionManufacturing },
  { text: "Kanıtlanmış Sonuçlar", icon: Analytics },
] as const;

interface HeroSectionProps {
  onDemoStart?: () => void;
  onExcelImport?: () => void;
}

// Helper component for sequential sentences in same position
const SequentialSentences: React.FC<{
  sentences: readonly string[];
  delay?: number;
  duration?: number; // milliseconds each sentence is visible
  gradient?: string;
  showCursor?: boolean;
  className?: string;
}> = memo(
  ({
    sentences,
    delay = 0,
    duration = 3500,
    gradient,
    showCursor = false,
    className,
  }) => {
    const fadeInOut = 500; // fade in/out duration in ms
    const finalDuration = 6000; // final combined text duration
    const gapBeforeFinal = 300; // gap between last sentence and final text (ms)

    // Create combined final text
    const combinedText = useMemo(() => sentences.join(" "), [sentences]);

    // Calculate total animation duration
    const totalSequenceDuration = sentences.length * duration;
    const finalStart = delay + totalSequenceDuration + gapBeforeFinal; // Add gap before final
    const totalDuration =
      totalSequenceDuration + gapBeforeFinal + finalDuration;

    // Memoize animation styles
    const animationStyles = useMemo(() => {
      const styles: Record<string, any> = {};

      // Individual sentence animations
      sentences.forEach((_sentence, index) => {
        const sentenceStart = delay + index * duration;
        const fadeInEnd = sentenceStart + fadeInOut;
        const fadeOutStart = sentenceStart + duration - fadeInOut;
        const sentenceEnd = sentenceStart + duration;

        styles[`& .sentence:nth-of-type(${index + 1})`] = {
          animation: `sentenceShow${index} ${totalDuration}ms ${sentenceStart}ms both`,
          willChange: "opacity, transform",
          [`@keyframes sentenceShow${index}`]: {
            "0%": {
              opacity: 0,
              transform: "translateY(8px)",
            },
            [`${(fadeInEnd / totalDuration) * 100}%`]: {
              opacity: 1,
              transform: "translateY(0)",
            },
            [`${(fadeOutStart / totalDuration) * 100}%`]: {
              opacity: 1,
              transform: "translateY(0)",
            },
            [`${(sentenceEnd / totalDuration) * 100}%`]: {
              opacity: 0,
              transform: "translateY(-8px)",
            },
            // Ensure completely hidden before final text appears
            [`${((sentenceEnd + gapBeforeFinal / 2) / totalDuration) * 100}%`]:
              {
                opacity: 0,
                transform: "translateY(-8px)",
              },
            [`${(finalStart / totalDuration) * 100}%`]: {
              opacity: 0,
              transform: "translateY(-8px)",
            },
            "100%": {
              opacity: 0,
              transform: "translateY(-8px)",
            },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            opacity: index === 0 ? 1 : 0,
          },
        };
      });

      // Final combined text animation
      const finalFadeInEnd = finalStart + fadeInOut;
      styles["& .combined"] = {
        animation: `combinedShow ${totalDuration}ms ${finalStart}ms both`,
        willChange: "opacity, transform",
        [`@keyframes combinedShow`]: {
          "0%": {
            opacity: 0,
            transform: "translateY(8px)",
          },
          [`${(finalFadeInEnd / totalDuration) * 100}%`]: {
            opacity: 1,
            transform: "translateY(0)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
          opacity: 1,
        },
      };

      return styles;
    }, [
      sentences,
      delay,
      duration,
      fadeInOut,
      finalStart,
      totalDuration,
      gapBeforeFinal,
    ]);

    return (
      <Box
        component="span"
        sx={{
          position: "relative",
          display: "inline-block",
          width: "100%",
          minHeight: "1.75em", // Prevent layout shift
          "& .sentence": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            opacity: 0,
            transform: "translateY(8px)",
            willChange: "opacity, transform",
            zIndex: 1,
            ...(gradient && {
              background: gradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }),
          },
          "& .combined": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            opacity: 0,
            transform: "translateY(8px)",
            willChange: "opacity, transform",
            zIndex: 2, // Always on top
            ...(gradient && {
              background: gradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }),
          },
          ...animationStyles,
        }}
        className={className}
        role="region"
        aria-label="Rotating feature descriptions"
      >
        {sentences.map((sentence, index) => (
          <Box
            key={`${sentence}-${index}`}
            component="span"
            className="sentence"
            aria-hidden={true}
          >
            {sentence}
          </Box>
        ))}
        <Box component="span" className="combined" aria-hidden={false}>
          {combinedText}
          {showCursor && (
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                display: "inline-block",
                width: "2px",
                height: "1em",
                backgroundColor: gradient ? "transparent" : "currentColor",
                marginLeft: "2px",
                verticalAlign: "baseline",
                position: "relative",
                willChange: "opacity",
                animation: "cursorBlink 1s infinite",
                animationDelay: `${finalStart + fadeInOut}ms`,
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                  opacity: 1,
                },
                "&::before": gradient
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: gradient,
                    }
                  : {},
                "@keyframes cursorBlink": {
                  "0%, 49%": { opacity: 1 },
                  "50%, 100%": { opacity: 0 },
                },
              }}
            />
          )}
        </Box>
      </Box>
    );
  },
);

SequentialSentences.displayName = "SequentialSentences";

const HeroSection: React.FC<HeroSectionProps> = ({
  onDemoStart,
  onExcelImport,
}) => {
  const ds = useDesignSystem();
  const { tokens } = useAdaptiveUIContext();

  // Memoize metrics data
  const metrics = useMemo(
    () => [
      {
        value: "92%+",
        label: "Ortalama Verimlilik",
        icon: TrendingUp,
        color: ds.colors.success.main,
      },
      {
        value: "<2 sn",
        label: "Optimizasyon Süresi",
        icon: Speed,
        color: ds.colors.primary.main,
      },
      {
        value: "35%",
        label: "Maliyet Tasarrufu",
        icon: Analytics,
        color: ds.colors.primary.main,
      },
      {
        value: "4",
        label: "Optimizasyon Algoritması",
        icon: Engineering,
        color: ds.colors.primary.main,
      },
    ],
    [ds.colors.success.main, ds.colors.primary.main],
  );

  // Memoize gradient strings
  const subtitleGradient = useMemo(
    () =>
      `linear-gradient(135deg, ${ds.colors.slate[800]} 0%, ${ds.colors.primary[700]} 50%, ${ds.colors.slate[700]} 100%)`,
    [ds.colors.slate, ds.colors.primary],
  );

  const bodyGradient = useMemo(
    () =>
      `linear-gradient(135deg, ${alpha(ds.colors.slate[600], 0.95)} 0%, ${alpha(ds.colors.primary[600], 0.7)} 30%, ${alpha(ds.colors.slate[600], 0.9)} 100%)`,
    [ds.colors.slate, ds.colors.primary],
  );

  const headlineGradient = useMemo(
    () =>
      `linear-gradient(135deg, ${ds.colors.slate[900]} 0%, ${ds.colors.primary[800]} 40%, ${ds.colors.slate[900]} 100%)`,
    [ds.colors.slate, ds.colors.primary],
  );

  // Memoize callbacks
  const handleDemoStart = useCallback(() => {
    onDemoStart?.();
  }, [onDemoStart]);

  const handleExcelImport = useCallback(() => {
    onExcelImport?.();
  }, [onExcelImport]);

  return (
    <Box
      component="section"
      id="hero"
      sx={{
        // Responsive padding pattern from example: pt-32 pb-20 px-4 sm:px-6 lg:px-8
        // pt-32 = 128px (sabit, örnek uygulamadaki gibi)
        pt: ds.spacing["32"], // pt-32 = 128px (sabit, her cihazda aynı)
        pb: ds.spacing["20"], // pb-20 = 80px (sabit, örnek uygulamadaki gibi)
        px: {
          xs: ds.spacing["4"], // px-4 (16px) mobile
          sm: ds.spacing["6"], // sm:px-6 (24px) tablet
          lg: ds.spacing["8"], // lg:px-8 (32px) desktop
        },
        // Örnek uygulamadaki gibi: Section'da sadece padding var, display yok
        // Flex/Grid layout container İÇERİDE olmalı, section'da değil
        position: "relative",
        backgroundColor: ds.colors.surface.base,
        background: `linear-gradient(180deg, ${ds.colors.surface.base} 0%, ${alpha(ds.colors.surface.base, 0.98)} 100%)`,
      }}
    >
      <Box
        component="div"
        sx={{
          position: "relative",
          zIndex: 1,
          // Container max-width pattern: max-w-7xl (80rem = 1280px) - SABIT
          // Örnek uygulamadaki gibi: breakpoint'e göre değişmez, sadece 1280px
          maxWidth: "1280px", // max-w-7xl (sabit, her cihazda aynı)
          mx: "auto",
          width: "100%",
        }}
      >
        {/* Header Content */}
        <FadeIn duration={0.4}>
          <Stack
            alignItems="center"
            spacing={{ xs: ds.spacing["4"], md: ds.spacing["5"] }}
            sx={{ width: "100%" }}
          >
            {/* System Badge */}
            <Badge variant="soft" color="primary">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["1.5"],
                }}
              >
                <AutoAwesome
                  sx={{
                    fontSize: 11,
                    color: ds.colors.primary[600],
                    filter: "drop-shadow(0 1px 2px rgba(37, 99, 235, 0.2))",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.xs * 0.9}px`,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.primary[700]} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  PRODUCTION OPTIMIZATION SYSTEM
                </Typography>
              </Box>
            </Badge>

            {/* Main Headline */}
            <Box sx={{ textAlign: "center", width: "100%" }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: {
                    xs: "2rem",
                    sm: "2.75rem",
                    md: "3.5rem",
                  },
                  fontWeight: 600,
                  mb: ds.spacing["3"],
                  lineHeight: 1.15,
                  letterSpacing: "-0.015em",
                  background: headlineGradient,
                  backgroundSize: "200% auto",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  position: "relative",
                  willChange: "background-position",
                  "@media (prefers-reduced-motion: reduce)": {
                    backgroundSize: "100% auto",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60%",
                    height: "2px",
                    background: `linear-gradient(90deg, transparent 0%, ${alpha(ds.colors.primary[600], 0.3)} 50%, transparent 100%)`,
                    borderRadius: "1px",
                  },
                }}
              >
                LEMNİX
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontSize: {
                    xs: "1.125rem",
                    sm: "1.25rem",
                    md: "1.5rem",
                  },
                  fontWeight: 500,
                  maxWidth: { xs: "100%", sm: "600px", md: "700px" },
                  mx: "auto",
                  mb: ds.spacing["3"],
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                  background: subtitleGradient,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  position: "relative",
                  willChange: "opacity, transform",
                  animation: "fadeIn 0.8s ease-out 0.3s both",
                  "@keyframes fadeIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(8px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                    opacity: 1,
                    transform: "none",
                  },
                }}
              >
                Alüminyum Profil Kesiminde Endüstri Devrimi
              </Typography>

              <Typography
                variant="body1"
                component="div"
                sx={{
                  fontSize: {
                    xs: "0.8125rem",
                    sm: "0.9375rem",
                    md: "1rem",
                  },
                  maxWidth: { xs: "100%", sm: "600px", md: "700px" },
                  mx: "auto",
                  lineHeight: 1.75,
                  fontWeight: 400,
                  position: "relative",
                  textAlign: "center",
                }}
              >
                <SequentialSentences
                  sentences={SENTENCES}
                  delay={800}
                  duration={3500}
                  showCursor={true}
                  gradient={bodyGradient}
                />
              </Typography>
            </Box>

<<<<<<< HEAD
            {/* CTA Buttons - Örnek uygulamadaki pattern: flex flex-wrap gap-4 */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: ds.spacing["4"], // gap-4 (16px) - örnek uygulamadaki gibi
                mt: ds.spacing["6"], // mb-6 equivalent
                justifyContent: { xs: "center", sm: "flex-start" },
=======
            {/* CTA Buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={ds.spacing["3"]}
              sx={{
                width: { xs: "100%", sm: "auto" },
                alignItems: "center",
                mt: ds.spacing["2"],
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
              }}
            >
              <PrimaryButton
                size="large"
                onClick={handleDemoStart}
                aria-label="Optimizasyon işlemine başla"
                sx={{
<<<<<<< HEAD
                  // Gradient background - örnek uygulamadaki gibi: bg-gradient-to-r from-purple-600 to-pink-600
                  background: `linear-gradient(135deg, ${ds.colors.primary[600]} 0%, ${ds.colors.secondary?.[600] || ds.colors.primary[500]} 100%)`,
                  color: "white",
                  px: ds.spacing["6"], // px-6 - örnek uygulamadaki size="lg" padding
                  py: ds.spacing["2.5"], // py-2.5 equivalent
                  fontSize: tokens.typography.base,
                  fontWeight: 500,
                  minHeight: "40px", // h-10 equivalent
                  borderRadius: `${ds.borderRadius.md}px`,
                  transition: "all 0.2s ease",
                  boxShadow: `0 4px 6px -1px ${alpha(ds.colors.primary[600], 0.2)}`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${ds.colors.primary[700]} 0%, ${ds.colors.secondary?.[700] || ds.colors.primary[600]} 100%)`,
                    boxShadow: `0 10px 15px -3px ${alpha(ds.colors.primary[600], 0.3)}`,
                    transform: "translateY(-1px)",
                  },
=======
                  px: { xs: ds.spacing["8"], sm: ds.spacing["10"] },
                  py: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                  fontSize: {
                    xs: tokens.typography.base,
                    sm: tokens.typography.lg,
                  },
                  fontWeight: 600,
                  minWidth: { xs: "100%", sm: "200px" },
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
                }}
              >
                Optimizasyona Başla
              </PrimaryButton>

              <SecondaryButton
                size="large"
                onClick={handleExcelImport}
                aria-label="Excel dosyasından kesim listesi oluştur"
                sx={{
<<<<<<< HEAD
                  // Outline variant - örnek uygulamadaki gibi: variant="outline"
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: ds.colors.border.default,
                  color: ds.colors.text.primary,
                  backgroundColor: "transparent",
                  px: ds.spacing["6"], // px-6 - örnek uygulamadaki size="lg" padding
                  py: ds.spacing["2.5"], // py-2.5 equivalent
                  fontSize: tokens.typography.base,
                  fontWeight: 500,
                  minHeight: "40px", // h-10 equivalent
                  borderRadius: `${ds.borderRadius.md}px`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: alpha(ds.colors.primary.main, 0.05),
                    borderColor: ds.colors.primary.main,
                    color: ds.colors.primary.main,
                  },
=======
                  px: { xs: ds.spacing["8"], sm: ds.spacing["10"] },
                  py: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                  fontSize: {
                    xs: tokens.typography.base,
                    sm: tokens.typography.lg,
                  },
                  fontWeight: 600,
                  minWidth: { xs: "100%", sm: "220px" },
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
                }}
              >
                Kesim Listesi Oluştur
              </SecondaryButton>
            </Box>
          </Stack>
        </FadeIn>

        {/* Metrics Grid */}
        <FadeIn delay={0.2} duration={0.4}>
          <Grid
            container
            spacing={{
              xs: ds.spacing["3"],
              sm: ds.spacing["4"],
              md: ds.spacing["5"],
            }}
            sx={{
              mt: {
                xs: ds.spacing["5"],
                md: ds.spacing["6"],
                lg: ds.spacing["7"],
              },
            }}
          >
            {metrics.map((metric) => (
              <Grid key={metric.label} item xs={12} sm={6} lg={3}>
                <Box
                  component="article"
                  aria-label={`${metric.label}: ${metric.value}`}
                  sx={{
                    p: {
                      xs: ds.spacing["2.5"],
                      sm: ds.spacing["3"],
                      md: ds.spacing["3.5"],
                    },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    backgroundColor: ds.colors.surface.elevated1,
                    border: `1px solid ${ds.colors.border.muted}`,
                    borderRadius: `${ds.borderRadius.lg}px`,
                    boxShadow: ds.shadows.soft.sm,
                    transition:
                      "transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out",
                    position: "relative",
                    minHeight: { xs: "140px", sm: "150px", md: "160px" },
                    height: "100%",
                    willChange: "transform",
                    cursor: "default",

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
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                      "&:hover": {
                        transform: "none",
                      },
                    },
                    "@media (hover: none)": {
                      "&:hover": {
                        transform: "none",
                      },
                    },
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: { xs: 32, sm: 36, md: 40 },
                      height: { xs: 32, sm: 36, md: 40 },
                      borderRadius: `${ds.borderRadius.md}px`,
                      background: alpha(metric.color, 0.08),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: ds.transitions.base,
                      mb: {
                        xs: ds.spacing["1.5"],
                        sm: ds.spacing["2"],
                        md: ds.spacing["2.5"],
                      },
                      flexShrink: 0,
                    }}
                  >
                    <metric.icon
                      sx={{
                        fontSize: { xs: 16, sm: 18, md: 20 },
                        color: metric.color,
                      }}
                    />
                  </Box>

                  {/* Value */}
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: {
                        xs: `clamp(${tokens.typography.lg}px, 3vw + ${tokens.typography.base * 0.3}px, ${tokens.typography.xl * 1.3}px)`,
                        sm: `clamp(${tokens.typography.xl}px, 2vw + ${tokens.typography.base * 0.6}px, ${tokens.typography.xxl * 1.4}px)`,
                        md: `clamp(${tokens.typography.xl * 1.1}px, 1.5vw + ${tokens.typography.base * 0.8}px, ${tokens.typography.xxl * 1.6}px)`,
                      },
                      fontWeight: 700,
                      color: ds.colors.text.primary,
                      lineHeight: 1.15,
                      letterSpacing: "-0.015em",
                      mb: {
                        xs: ds.spacing["1"],
                        sm: ds.spacing["1.5"],
                        md: ds.spacing["2"],
                      },
                    }}
                  >
                    {metric.value}
                  </Typography>

                  {/* Label */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: {
                        xs: `${tokens.typography.xs * 0.95}px`,
                        sm: `${tokens.typography.sm * 0.9}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                      color: ds.colors.text.secondary,
                      fontWeight: 500,
                      lineHeight: 1.35,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {metric.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </FadeIn>

        {/* System Features */}
        <FadeIn delay={0.3} duration={0.4}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: ds.spacing["2"], sm: ds.spacing["3"] }}
            justifyContent="center"
            alignItems="center"
            sx={{
              mt: { xs: ds.spacing["5"], md: ds.spacing["6"] },
              px: { xs: ds.spacing["2"], sm: 0 },
            }}
          >
            {FEATURES.map((item) => (
              <Box
                key={item.text}
                component="article"
                aria-label={item.text}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                  px: {
                    xs: ds.spacing["3"],
                    sm: ds.spacing["4"],
                    md: ds.spacing["5"],
                  },
                  py: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                  borderRadius: `${ds.borderRadius.md}px`,
                  backgroundColor: ds.colors.surface.elevated1,
                  border: `1px solid ${ds.colors.border.muted}`,
                  transition:
                    "transform 0.2s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out, background-color 0.2s ease-out",
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { xs: "100%", sm: "200px", md: "220px" },
                  minHeight: "44px", // Touch target size
                  willChange: "transform",
                  cursor: "default",

                  "&:hover": {
                    borderColor: ds.colors.primary.main,
                    backgroundColor: alpha(ds.colors.primary.main, 0.02),
                    transform: "translateY(-1px)",
                    boxShadow: ds.shadows.soft.sm,
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    transition: "none",
                    "&:hover": {
                      transform: "none",
                    },
                  },
                  "@media (hover: none)": {
                    "&:hover": {
                      transform: "none",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 28, sm: 32, md: 36 },
                    height: { xs: 28, sm: 32, md: 36 },
                    borderRadius: `${ds.borderRadius.sm}px`,
                    background: alpha(ds.colors.primary.main, 0.08),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon
                    sx={{
                      fontSize: { xs: 14, sm: 16, md: 18 },
                      color: ds.colors.primary.main,
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: tokens.typography.sm,
                      sm: tokens.typography.base,
                      md: tokens.typography.base,
                    },
                    fontWeight: 500,
                    color: ds.colors.text.primary,
                    lineHeight: 1.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </FadeIn>
      </Box>
    </Box>
  );
};

export default memo(HeroSection);
