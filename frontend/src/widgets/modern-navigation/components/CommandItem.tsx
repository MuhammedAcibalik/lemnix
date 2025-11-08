/**
 * Command Item - Design System v2.0
 * Individual command item with clean styling
 */

import React from 'react';
import {
  Box,
  Typography,
  alpha,
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';
import type { CommandItem as CommandItemType } from '../types';

export interface CommandItemProps {
  item: CommandItemType;
  isSelected: boolean;
  onClick: () => void;
}

export const CommandItem: React.FC<CommandItemProps> = ({
  item,
  isSelected,
  onClick,
}) => {
  const ds = useDesignSystem();

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigasyon':
        return ds.colors.primary.main;
      case 'optimizasyon':
        return ds.colors.secondary.main;
      case 'raporlar':
        return ds.colors.accent.main;
      case 'ayarlar':
        return ds.colors.support.main;
      default:
        return ds.colors.neutral[600];
    }
  };

  const categoryColor = getCategoryColor(item.category);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 64,  // Optimal height
        gap: ds.spacing['3'],  // 12px
        px: ds.spacing['3'],  // 12px horizontal
        py: ds.spacing['2'],  // 8px vertical
        mx: 0,  // FULL WIDTH - margin kaldırıldı!
        borderRadius: `${ds.borderRadius.sm}px`,  // 8px → 6px
        cursor: 'pointer',
        border: `1px solid transparent`,
        transition: ds.transitions.fast,
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-1px)',  // Subtle lift
          backgroundColor: alpha(ds.colors.neutral[500], 0.06),
        },
        ...(isSelected && {
          backgroundColor: alpha(categoryColor, 0.08),  // Lighter selected bg
          border: `1px solid ${alpha(categoryColor, 0.15)}`,  // Subtle border
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: categoryColor,
            borderRadius: `0 ${ds.borderRadius.sm}px ${ds.borderRadius.sm}px 0`,
          }
        }),
      }}
      role="button"
      tabIndex={0}
      aria-label={`${item.title} - ${item.description}`}
    >
      {/* Icon - Compact */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,  // 48px → 40px
        height: 40,
        flexShrink: 0,
        borderRadius: `${ds.borderRadius.md}px`,
        backgroundColor: isSelected 
          ? alpha(categoryColor, 0.15)
          : alpha(ds.colors.neutral[500], 0.1),
        color: isSelected 
          ? categoryColor 
          : ds.colors.text.secondary,
        transition: ds.transitions.fast,
      }}>
        {React.createElement(item.icon, {
          sx: { fontSize: 20 }  // Optimal icon size
        })}
      </Box>

      {/* Content - Optimized Typography */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontSize: '0.875rem',  // 14px - primary text
            fontWeight: 500,  // medium
            color: ds.colors.text.primary,
            mb: '2px',  // Tight spacing
            lineHeight: 1.3,  // Tight line height
          }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.75rem',  // 12px - secondary text
            color: ds.colors.text.secondary,
            lineHeight: 1.4,
          }}
        >
          {item.description}
        </Typography>
      </Box>

      {/* Keyboard Shortcut - Compact Chips */}
      {item.shortcut && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',  // Very tight gap
          flexShrink: 0,
        }}>
          {item.shortcut.split('+').map((key, index) => (
            <Box
              key={index}
              sx={{
                height: 20,  // Compact chip
                px: ds.spacing['1'],  // 4px
                py: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(ds.colors.neutral[500], 0.1),
                color: ds.colors.text.secondary,
                borderRadius: `${ds.borderRadius.xs}px`,
                fontSize: '0.625rem',  // 10px
                fontWeight: ds.typography.fontWeight.medium,
                fontFamily: ds.typography.fontFamily.mono,
                border: `1px solid ${alpha(ds.colors.neutral[400], 0.2)}`,
                minWidth: 18,
                textAlign: 'center',
              }}
            >
              {key.trim()}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};