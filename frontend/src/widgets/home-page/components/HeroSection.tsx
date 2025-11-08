/**
 * @fileoverview Hero Section v2.0 - Modern Industrial
 * @description Stunning hero with glassmorphism and animations
 * @version 2.0.0 - Full Transform
 */

import React from 'react';
import { Box, Typography, Container, Grid, Stack, alpha } from '@mui/material';
import {
  TrendingUp, 
  Speed, 
  Security, 
  Analytics,
  Engineering,
  PrecisionManufacturing,
  AutoAwesome,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { FadeIn, ScaleIn, Stagger, Badge, GradientButton, SecondaryButtonV2 } from '@/shared';

interface HeroSectionProps {
  onDemoStart?: () => void;
  onExcelImport?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onDemoStart, 
  onExcelImport 
}) => {
  const ds = useDesignSystem();
  
  return (
        <Box
          sx={{
            minHeight: { xs: '65vh', md: '70vh' },
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            
            // Mesh gradient background
            background: `
              ${ds.gradients.mesh.primary},
              linear-gradient(180deg, ${ds.colors.surface.base} 0%, ${ds.colors.surface.elevated2} 100%)
            `,
            
            // Animated gradient overlay
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: ds.gradients.mesh.subtle,
              animation: 'meshFlow 15s ease-in-out infinite',
              opacity: 0.6,
            },
            
            // Subtle grid pattern
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(${alpha(ds.colors.neutral[300], 0.3)} 1px, transparent 1px),
                linear-gradient(90deg, ${alpha(ds.colors.neutral[300], 0.3)} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              opacity: 0.3,
              pointerEvents: 'none',
            },
            
            '@keyframes meshFlow': {
              '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: 0.6 },
              '50%': { transform: 'scale(1.05) rotate(2deg)', opacity: 0.8 },
            },
          }}
        >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: ds.spacing['4'], pb: ds.spacing['8'] }}>
        {/* Header Content */}
        <FadeIn direction="down" duration={0.6}>
          <Stack alignItems="center" spacing={ds.spacing['4']}>
            {/* System Badge - KOMPAKT */}
            <ScaleIn delay={0.2} duration={0.4}>
              <Badge variant="soft" color="success">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                  <AutoAwesome sx={{ fontSize: 12 }} />
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em' }}>
                    PRODUCTION OPTIMIZATION SYSTEM
                  </Typography>
                </Box>
              </Badge>
            </ScaleIn>

            {/* Main Headline - KOMPAKT */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
                  fontWeight: 800,
                  background: ds.gradients.premium,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: ds.spacing['3'],
                  lineHeight: 1.1,
                }}
              >
                LEMNİX
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  maxWidth: '700px',
                  mx: 'auto',
                  mb: ds.spacing['2'],
                }}
              >
                Alüminyum Profil Kesiminde Endüstri Devrimi
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  color: ds.colors.text.secondary,
                  maxWidth: '750px',
                  mx: 'auto',
                  mb: ds.spacing['6'],
                  lineHeight: 1.6,
                }}
              >
                AI destekli optimizasyon ile %92+ verimlilik. WebGPU hızlandırma, 
                4 algoritma ve gerçek zamanlı analiz.
              </Typography>
            </Box>

            {/* CTA Buttons - INTERNAL TOOL */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={ds.spacing['2']}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <GradientButton
                size="medium"
                onClick={onDemoStart}
                startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
                sx={{ px: ds.spacing['6'] }}
              >
                Optimizasyona Başla
              </GradientButton>
              
              <SecondaryButtonV2
                size="medium"
                onClick={onExcelImport}
                sx={{ px: ds.spacing['6'] }}
              >
                Akıllı Kesim Listesi Oluştur
              </SecondaryButtonV2>
            </Stack>
          </Stack>
        </FadeIn>

        {/* Metrics Grid - KOMPAKT */}
        <FadeIn delay={0.4} duration={0.6}>
          <Stagger staggerDelay={0.1}>
            <Grid container spacing={ds.spacing['3']} sx={{ mt: ds.spacing['8'] }}>
              {[
                { value: '92%+', label: 'Ortalama Verimlilik', icon: TrendingUp, color: ds.colors.success.main },
                { value: '<2 sn', label: 'Optimizasyon Süresi', icon: Speed, color: ds.colors.primary.main },
                { value: '35%', label: 'Maliyet Tasarrufu', icon: Analytics, color: ds.colors.accent.main },
                { value: '4', label: 'Optimizasyon Algoritması', icon: Engineering, color: ds.colors.support.main },
              ].map((metric) => (
                <Grid key={metric.label} item xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: ds.spacing['4'],
                      background: ds.glass.background,
                      border: ds.glass.border,
                      borderRadius: `${ds.borderRadius.lg}px`,
                      backdropFilter: ds.glass.backdropFilter,
                      boxShadow: ds.shadows.soft.sm,
                      transition: ds.transitions.all,
                      position: 'relative',
                      overflow: 'hidden',
                      
                      // Gradient accent on top
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: metric.color,
                        opacity: 0.6,
                      },
                      
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: ds.shadows.soft.md,
                        borderColor: alpha(metric.color, 0.3),
                        
                        '& .metric-icon': {
                          transform: 'scale(1.1) rotate(3deg)',
                        },
                      },
                    }}
                  >
                    <Stack spacing={ds.spacing['2']}>
                      {/* Icon - KOMPAKT */}
                      <Box
                        className="metric-icon"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: `${ds.borderRadius.md}px`,
                          background: alpha(metric.color, 0.1),
                          border: `1.5px solid ${alpha(metric.color, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: ds.transitions.spring,
                        }}
                      >
                        <metric.icon sx={{ fontSize: 20, color: metric.color }} />
                      </Box>
                      
                      {/* Value - KOMPAKT */}
                      <Typography
                        sx={{
                          fontSize: { xs: '1.5rem', lg: '1.75rem' },
                          fontWeight: 800,
                          color: ds.colors.text.primary,
                          lineHeight: 1,
                        }}
                      >
                        {metric.value}
                      </Typography>
                      
                      {/* Label - KOMPAKT */}
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: ds.colors.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        {metric.label}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stagger>
        </FadeIn>

        {/* System Features - KOMPAKT */}
        <FadeIn delay={0.6} duration={0.6}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }}
            spacing={ds.spacing['2']}
            justifyContent="center"
            sx={{ mt: ds.spacing['8'] }}
          >
            {[
              { text: 'Güvenli Veri İşleme', icon: Security },
              { text: 'Endüstriyel Standartlar', icon: PrecisionManufacturing },
              { text: 'Kanıtlanmış Sonuçlar', icon: Analytics },
            ].map((item) => (
              <Box 
                key={item.text}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: ds.spacing['2'],
                  px: ds.spacing['3'],
                  py: ds.spacing['1'],
                  borderRadius: `${ds.borderRadius.full}px`,
                  background: alpha(ds.colors.surface.base, 0.6),
                  border: `1px solid ${alpha(ds.colors.neutral[300], 0.5)}`,
                  transition: ds.transitions.base,
                  
                  '&:hover': {
                    background: ds.colors.surface.base,
                    borderColor: ds.colors.primary.light,
                    transform: 'translateY(-1px)',
                    boxShadow: ds.shadows.soft.sm,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: ds.borderRadius.full,
                    background: alpha(ds.colors.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <item.icon sx={{ fontSize: 14, color: ds.colors.primary.main }} />
                </Box>
                <Typography 
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: ds.colors.text.primary,
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </FadeIn>
      </Container>
    </Box>
  );
};

export default HeroSection;
