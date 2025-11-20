/**
 * @fileoverview CTA Section v2.0 - Modern Industrial
 * @description Final call-to-action with gradient background
 * @version 2.0.0 - Full Transform
 */

import React from "react";
import { Box, Typography, Container, Stack, alpha } from "@mui/material";
import { AutoAwesome, ArrowForward } from "@mui/icons-material";
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
      sx={{
        py: { xs: ds.spacing["5"], md: ds.spacing["6"] },
        backgroundColor: ds.colors.surface.elevated1,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
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
            md: "800px",
            lg: "900px",
            xl: "1000px",
          },
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

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={ds.spacing["3"]}
              sx={{
                width: { xs: "100%", sm: "auto" },
                alignItems: "center",
              }}
            >
              <PrimaryButton
                size="large"
                onClick={onFreeTrial}
                endIcon={<ArrowForward sx={{ fontSize: 20 }} />}
                sx={{
                  px: { xs: ds.spacing["8"], sm: ds.spacing["10"] },
                  py: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                  fontSize: {
                    xs: tokens.typography.base,
                    sm: tokens.typography.lg,
                  },
                  fontWeight: 600,
                  minWidth: { xs: "100%", sm: "220px" },
                }}
              >
                Optimizasyon Başlat
              </PrimaryButton>

              <SecondaryButton
                size="large"
                onClick={onViewDemo}
                startIcon={<AutoAwesome sx={{ fontSize: 20 }} />}
                sx={{
                  px: { xs: ds.spacing["8"], sm: ds.spacing["10"] },
                  py: { xs: ds.spacing["2"], sm: ds.spacing["2.5"] },
                  fontSize: {
                    xs: tokens.typography.base,
                    sm: tokens.typography.lg,
                  },
                  fontWeight: 600,
                  minWidth: { xs: "100%", sm: "220px" },
                }}
              >
                Kesim Listesi Oluştur
              </SecondaryButton>
            </Stack>

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
      </Container>
    </Box>
  );
};

export default CTASection;
