/**
 * @fileoverview CTA Section v2.0 - Modern Industrial
 * @description Final call-to-action with gradient background
 * @version 2.0.0 - Full Transform
 */

import React from "react";
import { Box, Typography, Container, Stack, alpha } from "@mui/material";
import { AutoAwesome, ArrowForward } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { FadeIn, GradientButton, SecondaryButtonV2 } from "@/shared";

interface CTASectionProps {
  onFreeTrial?: () => void;
  onViewDemo?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onFreeTrial, onViewDemo }) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        py: ds.spacing["12"],
        background: `
          ${ds.gradients.mesh.primary},
          linear-gradient(180deg, ${ds.colors.surface.elevated1} 0%, ${ds.colors.surface.base} 100%)
        `,
        position: "relative",
        overflow: "hidden",

        // Animated overlay
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: ds.gradients.premium,
          opacity: 0.05,
          animation: "ctaPulse 8s ease-in-out infinite",
        },

        "@keyframes ctaPulse": {
          "0%, 100%": { opacity: 0.05 },
          "50%": { opacity: 0.08 },
        },
      }}
    >
      <Container maxWidth="md">
        <FadeIn direction="up" duration={0.6}>
          <Stack
            alignItems="center"
            spacing={ds.spacing["4"]}
            sx={{ textAlign: "center" }}
          >
            {/* Headline - INTERNAL TOOL */}
            <Typography
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.25rem" },
                fontWeight: 800,
                background: ds.gradients.industrial,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                maxWidth: "600px",
                lineHeight: 1.2,
              }}
            >
              Üretim Verimliliğinizi Artırın
            </Typography>

            {/* Description - INTERNAL TOOL */}
            <Typography
              sx={{
                fontSize: "0.9375rem",
                color: ds.colors.text.secondary,
                maxWidth: "500px",
              }}
            >
              Endüstri 4.0 optimizasyon platformu ile hemen başlayın.
            </Typography>

            {/* CTA Buttons - INTERNAL TOOL */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={ds.spacing["2"]}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <GradientButton
                size="medium"
                onClick={onFreeTrial}
                endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                sx={{ px: ds.spacing["8"] }}
              >
                Optimizasyon Başlat
              </GradientButton>

              <SecondaryButtonV2
                size="medium"
                onClick={onViewDemo}
                sx={{ px: ds.spacing["8"] }}
              >
                Akıllı Liste Oluştur
              </SecondaryButtonV2>
            </Stack>

            {/* Info Text */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: ds.colors.text.secondary,
              }}
            >
              ⚡ WebGPU Hızlandırma · 📊 Gerçek Zamanlı Analiz · 🎯 4 Algoritma
            </Typography>
          </Stack>
        </FadeIn>
      </Container>
    </Box>
  );
};

export default CTASection;
