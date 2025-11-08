import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { appConfig, getFullDomain } from '../config/legacy/appConfig';

interface DomainIndicatorProps {
  variant?: 'compact' | 'full';
  showInDevelopment?: boolean;
}

export const DomainIndicator: React.FC<DomainIndicatorProps> = ({ 
  variant = 'compact',
  showInDevelopment = true 
}) => {
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Development'da gösterme
  if (isDevelopment && !showInDevelopment) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1200,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(26, 35, 126, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Chip
        label={isDevelopment ? 'DEV' : 'PROD'}
        size="small"
        sx={{
          backgroundColor: isDevelopment ? '#ff9800' : '#4caf50',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600,
          height: 20,
        }}
      />
      
      {variant === 'full' ? (
        <Typography
          variant="caption"
          sx={{
            color: '#1a237e',
            fontWeight: 600,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
          }}
        >
          {getFullDomain()}
        </Typography>
      ) : (
        <Typography
          variant="caption"
          sx={{
            color: '#1a237e',
            fontWeight: 600,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
          }}
        >
          {appConfig.domain}
        </Typography>
      )}
    </Box>
  );
};
