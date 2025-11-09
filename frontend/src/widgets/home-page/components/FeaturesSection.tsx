/**
 * @fileoverview Features Section v2.0 - Modern Industrial
 * @description Bento grid layout with interactive cards
 * @version 2.0.0 - Full Transform
 */

import React from "react";
import { Box, Typography, Grid, Container, Stack, alpha } from "@mui/material";
import {
  Memory as Cpu,
  TableChart as FileSpreadsheet,
  BarChart as BarChart3,
  Business as Building2,
  Security as ShieldCheck,
  Layers as Layers,
  AutoAwesome,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { FadeIn, CardV2, Badge } from "@/shared";

interface FeaturesSectionProps {
  className?: string;
}

const features = [
  {
    icon: Cpu,
    title: "4 Gelişmiş Optimizasyon Algoritması",
    description:
      "FFD, BFD, Genetic Algorithm v1.7.1, Profile Pooling algoritmaları ile %92+ verimlilik. GPU hızlandırma teknolojisi ile 2 saniyede sonuç.",
    badge: "AI Algoritma",
  },
  {
    icon: FileSpreadsheet,
    title: "Kapsamlı Kesim Listesi Yönetimi",
    description:
      "Haftalık kesim listeleri, iş emri yönetimi, profil kombinasyonları ve akıllı öneriler. Gerçek zamanlı senkronizasyon ve otomatik güncelleme.",
    badge: "Yönetim",
  },
  {
    icon: BarChart3,
    title: "Gerçek Zamanlı Analiz ve Raporlama",
    description:
      "Verimlilik %, Fire Oranı, Maliyet Analizi, Kesim Planı görselleştirmesi. ISO standartlarında denetlenebilir raporlama sistemi.",
    badge: "Canlı Analiz",
  },
  {
    icon: Building2,
    title: "Enterprise İş Emri Yönetimi",
    description:
      "İş emri oluşturma, versiyon kontrolü, renk ve ebat yönetimi, profil kombinasyonları. Çoklu kullanıcı desteği ve rol tabanlı erişim.",
    badge: "Enterprise",
  },
  {
    icon: ShieldCheck,
    title: "Endüstriyel Standartlar ve Güvenlik",
    description:
      "6100mm stok uzunluğu, 3.5mm kerf genişliği, 2mm güvenlik payı ile gerçekçi hesaplamalar. Enterprise-grade güvenlik ve veri koruma.",
    badge: "ISO Standart",
  },
  {
    icon: Layers,
    title: "AI Destekli Akıllı Öneriler",
    description:
      "Profil kombinasyonları, ebat önerileri, akıllı tamamlama ve geçmiş veri analizi. Machine learning algoritmaları ile sürekli öğrenen sistem.",
    badge: "AI Öneri",
  },
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  const ds = useDesignSystem();

  return (
    <Box
      sx={{
        py: ds.spacing["12"],
        background: ds.colors.surface.elevated1,
        position: "relative",
      }}
    >
      <Container maxWidth="xl">
        {/* Section Header - KOMPAKT */}
        <FadeIn direction="up" duration={0.5}>
          <Stack
            alignItems="center"
            spacing={ds.spacing["3"]}
            sx={{ mb: ds.spacing["8"] }}
          >
            <Badge variant="soft" color="primary">
              <Stack
                direction="row"
                spacing={ds.spacing["2"]}
                alignItems="center"
              >
                <AutoAwesome sx={{ fontSize: 16 }} />
                <Typography sx={{ ...ds.typography.label.prominent }}>
                  PLATFORM ÖZELLİKLERİ
                </Typography>
              </Stack>
            </Badge>

            <Typography
              sx={{
                fontSize: { xs: "1.5rem", md: "1.875rem" },
                fontWeight: 700,
                textAlign: "center",
                color: ds.colors.text.primary,
              }}
            >
              Sistem Yetenekleri
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9375rem",
                textAlign: "center",
                color: ds.colors.text.secondary,
                maxWidth: "600px",
              }}
            >
              Endüstri 4.0 standardında üretim optimizasyon platformu
            </Typography>
          </Stack>
        </FadeIn>

        {/* Bento Grid - KOMPAKT Feature Cards */}
        <Grid container spacing={ds.spacing["3"]}>
          {features.map((feature, index) => (
            <Grid key={feature.title} item xs={12} md={6} lg={4}>
              <FadeIn delay={0.1 * index} duration={0.5}>
                <CardV2
                  variant="glass"
                  hoverable
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    borderRadius: `${ds.borderRadius.lg}px`,

                    "&:hover .feature-icon": {
                      transform: "scale(1.08) rotate(-3deg)",
                    },
                  }}
                >
                  <Stack spacing={ds.spacing["3"]}>
                    {/* Icon + Badge - KOMPAKT */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box
                        className="feature-icon"
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: `${ds.borderRadius.md}px`,
                          background: alpha(ds.colors.primary.main, 0.1),
                          border: `1.5px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: ds.transitions.spring,
                        }}
                      >
                        <feature.icon
                          sx={{ fontSize: 22, color: ds.colors.primary.main }}
                        />
                      </Box>

                      <Badge variant="outlined" color="primary">
                        <Typography
                          sx={{ fontSize: "0.65rem", fontWeight: 600 }}
                        >
                          {feature.badge}
                        </Typography>
                      </Badge>
                    </Stack>

                    {/* Title - KOMPAKT */}
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: ds.colors.text.primary,
                        lineHeight: 1.3,
                      }}
                    >
                      {feature.title}
                    </Typography>

                    {/* Description - KOMPAKT */}
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        color: ds.colors.text.secondary,
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardV2>
              </FadeIn>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
