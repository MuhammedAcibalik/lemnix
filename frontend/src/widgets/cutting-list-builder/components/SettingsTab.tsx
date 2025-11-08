/**
 * @fileoverview Settings Tab - Modern Edition
 * @module SettingsTab
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from 'react';
import {
  Stack,
  Typography,
  Alert,
  Box,
  alpha,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Design System v2.0
import { useDesignSystem } from '@/shared/hooks';
import { CardV2, FadeIn } from '@/shared';

export const SettingsTab: React.FC = () => {
  const ds = useDesignSystem();

  return (
    <FadeIn>
      <CardV2 variant="glass">
        <Box sx={{ p: ds.spacing['4'] }}>
          <Stack spacing={ds.spacing['4']}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={ds.spacing['2']}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: `${ds.borderRadius.lg}px`,
                  background: ds.gradients.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: ds.shadows.soft.sm,
                }}
              >
                <SettingsIcon sx={{ fontSize: 24, color: '#ffffff' }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: ds.colors.text.primary,
                    mb: 0.5,
                  }}
                >
                  Ayarlar ve Konfigürasyon
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8125rem',
                    color: ds.colors.text.secondary,
                  }}
                >
                  Sistem ayarlarını buradan yönetebilirsiniz
                </Typography>
              </Box>
            </Stack>

            {/* Info Alert */}
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                borderRadius: `${ds.borderRadius.lg}px`,
                background: alpha(ds.colors.primary.main, 0.05),
                border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                '& .MuiAlert-icon': {
                  color: ds.colors.primary.main,
                },
              }}
            >
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}>
                Geliştirilme Aşamasında
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: ds.colors.text.secondary }}>
                Bu bölüm yakında daha fazla özellik ile güncellenecek.
              </Typography>
            </Alert>
          </Stack>
        </Box>
      </CardV2>
    </FadeIn>
  );
};
