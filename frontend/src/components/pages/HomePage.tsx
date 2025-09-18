import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Chip, Button, Grid } from '@mui/material';
import {
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Savings as SavingsIcon,
  Engineering as EngineeringIcon,
  List as ListIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { responsiveSpacing, colors, typography, gradients, shadows, borderRadius } from '../../theme/designSystem';
import { gridSpacing, gridSizes, responsive, layouts } from '../../theme/responsiveUtils';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: responsiveSpacing.page }}>
      {/* Hero Section */}
      <Box sx={{ mb: responsiveSpacing.section, textAlign: 'center' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: typography.fontWeight.bold,
            background: gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            fontSize: { xs: typography.fontSize['4xl'], md: typography.fontSize['5xl'], lg: '3.5rem' },
          }}
        >
          LEMNİX
        </Typography>
        <Typography
          variant="h5"
          sx={{ 
            mb: 3, 
            fontWeight: typography.fontWeight.medium,
            fontSize: { xs: typography.fontSize.lg, md: typography.fontSize.xl, lg: typography.fontSize['2xl'] },
            color: colors.neutral[500]
          }}
        >
          Alüminyum Kesim Optimizasyonu Platformu
        </Typography>
        <Typography
          variant="body1"
          sx={{ 
            fontSize: { xs: typography.fontSize.base, md: typography.fontSize.lg, lg: typography.fontSize.xl }, 
            maxWidth: 800, 
            mx: 'auto', 
            lineHeight: typography.lineHeight.loose,
            color: colors.neutral[500],
            px: responsiveSpacing.component
          }}
        >
          Excel dosyalarınızdan kesim listelerini otomatik olarak analiz edin, 
          en verimli kesim planlarını oluşturun ve malzeme fire oranını minimize edin.
        </Typography>
      </Box>

      {/* Özellikler */}
      <Grid container spacing={gridSpacing.normal} sx={{ mb: responsive.margin(6) }}>
        <Grid {...gridSizes.featureCard}>
                      <Card
              elevation={0}
              sx={{
                height: '100%',
                background: gradients.card,
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: borderRadius.md,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: shadows.xl,
                  border: `1px solid ${colors.primary[900]}1A`, // 10% opacity
                },
              }}
            >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <SpeedIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Hızlı Analiz
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Excel dosyalarınızı saniyeler içinde analiz eder ve kesim listelerini otomatik olarak çıkarır.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(26, 35, 126, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AnalyticsIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Akıllı Optimizasyon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gelişmiş algoritmalar ile en verimli kesim planlarını oluşturur ve fire oranını minimize eder.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(26, 35, 126, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <SavingsIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Maliyet Tasarrufu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Malzeme fire oranını %95'in üzerinde verimlilikle optimize ederek maliyetleri düşürür.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(26, 35, 126, 0.1)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <EngineeringIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Profesyonel Çözüm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alüminyum kesim sektörü için özel olarak tasarlanmış, kullanıcı dostu arayüz.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nasıl Çalışır */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1a237e',
            mb: 3,
            textAlign: 'center',
          }}
        >
          Nasıl Çalışır?
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Chip
                label="1"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: '#ffffff',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Excel Dosyası Yükleyin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kesim listesi Excel dosyanızı sisteme yükleyin. Sistem otomatik olarak ürünleri ve ölçüleri analiz eder.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Chip
                label="2"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: '#ffffff',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Ürün Seçin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analiz edilen ürünler arasından optimizasyon yapmak istediğiniz ürünleri seçin.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Chip
                label="3"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: '#ffffff',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Optimizasyon Yapın
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Parametrelerinizi ayarlayın ve en verimli kesim planını oluşturun.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* İstatistikler */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          borderRadius: 3,
          color: '#ffffff',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: 'center',
          }}
        >
          Neden Lemnix?
        </Typography>
        
        <Grid container spacing={4} sx={{ textAlign: 'center' }}>
          <Grid item xs={12} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              %95+
            </Typography>
            <Typography variant="body1">
              Ortalama Verimlilik
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              &lt; 1dk
            </Typography>
            <Typography variant="body1">
              Analiz Süresi
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              %40
            </Typography>
            <Typography variant="body1">
              Maliyet Tasarrufu
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              48+
            </Typography>
            <Typography variant="body1">
              Ürün Tipi Desteği
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Başlangıç Adımları */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          borderRadius: 3,
          mt: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#1a237e',
            mb: 3,
            textAlign: 'center',
          }}
        >
          Hızlı Başlangıç Rehberi
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Chip
                label="1"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: '#ffffff',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                Excel Dosyası Yükleyin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                İş emri listesi içeren Excel dosyanızı "Optimizasyon" sayfasından yükleyin.
              </Typography>
              <Typography variant="caption" sx={{ 
                bgcolor: 'rgba(26, 35, 126, 0.1)', 
                color: '#1a237e', 
                px: 2, 
                py: 1, 
                borderRadius: 1,
                display: 'inline-block'
              }}>
                💡 Excel formatı: Ürün adı, İş emri ID, Profil tipi, Ölçü, Adet
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Chip
                label="2"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: '#ffffff',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                Optimizasyon Yapın
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ürünleri seçin, algoritma belirleyin ve en verimli kesim planını oluşturun.
              </Typography>
              <Typography variant="caption" sx={{ 
                bgcolor: 'rgba(26, 35, 126, 0.1)', 
                color: '#1a237e', 
                px: 2, 
                py: 1, 
                borderRadius: 1,
                display: 'inline-block'
              }}>
                ⚡ FFD algoritması önerilir - hızlı ve etkili
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Chip
                label="3"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  color: '#ffffff',
                  mb: 2,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
                Manuel Liste Oluşturun
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Excel dosyası olmadan manuel olarak kesim listesi oluşturun ve yönetin.
              </Typography>
              <Button
                variant="contained"
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cutting-list')}
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1a237e 100%)',
                  }
                }}
              >
                Kesim Listesi Oluştur
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
