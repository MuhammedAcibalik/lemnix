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
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import { FadeIn, CardV2, Badge } from "@/shared";

interface FeaturesSectionProps {
  className?: string;
}

const features = [
  {
    icon: Cpu,
    title: "4 Gelişmiş Optimizasyon Algoritması",
    description:
      "FFD, BFD, Genetic Algorithm v1.7.1 ve Profile Pooling algoritmaları ile %92'nin üzerinde verimlilik elde edin. WebGPU hızlandırma teknolojisi sayesinde optimizasyon sonuçlarını 2 saniyenin altında görün.",
    badge: "AI Algoritma",
  },
  {
    icon: FileSpreadsheet,
    title: "Kapsamlı Kesim Listesi Yönetimi",
    description:
      "Haftalık kesim listeleri oluşturun, iş emirlerini yönetin ve profil kombinasyonlarını optimize edin. Akıllı öneriler, gerçek zamanlı senkronizasyon ve otomatik güncellemeler ile süreçlerinizi kolaylaştırın.",
    badge: "Yönetim",
  },
  {
    icon: BarChart3,
    title: "Gerçek Zamanlı Analiz ve Raporlama",
    description:
      "Verimlilik oranları, fire oranı, maliyet analizi ve kesim planı görselleştirmeleri ile performansınızı izleyin. ISO standartlarında denetlenebilir raporlama sistemi ile şeffaflık sağlayın.",
    badge: "Canlı Analiz",
  },
  {
    icon: Building2,
    title: "Enterprise İş Emri Yönetimi",
    description:
      "İş emri oluşturma, versiyon kontrolü, renk ve ebat yönetimi, profil kombinasyonları ile kapsamlı üretim süreçlerini yönetin. Çoklu kullanıcı desteği ve rol tabanlı erişim ile güvenli çalışma ortamı.",
    badge: "Enterprise",
  },
  {
    icon: ShieldCheck,
    title: "Endüstriyel Standartlar ve Güvenlik",
    description:
      "6100mm stok uzunluğu, 3.5mm kerf genişliği ve 2mm güvenlik payı ile gerçekçi hesaplamalar yapın. Enterprise seviyesinde güvenlik ve veri koruma ile hassas bilgilerinizi güvende tutun.",
    badge: "ISO Standart",
  },
  {
    icon: Layers,
    title: "AI Destekli Akıllı Öneriler",
    description:
      "Profil kombinasyonları, ebat önerileri ve akıllı tamamlama özellikleri ile karar süreçlerinizi destekleyin. Machine learning algoritmaları ile geçmiş veri analizi yaparak sürekli öğrenen sistem.",
    badge: "AI Öneri",
  },
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  const ds = useDesignSystem();
  const { tokens } = useAdaptiveUIContext();

  return (
    <Box
      sx={{
        py: { xs: ds.spacing["5"], md: ds.spacing["6"] },
        background: ds.colors.surface.elevated1,
        position: "relative",
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
            md: "900px",
            lg: "1200px",
            xl: "1400px",
            "2xl": "1600px",
          },
        }}
      >
        {/* Section Header */}
        <FadeIn duration={0.4}>
          <Stack
            alignItems="center"
            spacing={ds.spacing["3"]}
            sx={{ mb: ds.spacing["6"] }}
          >
            <Badge variant="soft" color="primary">
              <Stack
                direction="row"
                spacing={ds.spacing["2"]}
                alignItems="center"
              >
                <AutoAwesome sx={{ fontSize: 14, color: ds.colors.primary.main }} />
                <Typography
                  sx={{
                    fontSize: tokens.typography.xs,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: ds.colors.text.secondary,
                  }}
                >
                  PLATFORM ÖZELLİKLERİ
                </Typography>
              </Stack>
            </Badge>

            <Typography
              variant="h2"
              sx={{
                fontSize: `clamp(${tokens.typography.xl * 1.2}px, 2.5vw + ${tokens.typography.base}px, ${tokens.typography.xxl * 1.3}px)`,
                fontWeight: 700,
                textAlign: "center",
                color: ds.colors.text.primary,
              }}
            >
              Sistem Yetenekleri
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: `clamp(${tokens.typography.base}px, 1vw + ${tokens.typography.base * 0.25}px, ${tokens.typography.lg}px)`,
                textAlign: "center",
                color: ds.colors.text.secondary,
                maxWidth: { xs: "100%", sm: "600px", md: "650px", lg: "750px" },
                lineHeight: 1.75,
                fontWeight: 400,
              }}
            >
              Endüstri 4.0 standartlarında geliştirilmiş, kapsamlı üretim optimizasyon platformu ile 
              iş süreçlerinizi dijitalleştirin ve verimliliği artırın.
            </Typography>
          </Stack>
        </FadeIn>

        {/* Feature Cards Grid */}
        <Grid 
          container 
          spacing={{ xs: ds.spacing["4"], sm: ds.spacing["5"], md: ds.spacing["6"] }}
        >
          {features.map((feature, index) => (
            <Grid key={feature.title} item xs={12} md={6} lg={4}>
              <FadeIn delay={0.05 * index} duration={0.3}>
                <CardV2
                  variant="elevated"
                  hoverable
                  sx={{
                    height: "100%",
                    transition: ds.transitions.base,

                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.lg,
                    },
                  }}
                >
                  <Stack spacing={ds.spacing["4"]}>
                    {/* Icon + Badge */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: `${ds.borderRadius.md}px`,
                          background: alpha(ds.colors.primary.main, 0.08),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: ds.transitions.base,
                        }}
                      >
                        <feature.icon
                          sx={{ fontSize: 24, color: ds.colors.primary.main }}
                        />
                      </Box>

                      <Badge variant="outline" color="primary">
                        <Typography
                          sx={{ fontSize: tokens.typography.xs, fontWeight: 600 }}
                        >
                          {feature.badge}
                        </Typography>
                      </Badge>
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: `clamp(${tokens.typography.lg}px, 1.5vw + ${tokens.typography.base * 0.5}px, ${tokens.typography.xl}px)`,
                        fontWeight: 600,
                        color: ds.colors.text.primary,
                        lineHeight: 1.4,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {feature.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: tokens.typography.sm, sm: tokens.typography.base },
                        color: ds.colors.text.secondary,
                        lineHeight: 1.65,
                        fontWeight: 400,
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
