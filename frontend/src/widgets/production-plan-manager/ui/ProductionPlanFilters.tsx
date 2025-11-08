/**
 * @fileoverview Production Plan Filters Component
 * @module widgets/production-plan-manager/ui
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Grid,
  Typography,
  useTheme,
  Collapse,
  IconButton
} from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { WEEK_OPTIONS, getYearOptions, DEPARTMENT_OPTIONS, DEPARTMENT_MAPPING, PRIORITY_LABELS } from '@/entities/production-plan';
import type { ProductionPlanFilters as ProductionPlanFiltersType } from '@/entities/production-plan';

interface ProductionPlanFiltersProps {
  readonly filters: ProductionPlanFiltersType;
  readonly onFiltersChange: (filters: ProductionPlanFiltersType) => void;
}

export const ProductionPlanFiltersComponent: React.FC<ProductionPlanFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (field: keyof ProductionPlanFiltersType, value: unknown) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: 'active',
      page: 1,
      limit: 50
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.weekNumber) count++;
    if (filters.year) count++;
    if (filters.bolum) count++;
    if (filters.oncelik) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box sx={{ 
      p: isExpanded ? ds.spacing['2'] : ds.spacing['1'], // Açıkken 2, kapalıyken 1 (4px)
      transition: 'padding 0.2s ease-in-out'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: ds.spacing['1'], 
        mb: isExpanded ? ds.spacing['2'] : 0, // Açıkken 2, kapalıyken 0
        transition: 'margin-bottom 0.2s ease-in-out'
      }}>
        <FilterIcon 
          color="primary" 
          sx={{ 
            fontSize: isExpanded ? '1.25rem' : '1.125rem' // Açıkken 20px, kapalıyken 18px
          }} 
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 600, 
            fontSize: isExpanded ? '0.875rem' : '0.8125rem' // Açıkken 14px, kapalıyken 13px
          }}>
            Filtreler
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ 
            fontSize: isExpanded ? '0.75rem' : '0.6875rem', // Açıkken 12px, kapalıyken 11px
            display: isExpanded ? 'block' : 'none' // Kapalıyken açıklama gizle
          }}>
            Üretim planlarını filtreleyin ve arayın
          </Typography>
        </Box>
        {activeFiltersCount > 0 && isExpanded && (
          <Chip
            label={`${activeFiltersCount} aktif filtre`}
            color="primary"
            size="small"
            variant="outlined"
          />
        )}
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            transition: 'transform 0.2s ease-in-out',
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
          }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Grid container spacing={ds.spacing['2']}>
        {/* Week Number */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Hafta</InputLabel>
            <Select
              value={filters.weekNumber || ''}
              label="Hafta"
              onChange={(e) => handleFilterChange('weekNumber', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>Tüm haftalar</em>
              </MenuItem>
              {WEEK_OPTIONS.map((week) => (
                <MenuItem key={week} value={week}>
                  {week}. Hafta
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Year */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Yıl</InputLabel>
            <Select
              value={filters.year || ''}
              label="Yıl"
              onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>Tüm yıllar</em>
              </MenuItem>
              {getYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Department */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Bölüm</InputLabel>
            <Select
              value={filters.bolum || ''}
              label="Bölüm"
              onChange={(e) => handleFilterChange('bolum', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>Tüm bölümler</em>
              </MenuItem>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Priority */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Öncelik</InputLabel>
            <Select
              value={filters.oncelik || ''}
              label="Öncelik"
              onChange={(e) => handleFilterChange('oncelik', e.target.value || undefined)}
            >
              <MenuItem value="">
                <em>Tüm öncelikler</em>
              </MenuItem>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mt: ds.spacing['2'] }}>
          <Typography variant="body2" sx={{ mb: ds.spacing['1'], fontWeight: 600, fontSize: '0.75rem' }}>
            Aktif Filtreler:
          </Typography>
          <Box sx={{ display: 'flex', gap: ds.spacing['1'], flexWrap: 'wrap' }}>
            {filters.weekNumber && (
              <Chip
                label={`Hafta: ${filters.weekNumber}`}
                onDelete={() => handleFilterChange('weekNumber', undefined)}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.year && (
              <Chip
                label={`Yıl: ${filters.year}`}
                onDelete={() => handleFilterChange('year', undefined)}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.bolum && (
              <Chip
                label={`Bölüm: ${filters.bolum}`}
                onDelete={() => handleFilterChange('bolum', undefined)}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {filters.oncelik && (
              <Chip
                label={`Öncelik: ${PRIORITY_LABELS[filters.oncelik]}`}
                onDelete={() => handleFilterChange('oncelik', undefined)}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: ds.spacing['2'] }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          disabled={activeFiltersCount === 0}
          sx={{
            mr: ds.spacing['1'],
            fontSize: '0.75rem',
            borderColor: theme.palette.grey[300],
            color: theme.palette.grey[600],
            '&:hover': {
              borderColor: theme.palette.grey[400],
              backgroundColor: theme.palette.grey[50],
            }
          }}
        >
          Filtreleri Temizle
        </Button>
      </Box>
      </Collapse>
    </Box>
  );
};

export { ProductionPlanFiltersComponent as ProductionPlanFilters };
export default ProductionPlanFiltersComponent;
