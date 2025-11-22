/**
 * @fileoverview CTA Section v2.0 - Modern Industrial
 * @description Final call-to-action with gradient background
 * @version 2.0.0 - Full Transform
 */

import React from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import { FadeIn, PrimaryButton, SecondaryButton } from "@/shared";

interface CTASectionProps {
  onFreeTrial?: () => void;
  onViewDemo?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onFreeTrial, onViewDemo }) => {
  const ds = useDesignSystem();
  const { tokens } = useAdaptiveUIContext();

  return (
    <Box
      component="section"
      id="cta"
      sx={{
        // Responsive padding pattern from example: py-20 px-4 sm:px-6 lg:px-8
        py: ds.spacing["20"], // py-20 = 80px (sabit, örnek uygulamadaki gibi)
        px: {
          xs: ds.spacing["4"], // px-4 (16px) mobile
          sm: ds.spacing["6"], // sm:px-6 (24px) tablet
          lg: ds.spacing["8"], // lg:px-8 (32px) desktop
        },
        backgroundColor: ds.colors.surface.elevated1,
      }}
    >
      <Box
        component="div"
        sx={{
          // Container max-width pattern: max-w-2xl (56rem = 896px) - SABIT
          // CTA section için örnek uygulamadaki gibi sabit max-width
          maxWidth: "896px", // max-w-2xl (sabit, her cihazda aynı)
          mx: "auto",
          width: "100%",
        }}
      >
        <FadeIn duration={0.4}>
          <Stack
            alignItems="center"
            spacing={ds.spacing["4"]}
            sx={{ textAlign: "center" }}
          >
            {/* Headline */}
            <Typography
              variant="h2"
              sx={{
                fontSize: `clamp(${tokens.typography.xl * 1.2}px, 3vw + ${tokens.typography.base}px, ${tokens.typography.xxl * 1.5}px)`,
                fontWeight: 700,
                color: ds.colors.text.primary,
                maxWidth: { xs: "100%", sm: "550px", md: "600px", lg: "700px" },
                lineHeight: 1.3,
              }}
            >
              Üretim Verimliliğinizi Artırın
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                fontSize: `clamp(${tokens.typography.base}px, 1vw + ${tokens.typography.base * 0.25}px, ${tokens.typography.lg}px)`,
                color: ds.colors.text.secondary,
                maxWidth: { xs: "100%", sm: "500px", md: "550px", lg: "650px" },
                lineHeight: 1.75,
                fontWeight: 400,
              }}
            >
              Endüstri 4.0 standartlarında geliştirilmiş optimizasyon platformu
              ile üretim verimliliğinizi artırın. Hemen başlayın ve somut
              sonuçlar görün.
            </Typography>

            {/* CTA Buttons - Örnek uygulamadaki pattern: flex flex-wrap gap-4 */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: ds.spacing["4"], // gap-4 (16px) - örnek uygulamadaki gibi
                justifyContent: "center",
              }}
            >
              <PrimaryButton
                size="large"
                onClick={onFreeTrial}
                aria-label="Ücretsiz deneme başlat"
                sx={{
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
                }}
              >
                Optimizasyon Başlat
              </PrimaryButton>

              <SecondaryButton
                size="large"
                onClick={onViewDemo}
                aria-label="Kesim listesi görüntüle"
                sx={{
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
                }}
              >
                Kesim Listesi Oluştur
              </SecondaryButton>
            </Box>

            {/* Info Text */}
            <Typography
              variant="caption"
              sx={{
                fontSize: {
                  xs: tokens.typography.xs,
                  sm: tokens.typography.sm,
                },
                color: ds.colors.text.secondary,
                pt: ds.spacing["3"],
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
            >
              WebGPU Hızlandırma · Gerçek Zamanlı Analiz · 4 Gelişmiş Algoritma
            </Typography>
          </Stack>
        </FadeIn>
      </Box>
    </Box>
  );
};

export default CTASection;
