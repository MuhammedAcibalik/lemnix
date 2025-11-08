/**
 * @fileoverview New Cutting List Section - Professional UX
 * @module NewCuttingListSection
 * @version 3.0.0 - UX-First Design
 * 
 * UX FIXES:
 * ✅ Vertical form layout - Better mobile UX
 * ✅ Clear visual hierarchy - Title > Fields > Action
 * ✅ Proper field sizing - No awkward widths
 * ✅ Smart spacing - Breathing room
 */

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  TextField,
  Button,
  alpha,
} from '@mui/material';
import { Add as AddIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { LoadingState } from '../types';

// Design System v2.0
import { useDesignSystem } from '@/shared/hooks';
import { CardV2 } from '@/shared';

interface NewCuttingListSectionProps {
  title: string;
  selectedWeekNumber: number;
  currentWeekNumber: number;
  loadingState: LoadingState;
  onTitleChange: (title: string) => void;
  onWeekNumberChange: (weekNumber: number) => void;
  onCreateList: () => Promise<void>;
}

export const NewCuttingListSection: React.FC<NewCuttingListSectionProps> = ({
  title,
  selectedWeekNumber,
  currentWeekNumber,
  loadingState,
  onTitleChange,
  onWeekNumberChange,
  onCreateList
}) => {
  const ds = useDesignSystem();
  
  return (
    <CardV2 
      variant="glass" 
      sx={{ 
        mb: ds.spacing['3'],
        border: `1px solid ${ds.colors.neutral[300]}`,
      }}
    >
      <Box sx={{ p: ds.spacing['2'] }}>
        {/* Header - Compact */}
        <Stack direction="row" alignItems="center" spacing={ds.spacing['2']} sx={{ mb: ds.spacing['4'] }}>
          <Box sx={{ 
            width: 36, 
            height: 36, 
            background: ds.gradients.primary,
            borderRadius: `${ds.borderRadius.md}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: ds.shadows.soft.sm,
          }}>
            <AddIcon sx={{ fontSize: ds.componentSizes.icon.medium, color: ds.colors.text.inverse }} />
          </Box>
          <Box>
            <Typography 
              sx={{ 
                fontWeight: 700,
                color: ds.colors.text.primary,
                fontSize: '1rem',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Yeni Kesim Listesi
            </Typography>
            <Typography 
              sx={{ 
                color: ds.colors.text.secondary,
                fontSize: '0.75rem',
              }}
            >
              Hafta seçip liste oluşturun
            </Typography>
          </Box>
        </Stack>
        
        {/* VERTICAL FORM - Better UX */}
        <Stack spacing={ds.spacing['3']}>
          {/* Week Number - Full Width */}
          <TextField
            label="Hafta Numarası"
            type="number"
            value={selectedWeekNumber}
            onChange={(e) => onWeekNumberChange(parseInt(e.target.value) || currentWeekNumber)}
            inputProps={{ min: 1, max: 53 }}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <CalendarIcon sx={{ mr: ds.spacing['1'], fontSize: ds.componentSizes.icon.medium, color: ds.colors.primary.main }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: '#fff',
                borderRadius: `${ds.borderRadius.md}px`,
              }
            }}
          />

          {/* Title - Full Width, Read-only */}
          <TextField
            label="Liste Başlığı"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Otomatik oluşturulur"
            InputProps={{ readOnly: true }}
            size="small"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                background: alpha(ds.colors.neutral[100], 0.5),
                borderRadius: `${ds.borderRadius.md}px`,
              }
            }}
          />

          {/* Action Button - Enhanced Design System v2.0 */}
          <Button
            fullWidth
            size="large"
            onClick={onCreateList}
            disabled={loadingState === LoadingState.LOADING || !title.trim()}
            startIcon={loadingState === LoadingState.LOADING ? (
              <CircularProgress 
                size={18} 
                sx={{ color: 'inherit' }}
              />
            ) : (
              <AddIcon sx={{ fontSize: ds.componentSizes.icon.sm }} />
            )}
            sx={{
              height: 52, // Slightly taller for better presence
              background: ds.gradients.primary,
              color: 'white',
              borderRadius: `${ds.borderRadius.button}px`, // Use button-specific radius
              fontSize: '0.9375rem', // Slightly larger text
              fontWeight: ds.typography.fontWeight.semibold, // Use design system weight
              textTransform: 'none',
              letterSpacing: ds.typography.letterSpacing.tight, // Better typography
              boxShadow: ds.shadows.soft.md, // Start with more prominent shadow
              position: 'relative',
              overflow: 'hidden',
              
              // Enhanced hover effects
              '&:hover': {
                background: ds.gradients.primary,
                opacity: 0.95,
                transform: 'translateY(-2px)', // More pronounced lift
                boxShadow: ds.shadows.soft.xl, // Stronger shadow on hover
                '&::before': {
                  opacity: 1,
                }
              },
              
              // Active state
              '&:active': {
                transform: 'translateY(-1px)',
                boxShadow: ds.shadows.soft.lg,
              },
              
              // Disabled state
              '&:disabled': {
                background: ds.colors.neutral[200],
                color: ds.colors.neutral[500],
                transform: 'none',
                boxShadow: 'none',
                cursor: 'not-allowed',
              },
              
              // Smooth transitions
              transition: ds.transitions.base,
              
              // Subtle shimmer effect (optional enhancement)
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: ds.transitions.base,
                opacity: 0,
              },
              
              // Focus state for accessibility
              '&:focus-visible': {
                outline: `2px solid ${ds.colors.primary.main}`,
                outlineOffset: '2px',
              }
            }}
          >
            {loadingState === LoadingState.LOADING ? 'Oluşturuluyor...' : 'Kesim Listesi Oluştur'}
          </Button>
        </Stack>
      </Box>
    </CardV2>
  );
};
