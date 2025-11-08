/**
 * @fileoverview Production Plan List Page - Main Plans Tab
 * @module pages/production-plan-list-page
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
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
  
  // Delete mutation
  const deleteMutation = useDeleteProductionPlan();
  
  const [filters, setFilters] = useState<ProductionPlanFiltersType>({
    status: 'active',
    page: 1,
    limit: 50
  });

  // ✅ PERFORMANCE: Optimized cache strategy - only clear on first load
  useEffect(() => {
    // Only clear cache on initial page load, not on every render
    const hasClearedCache = sessionStorage.getItem('production-plan-cache-cleared');
    
    if (!hasClearedCache) {
      // Clear React Query cache
      queryClient.removeQueries({ queryKey: ['production-plan'] });
      
      // Mark cache as cleared for this session
      sessionStorage.setItem('production-plan-cache-cleared', 'true');
      
      console.log('🧹 Cache cleared on initial load - using optimized caching');
    }
  }, [queryClient]);

  // Queries
  const { data: plansResponse, isLoading: plansLoading, error: plansError } = useProductionPlans(filters);
  const { data: metricsResponse, isLoading: metricsLoading } = useProductionPlanMetrics({
    weekNumber: filters.weekNumber,
    year: filters.year,
    status: filters.status
  });

  // Extract data from API response
  const plans: ProductionPlan[] = (() => {
    // ✅ SECURITY: Debug logs only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Parse Debug:', {
        hasSuccess: plansResponse?.success,
        hasData: !!plansResponse?.data,
        isArray: Array.isArray(plansResponse?.data),
        dataLength: plansResponse?.data?.length
      });
    }
    
    if (plansResponse?.success && Array.isArray(plansResponse.data)) {
      return plansResponse.data;
    }
    
    // Fallback: if response exists but format is different
    if (plansResponse && Array.isArray(plansResponse)) {
      return plansResponse;
    }
    
    return [];
  })();
  const metrics: ProductionPlanMetrics | undefined = metricsResponse;

  // Get all available items for cutting list creation
  const availableItems: ProductionPlanItem[] = plans.flatMap(plan => plan.items);

  // Debug logging
  console.log('🔍 Production Plan Debug:', {
    plansResponse: plansResponse ? 'Response received' : 'No response',
    plansResponseSuccess: plansResponse?.success,
    plansResponseData: plansResponse?.data,
    plansResponseDataType: typeof plansResponse?.data,
    plansResponseDataIsArray: Array.isArray(plansResponse?.data),
    plansLength: plans.length,
    plansLoading,
    plansError: plansError ? 'Error occurred' : 'No error',
    isEmpty: !plansLoading && plans.length === 0 && !plansError,
    rawPlansResponse: plansResponse
  });

  // EXTRA DEBUG: Check if data is coming from somewhere else
  console.log('🚨 EXTRA DEBUG - Data Source Check:', {
    plansFromResponse: plansResponse?.data,
    plansFromFallback: plansResponse && Array.isArray(plansResponse) ? plansResponse : 'Not fallback',
    finalPlans: plans,
    plansSource: plans.length > 0 ? 'DATA FOUND' : 'NO DATA',
    windowLocation: window.location.href,
    currentPage: 'production-plan-list-page'
  });

  const handleFiltersChange = (newFilters: ProductionPlanFiltersType) => {
    console.log('🔍 Filter Change Debug:', {
      currentFilters: filters,
      newFilters,
      mergedFilters: { ...filters, ...newFilters, page: 1 }
    });
    
    // Force cache invalidation when filters change
    queryClient.invalidateQueries({ queryKey: ['production-plan'] });
    queryClient.removeQueries({ queryKey: ['production-plan'] }); // Remove all cached data
    
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    // Mutation onSuccess will handle cache invalidation
  };

  const handleDeleteAllPlans = async () => {
    if (confirm('Tüm üretim planlarını silmek istediğinizden emin misiniz?')) {
      try {
        // Call backend to delete all plans directly
        const response = await productionPlanApi.deleteAllProductionPlans();
        
        if (response.success) {
          console.log('🗑️ DELETE SUCCESS - Starting cache clearing...');
          
          // ULTRA AGGRESSIVE CACHE CLEARING - Force immediate UI update
          queryClient.clear(); // Clear ALL cache first
          console.log('🧹 Cache cleared');
          
          // Remove specific queries
          queryClient.removeQueries({ queryKey: ['production-plan'] });
          queryClient.removeQueries({ queryKey: ['production-plan-metrics'] });
          console.log('🗑️ Queries removed');
          
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['production-plan'] });
          queryClient.invalidateQueries({ queryKey: ['production-plan-metrics'] });
          console.log('🔄 Queries invalidated');
          
          // Force immediate refetch
          const refetchResult = await queryClient.refetchQueries({ queryKey: ['production-plan'] });
          console.log('🔄 Refetch result:', refetchResult);
          
          // Force state update
          setFilters(prev => ({ ...prev, page: 1 }));
          
          // Cache clearing successful - no need for page reload
          
          alert(`Tüm üretim planları başarıyla silindi! (${response.count} plan silindi)`);
        } else {
          alert(`Silme işleminde hata oluştu: ${response.message}`);
        }
      } catch (error) {
        console.error('Delete all error:', error);
        alert('Silme işleminde hata oluştu!');
      }
    }
  };

  // Empty state
  if (!plansLoading && plans.length === 0 && !plansError) {
    return (
      <Box
        sx={{
          p: ds.spacing['4'],
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: ds.spacing['3']
        }}
      >
        <CloudUploadIcon 
          sx={{ 
            fontSize: 64, 
            color: theme.palette.grey[400],
            mb: ds.spacing['2']
          }} 
        />
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.grey[600],
            mb: ds.spacing['1']
          }}
        >
          Henüz üretim planı yüklenmedi
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.grey[500],
            textAlign: 'center',
            maxWidth: 400,
            mb: ds.spacing['4']
          }}
        >
          Excel dosyasını yükleyerek haftalık üretim planınızı sisteme aktarın
        </Typography>
        <Button
          variant="contained"
          size="medium"
          startIcon={<CloudUploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            background: ds.gradients.primary,
            px: ds.spacing['4'],
            py: ds.spacing['2'],
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: ds.borderRadius['md'],
            boxShadow: ds.shadows.md,
            '&:hover': {
              boxShadow: ds.shadows.lg,
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          İlk Planı Yükle
        </Button>
        
        {/* Upload Dialog */}
        <UploadDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[50],
        overflow: 'hidden',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        '&': {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        '& *': {
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
      }}
    >
      {/* Header - Compact */}
      <Box
        component="div"
        sx={{
          mb: ds.spacing['2'],
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: ds.spacing['1']
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              background: ds.gradients.primary,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: ds.spacing['1']
            }}
          >
            Üretim Planları
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[600],
              fontSize: '0.75rem'
            }}
          >
            Haftalık üretim planlarını yönetin ve takip edin
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: ds.spacing['2'] }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              background: ds.gradients.primary,
              px: ds.spacing['3'],
              py: ds.spacing['1'],
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: ds.borderRadius['sm'],
              boxShadow: ds.shadows.sm,
              '&:hover': {
                boxShadow: ds.shadows.md,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Yeni Plan Yükle
          </Button>
          
          {plans.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeleteAllPlans}
              disabled={deleteMutation.isPending}
              sx={{
                px: ds.spacing['3'],
                py: ds.spacing['1'],
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: ds.borderRadius['sm'],
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  backgroundColor: theme.palette.error.light + '20',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {deleteMutation.isPending ? 'Siliniyor...' : `Tümünü Sil (${plans.length})`}
            </Button>
          )}
        </Box>
      </Box>

      {/* Metrics */}
      {metrics && (
        <Box sx={{ mb: ds.spacing['3'] }}>
          <PlanMetrics metrics={metrics} loading={metricsLoading} />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ mb: ds.spacing['3'] }}>
        <Card variant="outlined">
          <ProductionPlanFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </Card>
      </Box>

      {/* Table */}
      <Card variant="outlined">
        <ProductionPlanTable
          plans={plans}
          loading={plansLoading}
          error={plansError}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </Card>

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </Box>
  );
};

export default ProductionPlanListPage;
