/**
 * @fileoverview Header Section Component
 * @module EnterpriseOptimizationForm/Components/HeaderSection
 * @version 1.0.0
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

export const HeaderSection: React.FC = () => {
  return (
    <Card
      variant="outlined" 
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <SettingsIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}>
              Enterprise Optimizasyon Formu
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gelişmiş optimizasyon parametrelerini yapılandırın
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
