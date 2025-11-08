/**
 * Audit Filter Bar Component
 * Advanced filtering UI for audit logs
 * 
 * @module widgets/audit-history/ui
 * @version 1.0.0
 */

import React, { useCallback } from 'react';
import {
  Box,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import {
  AUDIT_ACTION_CATALOG,
  SEVERITY_CATALOG,
  type AuditAction,
  type AuditSeverity,
  type AuditOutcome,
} from '@/entities/audit';
import type { AuditFilterState } from '../types';
import { alpha } from '@mui/material/styles';

/**
 * Audit Filter Bar Props
 */
export interface AuditFilterBarProps {
  readonly filters: AuditFilterState;
  readonly onFilterChange: <K extends keyof AuditFilterState>(
    key: K,
    value: AuditFilterState[K]
  ) => void;
  readonly onResetFilters: () => void;
  readonly onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  readonly hasActiveFilters: boolean;
  readonly enableExport?: boolean;
}

/**
 * Audit Filter Bar Component
 * 
 * Single Responsibility: Render filter controls
 * 
 * Features:
 * - Action filter (dropdown)
 * - Severity filter (dropdown)
 * - Outcome filter (dropdown)
 * - User ID search
 * - Date range picker
 * - Search query
 * - Reset filters button
 * - Export button
 * - Active filter count badge
 */
export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onDateRangeChange,
  hasActiveFilters,
  enableExport = true,
}) => {
  const ds = useDesignSystem();

  // Handle select changes (strongly typed)
  const handleActionChange = useCallback((event: SelectChangeEvent<string>) => {
    onFilterChange('action', event.target.value as AuditAction | 'all');
  }, [onFilterChange]);

  const handleSeverityChange = useCallback((event: SelectChangeEvent<string>) => {
    onFilterChange('severity', event.target.value as AuditSeverity | 'all');
  }, [onFilterChange]);

  const handleOutcomeChange = useCallback((event: SelectChangeEvent<string>) => {
    onFilterChange('outcome', event.target.value as AuditOutcome | 'all');
  }, [onFilterChange]);

  const handleUserIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('userId', event.target.value);
  }, [onFilterChange]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('searchQuery', event.target.value);
  }, [onFilterChange]);

  // Export handler (future enhancement)
  const handleExport = useCallback(() => {
    console.log('Export audit logs with filters:', filters);
    // TODO: Implement export dialog
  }, [filters]);

  // Count active filters
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (filters.action !== 'all') count++;
    if (filters.severity !== 'all') count++;
    if (filters.outcome !== 'all') count++;
    if (filters.userId.trim()) count++;
    if (filters.dateRange.startDate || filters.dateRange.endDate) count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  return (
    <Box
      sx={{
        p: ds.spacing['4'],
        borderRadius: `${ds.borderRadius.lg}px`,
        border: `1px solid ${ds.colors.neutral[200]}`,
        backgroundColor: alpha(ds.colors.neutral[50], 0.5),
      }}
    >
      <Stack spacing={ds.spacing['3']}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'] }}>
            <FilterIcon
              sx={{
                fontSize: ds.componentSizes.icon.md,
                color: ds.colors.primary.main,
              }}
            />
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
              }}
            >
              Filtreler
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} aktif`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  background: alpha(ds.colors.primary.main, 0.1),
                  color: ds.colors.primary.main,
                }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={ds.spacing['2']}>
            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={onResetFilters}
                sx={{
                  borderColor: ds.colors.neutral[300],
                  color: ds.colors.text.secondary,
                  fontWeight: ds.typography.fontWeight.medium,
                  fontSize: '0.8125rem',
                  '&:hover': {
                    borderColor: ds.colors.neutral[400],
                    backgroundColor: alpha(ds.colors.neutral[900], 0.04),
                  },
                }}
              >
                Filtreleri Sıfırla
              </Button>
            )}

            {/* Export Button */}
            {enableExport && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ExportIcon />}
                onClick={handleExport}
                disabled={!data || data.logs.length === 0}
                sx={{
                  background: ds.gradients.primary,
                  fontWeight: ds.typography.fontWeight.semibold,
                  fontSize: '0.8125rem',
                  '&:hover': {
                    background: ds.gradients.primary,
                    opacity: 0.9,
                  },
                }}
              >
                Export
              </Button>
            )}
          </Stack>
        </Box>

        {/* Filter Controls */}
        <Stack direction="row" spacing={ds.spacing['2']} flexWrap="wrap" useFlexGap>
          {/* Action Filter */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>İşlem Tipi</InputLabel>
            <Select
              value={filters.action}
              onChange={handleActionChange}
              label="İşlem Tipi"
              sx={{
                borderRadius: `${ds.borderRadius.input}px`,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: ds.colors.neutral[300],
                },
              }}
            >
              <MenuItem value="all">
                <em>Tümü</em>
              </MenuItem>
              {Object.values(AUDIT_ACTION_CATALOG).map(({ action, label, icon }) => (
                <MenuItem key={action} value={action}>
                  {icon} {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Severity Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Önem Derecesi</InputLabel>
            <Select
              value={filters.severity}
              onChange={handleSeverityChange}
              label="Önem Derecesi"
              sx={{
                borderRadius: `${ds.borderRadius.input}px`,
              }}
            >
              <MenuItem value="all">
                <em>Tümü</em>
              </MenuItem>
              {Object.values(SEVERITY_CATALOG).map(({ severity, label, icon }) => (
                <MenuItem key={severity} value={severity}>
                  {icon} {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Outcome Filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sonuç</InputLabel>
            <Select
              value={filters.outcome}
              onChange={handleOutcomeChange}
              label="Sonuç"
              sx={{
                borderRadius: `${ds.borderRadius.input}px`,
              }}
            >
              <MenuItem value="all">
                <em>Tümü</em>
              </MenuItem>
              <MenuItem value="success">✅ Başarılı</MenuItem>
              <MenuItem value="failure">❌ Başarısız</MenuItem>
            </Select>
          </FormControl>

          {/* User ID Search */}
          <TextField
            size="small"
            label="Kullanıcı ID"
            value={filters.userId}
            onChange={handleUserIdChange}
            placeholder="Kullanıcı ID ara..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: `${ds.borderRadius.input}px`,
              },
            }}
          />

          {/* Date Range (Simplified - Full date picker would be separate component) */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<DateRangeIcon />}
            onClick={() => {
              // TODO: Open date range picker dialog
              console.log('Open date range picker');
            }}
            sx={{
              borderColor: ds.colors.neutral[300],
              color: ds.colors.text.secondary,
              fontWeight: ds.typography.fontWeight.medium,
            }}
          >
            Tarih Aralığı
          </Button>
        </Stack>

        {/* Active Filter Summary */}
        {hasActiveFilters && (
          <Box
            sx={{
              p: ds.spacing['2'],
              borderRadius: `${ds.borderRadius.md}px`,
              backgroundColor: alpha(ds.colors.primary.main, 0.05),
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: ds.colors.text.secondary,
                fontWeight: ds.typography.fontWeight.medium,
              }}
            >
              {activeFilterCount} filtre aktif
              {filters.action !== 'all' && ` • İşlem: ${AUDIT_ACTION_CATALOG[filters.action].label}`}
              {filters.severity !== 'all' && ` • Önem: ${SEVERITY_CATALOG[filters.severity].label}`}
              {filters.outcome !== 'all' && ` • Sonuç: ${filters.outcome === 'success' ? 'Başarılı' : 'Başarısız'}`}
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

