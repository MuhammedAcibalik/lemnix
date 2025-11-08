/**
 * @fileoverview Cutting List Details - Enterprise UX
 * @module CuttingListDetails
 * @version 3.0.0 - Final UX Polish
 */

import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Category as CategoryIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

import { useDesignSystem, Permission, usePermissions } from '@/shared/hooks';
import { CardV2, FadeIn, ScaleIn } from '@/shared';
import { CuttingList, ProductSection, WorkOrderItem, LoadingState } from '../types';
import { ProductSection as ProductSectionComponent } from './ProductSection';
import { ProductDetailsDialog } from './ProductDetailsDialog';

interface CuttingListDetailsProps {
  cuttingList: CuttingList;
  loadingState: LoadingState;
  onAddProduct: () => void;
  onExportPDF: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  onBackToList: () => void;
  onAddItem: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: WorkOrderItem) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onCopyItem: (item: WorkOrderItem) => void;
}

export const CuttingListDetails: React.FC<CuttingListDetailsProps> = ({
  cuttingList,
  loadingState,
  onAddProduct,
  onExportPDF,
  onExportExcel,
  onBackToList,
  onAddItem,
  onDeleteSection,
  onEditItem,
  onDeleteItem,
  onCopyItem
}) => {
  const ds = useDesignSystem();
  const [selectedSection, setSelectedSection] = useState<ProductSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // ✅ P1-4: RBAC Permission Checks
  const { hasPermission } = usePermissions();
  const canExport = hasPermission(Permission.EXPORT_REPORTS);
  const canManage = hasPermission(Permission.START_OPTIMIZATION); // Planner+ can manage

  const handleViewDetails = (section: ProductSection) => {
    setSelectedSection(section);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSection(null);
  };

  if (!cuttingList) return null;

  const totalItems = cuttingList.sections.reduce((acc, section) => acc + section.items.length, 0);

  return (
    <FadeIn>
      <Stack spacing={ds.spacing['2']}>
        {/* COMPACT STICKY HEADER */}
        <CardV2 
          variant="glass" 
          sx={{ 
            p: ds.spacing['2'],
            border: `1px solid ${ds.colors.neutral[300]}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={ds.spacing['2']}>
              <IconButton
                onClick={onBackToList}
                size="small"
                sx={{
                  background: alpha(ds.colors.neutral[100], 0.8),
                  color: ds.colors.text.secondary,
                  '&:hover': {
                    background: alpha(ds.colors.neutral[200], 0.8),
                  },
                }}
              >
                <BackIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
              </IconButton>
              
              <Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: ds.colors.text.primary, lineHeight: 1, mb: 0.5 }}>
                  {cuttingList.title}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
                  {cuttingList.sections.length} bölüm • {totalItems} öğe
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={ds.spacing['1']}>
              {/* ✅ P1-4: Export buttons - permission protected */}
              {canExport && (
                <Tooltip title="PDF" arrow>
                  <IconButton
                    onClick={onExportPDF}
                    size="small"
                    sx={{
                      color: ds.colors.error.main,
                      '&:hover': {
                        background: alpha(ds.colors.error.main, 0.1),
                      },
                    }}
                  >
                    <PdfIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
                  </IconButton>
                </Tooltip>
              )}
              
              {canExport && (
                <Tooltip title="Excel" arrow>
                  <IconButton
                    onClick={onExportExcel}
                    size="small"
                    sx={{
                      color: ds.colors.success.main,
                      '&:hover': {
                        background: alpha(ds.colors.success.main, 0.1),
                      },
                    }}
                  >
                    <ExcelIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* ✅ P1-4: Add product - permission protected (Planner+) */}
              {canManage && (
                <Tooltip title="Yeni Ürün" arrow>
                  <IconButton
                    onClick={onAddProduct}
                    size="small"
                    sx={{
                      background: ds.gradients.primary,
                      color: ds.colors.text.inverse,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: ds.shadows.soft.sm,
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </CardV2>

        {/* CONTENT */}
        {cuttingList.sections.length === 0 ? (
          <ScaleIn delay={100}>
            <CardV2 variant="glass" sx={{ p: ds.spacing['4'], textAlign: 'center' }}>
              <CategoryIcon sx={{ fontSize: 48, color: ds.colors.neutral[400], mb: ds.spacing['3'] }} />
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: ds.colors.text.primary, mb: 0.5 }}>
                Henüz ürün bölümü yok
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: ds.colors.text.secondary }}>
                "Yeni Ürün" butonunu kullanarak başlayın
              </Typography>
            </CardV2>
          </ScaleIn>
        ) : (
          <Stack spacing={ds.spacing['2']}>
            {cuttingList.sections.map((section) => (
              <ScaleIn key={section.id} delay={0}>
                <ProductSectionComponent
                  section={section}
                  onAddItem={onAddItem}
                  onEditItem={onEditItem}
                  onDeleteItem={onDeleteItem}
                  onCopyItem={onCopyItem}
                  onViewDetails={handleViewDetails}
                />
              </ScaleIn>
            ))}
          </Stack>
        )}

        {selectedSection && (
      <ProductDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
            section={selectedSection}
        onEditItem={onEditItem}
      />
        )}
      </Stack>
    </FadeIn>
  );
};
