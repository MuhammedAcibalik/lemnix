/**
 * Audit History Widget
 * Enterprise audit log viewer with timeline, filters, and export
 * 
 * @module widgets/audit-history
 * @version 1.0.0 - Professional Enterprise Feature
 */

import React, { useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  History as HistoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { useAuditLogs } from '@/entities/audit';
import { useAuditFilters } from '../hooks/useAuditFilters';
import { AuditFilterBar } from './AuditFilterBar';
import { AuditTimelineView } from './AuditTimelineView';
import { AuditStatisticsCard } from './AuditStatisticsCard';
import { WidgetErrorBoundary } from '@/shared/ui/ErrorBoundary/WidgetErrorBoundary';

/**
 * Audit History Widget Props
 */
export interface AuditHistoryWidgetProps {
  readonly showStatistics?: boolean;
  readonly defaultLimit?: number;
  readonly enableExport?: boolean;
}

/**
 * Main Audit History Widget
 * 
 * Features:
 * - Timeline view with grouping
 * - Advanced filtering (action, severity, outcome, date range)
 * - Real-time statistics
 * - Export to Excel/CSV/JSON
 * - Permission-based access control
 * - Responsive design
 * 
 * Architecture:
 * - Single Responsibility: Display audit logs
 * - Separation of Concerns: Filters, timeline, statistics in separate components
 * - Error Boundary: Graceful error handling
 * - React Query: Automatic caching and refetching
 */
export const AuditHistoryWidget: React.FC<AuditHistoryWidgetProps> = ({
  showStatistics = true,
  defaultLimit = 50,
  enableExport = true,
}) => {
  const ds = useDesignSystem();
  
  // Filter management (custom hook - single responsibility)
  const {
    apiQuery,
    hasActiveFilters,
    filters,
    sort,
    page,
    itemsPerPage,
    updateFilter,
    resetFilters,
    setDateRange,
    updateSort,
    setPage,
  } = useAuditFilters();

  // Data fetching (React Query)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAuditLogs(apiQuery);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!data?.total) return 1;
    return Math.ceil(data.total / itemsPerPage);
  }, [data?.total, itemsPerPage]);

  // Empty state
  if (!isLoading && !isError && data?.logs.length === 0 && !hasActiveFilters) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: ds.spacing['8'],
          px: ds.spacing['4'],
        }}
      >
        <HistoryIcon
          sx={{
            fontSize: 64,
            color: ds.colors.neutral[400],
            mb: ds.spacing['3'],
          }}
        />
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: ds.colors.text.primary,
            mb: ds.spacing['1'],
          }}
        >
          Henüz audit kaydı yok
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: ds.colors.text.secondary,
          }}
        >
          Sistem aktiviteleri burada görünecek
        </Typography>
      </Box>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = (error as { response?: { status?: number } })?.response?.status === 403
      ? 'Audit loglarını görüntüleme yetkiniz yok'
      : 'Audit logları yüklenirken bir hata oluştu';

    return (
      <Alert
        severity="error"
        icon={<WarningIcon />}
        sx={{
          borderRadius: `${ds.borderRadius.lg}px`,
        }}
      >
        {errorMessage}
      </Alert>
    );
  }

  return (
    <WidgetErrorBoundary
      widgetName="Audit History"
      showDetails={process.env.NODE_ENV === 'development'}
      recoveryAction={() => refetch()}
    >
      <Stack spacing={ds.spacing['4']}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: ds.spacing['3'],
            borderBottom: `1px solid ${ds.colors.neutral[200]}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
            <HistoryIcon
              sx={{
                fontSize: ds.componentSizes.icon.lg,
                color: ds.colors.primary.main,
              }}
            />
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: ds.typography.fontWeight.bold,
                background: ds.gradients.primary,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: ds.typography.letterSpacing.tight,
              }}
            >
              Audit Logları
            </Typography>
          </Box>

          {data && (
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: ds.colors.text.secondary,
                fontWeight: ds.typography.fontWeight.medium,
              }}
            >
              {data.total} kayıt
            </Typography>
          )}
        </Box>

        {/* Statistics Card (if enabled) */}
        {showStatistics && <AuditStatisticsCard />}

        {/* Filter Bar */}
        <AuditFilterBar
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onDateRangeChange={setDateRange}
          hasActiveFilters={hasActiveFilters}
          enableExport={enableExport}
        />

        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: ds.spacing['8'],
            }}
          >
            <CircularProgress
              sx={{
                color: ds.colors.primary.main,
              }}
            />
          </Box>
        )}

        {/* Timeline View */}
        {!isLoading && data && data.logs.length > 0 && (
          <>
            <AuditTimelineView
              logs={data.logs}
              sort={sort}
              onSortChange={updateSort}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  pt: ds.spacing['4'],
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: ds.typography.fontWeight.medium,
                      borderRadius: `${ds.borderRadius.md}px`,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* Empty Filtered State */}
        {!isLoading && data && data.logs.length === 0 && hasActiveFilters && (
          <Box
            sx={{
              textAlign: 'center',
              py: ds.spacing['6'],
              px: ds.spacing['4'],
            }}
          >
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                color: ds.colors.text.primary,
                mb: ds.spacing['1'],
              }}
            >
              Filtrelerle eşleşen kayıt bulunamadı
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: ds.colors.text.secondary,
              }}
            >
              Farklı filtre kombinasyonu deneyin veya filtreleri sıfırlayın
            </Typography>
          </Box>
        )}
      </Stack>
    </WidgetErrorBoundary>
  );
};

