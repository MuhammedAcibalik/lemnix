/**
 * @fileoverview Product Section Card - Modern Edition
 * @module ProductSection
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from 'react';
import {
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Design System v2.0
import { useDesignSystem } from '@/shared/hooks';
import { CardV2 } from '@/shared';
import { ProductSection as ProductSectionType, WorkOrderItem as WorkOrderItemType } from '../types';

interface ProductSectionProps {
  section: ProductSectionType;
  onAddItem: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: WorkOrderItemType) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onCopyItem: (item: WorkOrderItemType) => void;
  onViewDetails?: (section: ProductSectionType) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  section,
  onAddItem,
  onViewDetails,
}) => {
  const ds = useDesignSystem();

  const totalQuantity = section.items.reduce((sum, item) => sum + (item.orderQuantity || 0), 0);

  return (
    <CardV2
      variant="glass"
      sx={{
        transition: ds.transitions.base,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: ds.shadows.soft.md,
          borderColor: ds.colors.primary.main,
        },
      }}
    >
      <Box sx={{ p: ds.spacing['3'] }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={ds.spacing['2']}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: `${ds.borderRadius.md}px`,
                background: ds.gradients.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              <CategoryIcon sx={{ fontSize: ds.componentSizes.icon.medium, color: ds.colors.text.inverse }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: 0.5,
                }}
              >
                {section.productName}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<AssignmentIcon sx={{ fontSize: ds.componentSizes.icon.small }} />}
                  label={`${section.items.length} iş emri`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    background: alpha(ds.colors.primary.main, 0.1),
                    color: ds.colors.primary.main,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                  }}
                />
                {totalQuantity > 0 && (
                  <Chip
                    label={`${totalQuantity.toLocaleString()} adet`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      background: alpha(ds.colors.success.main, 0.1),
                      color: ds.colors.success.main,
                      border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={ds.spacing['1']}>
            <Tooltip title="Detayları Gör" arrow>
              <IconButton
                onClick={() => onViewDetails?.(section)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: `${ds.borderRadius.md}px`,
                  background: alpha(ds.colors.primary.main, 0.1),
                  color: ds.colors.primary.main,
                  '&:hover': {
                    background: alpha(ds.colors.primary.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: ds.transitions.fast,
                }}
              >
                <VisibilityIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="İş Emri Ekle" arrow>
              <IconButton
                onClick={() => onAddItem(section.id)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: `${ds.borderRadius.md}px`,
                  background: alpha(ds.colors.success.main, 0.1),
                  color: ds.colors.success.main,
                  '&:hover': {
                    background: alpha(ds.colors.success.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: ds.transitions.fast,
                }}
              >
                <AddIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </CardV2>
  );
};
