/**
 * @fileoverview Production Plan List Page - Main Plans Tab
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { Card } from '@/shared/ui/Card';
import { useProductionPlans, useProductionPlanMetrics, useDeleteProductionPlan, productionPlanApi, type ProductionPlan, type ProductionPlanMetrics, type ProductionPlanItem } from '@/entities/production-plan';
import { useQueryClient } from '@tanstack/react-query';
import { UploadDialog } from '@/widgets/production-plan-manager/ui/UploadDialog';
import { ProductionPlanTable } from '@/widgets/production-plan-manager/ui/ProductionPlanTable';
import { ProductionPlanFilters } from '@/widgets/production-plan-manager/ui/ProductionPlanFilters';
import { PlanMetrics } from '@/widgets/production-plan-manager/ui/PlanMetrics';
import type { ProductionPlanFilters as ProductionPlanFiltersType } from '@/entities/production-plan';

export const ProductionPlanListPage: React.FC = () => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const deleteMutation = useDeleteProductionPlan();

  const [filters, setFilters] = useState<ProductionPlanFiltersType>({
    status: 'active',
    page: 1,
    limit: 50
  });

  const { data: plansResponse, isLoading: plansLoading, error: plansError } = useProductionPlans(filters);
  const { data: metricsResponse, isLoading: metricsLoading } = useProductionPlanMetrics({
    weekNumber: filters.weekNumber,
    year: filters.year,
    status: filters.status
  });

  const plans: ProductionPlan[] = useMemo(() => {
    if (plansResponse?.success && Array.isArray(plansResponse.data)) {
      return plansResponse.data;
    }

    if (Array.isArray(plansResponse)) {
      return plansResponse;
    }

    return [];
  }, [plansResponse]);

  const metrics: ProductionPlanMetrics | undefined = metricsResponse;
  const availableItems: ProductionPlanItem[] = useMemo(() => plans.flatMap(plan => plan.items), [plans]);

  const handleFiltersChange = useCallback((newFilters: ProductionPlanFiltersType) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setUploadDialogOpen(false);
  }, []);

  const handleDeleteAllPlans = useCallback(async () => {
    if (!confirm('Tüm üretim planlarını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await productionPlanApi.deleteAllProductionPlans();

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['production-plan'] });
        queryClient.invalidateQueries({ queryKey: ['production-plan-metrics'] });
        setFilters(prev => ({ ...prev, page: 1 }));
      } else {
        alert('Planlar silinemedi.');
      }
    } catch (error) {
      alert('Planlar silinirken hata oluştu.');
    }
  }, [queryClient]);

  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 3, lg: 4 }, maxWidth: '1600px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: ds.palette.primary.main, mb: 1 }}>
            Üretim Planları
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Haftalık planlarınızı yönetin, filtreleyin ve detaylara hızlıca erişin.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteAllPlans}
            disabled={deleteMutation.isPending || plans.length === 0}
          >
            Tüm Planları Sil
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Plan Yükle
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 3 }}>
        <Card>
          <ProductionPlanFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={plansLoading}
          />
        </Card>

        <PlanMetrics
          metrics={metrics}
          isLoading={metricsLoading}
        />

        <ProductionPlanTable
          plans={plans}
          isLoading={plansLoading}
          error={plansError}
          availableItems={availableItems}
        />
      </Box>

      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </Box>
  );
};

export default ProductionPlanListPage;
