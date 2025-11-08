/**
 * Stock Breakdown List Component
 * Detailed expandable list of all stocks with segments
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Stack,
  TextField,
  InputAdornment,
  alpha,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Straighten as RulerIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
import type { StockBreakdownData } from './utils';
import { formatLength, getWasteCategoryColor, getWasteCategoryLabel } from './utils';

export interface StockBreakdownListProps {
  readonly stocks: ReadonlyArray<StockBreakdownData>;
  readonly onStockSelect?: (stockIndex: number) => void;
}

/**
 * Stock Breakdown List
 * Virtualized accordion list of stock details
 */
export const StockBreakdownList: React.FC<StockBreakdownListProps> = ({
  stocks,
  onStockSelect,
}) => {
  const ds = useDesignSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStock, setExpandedStock] = useState<number | null>(null);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;

    const query = searchQuery.toLowerCase();
    return stocks.filter(stock => {
      // Search in stock index
      if (stock.stockIndex.toString().includes(query)) return true;

      // Search in segments
      return stock.segments.some(seg =>
        seg.profileType.toLowerCase().includes(query) ||
        seg.workOrderId.toLowerCase().includes(query)
      );
    });
  }, [stocks, searchQuery]);

  const handleAccordionChange = (stockIndex: number) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedStock(isExpanded ? stockIndex : null);
    if (isExpanded && onStockSelect) {
      onStockSelect(stockIndex);
    }
  };

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['4'], height: '100%' }}>
      {/* Header */}
      <Typography
        sx={{
          fontSize: '1.125rem',
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing['3'],
        }}
      >
        Stok Detayları
      </Typography>

      {/* Search */}
      <TextField
        placeholder="İş emri veya profil ara..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: ds.spacing['3'] }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 20, color: ds.colors.text.secondary }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Stock List */}
      <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
        {filteredStocks.map((stock) => (
          <Accordion
            key={stock.stockIndex}
            expanded={expandedStock === stock.stockIndex}
            onChange={handleAccordionChange(stock.stockIndex)}
            sx={{
              mb: ds.spacing['1'],
              border: `1px solid ${ds.colors.neutral[200]}`,
              borderRadius: `${ds.borderRadius.md}px !important`,
              '&:before': { display: 'none' },
              boxShadow: 'none',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 48,
                '& .MuiAccordionSummary-content': {
                  my: ds.spacing['1'],
                },
              }}
            >
              <Box sx={{ width: '100%', pr: ds.spacing['2'] }}>
                {/* Header Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'], mb: ds.spacing['1'] }}>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: ds.typography.fontWeight.semibold,
                      color: ds.colors.text.primary,
                    }}
                  >
                    Stok #{stock.stockIndex}
                  </Typography>

                  <Chip
                    label={`${stock.segmentCount} kesim`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                    }}
                  />

                  <Chip
                    label={getWasteCategoryLabel(stock.wasteCategory)}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: alpha(getWasteCategoryColor(stock.wasteCategory), 0.1),
                      color: getWasteCategoryColor(stock.wasteCategory),
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: ds.colors.text.secondary,
                      ml: 'auto',
                    }}
                  >
                    {formatLength(stock.stockLength)}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <LinearProgress
                  variant="determinate"
                  value={stock.usedPercentage}
                  sx={{
                    height: 6,
                    borderRadius: `${ds.borderRadius.sm}px`,
                    backgroundColor: alpha(ds.colors.neutral[200], 0.5),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: `${ds.borderRadius.sm}px`,
                      backgroundColor: ds.colors.primary.main,
                    },
                  }}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: ds.spacing['2'] }}>
              <Divider sx={{ mb: ds.spacing['2'] }} />

              {/* Segments List */}
              <Stack spacing={ds.spacing['1']}>
                {stock.segments.map((segment, segIndex) => (
                  <Box
                    key={segment.id}
                    sx={{
                      p: ds.spacing['2'],
                      borderRadius: `${ds.borderRadius.sm}px`,
                      backgroundColor: alpha(segment.color, 0.05),
                      border: `1px solid ${alpha(segment.color, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['2'], flexWrap: 'wrap' }}>
                      {/* Segment number */}
                      <Chip
                        label={`#${segIndex + 1}`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          minWidth: 36,
                          backgroundColor: segment.color,
                          color: '#fff',
                        }}
                      />

                      {/* Profile Type */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                        <RulerIcon sx={{ fontSize: 14, color: ds.colors.text.secondary }} />
                        <Typography
                          sx={{
                            fontSize: '0.8125rem',
                            fontWeight: ds.typography.fontWeight.medium,
                            color: ds.colors.text.primary,
                          }}
                        >
                          {segment.profileType}
                        </Typography>
                      </Box>

                      {/* Length × Quantity */}
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: ds.colors.text.secondary,
                        }}
                      >
                        {formatLength(segment.length)} × {segment.quantity}
                      </Typography>

                      {/* Work Order */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: ds.spacing['1'] }}>
                        <AssignmentIcon sx={{ fontSize: 14, color: ds.colors.text.secondary }} />
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            color: ds.colors.text.secondary,
                          }}
                        >
                          {segment.workOrderId}
                        </Typography>
                      </Box>

                      {/* Position */}
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: ds.colors.text.secondary,
                          ml: 'auto',
                        }}
                      >
                        @ {formatLength(segment.startPosition)}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Waste Info */}
                {stock.wasteLength > 0 && (
                  <Box
                    sx={{
                      p: ds.spacing['2'],
                      borderRadius: `${ds.borderRadius.sm}px`,
                      backgroundColor: alpha(ds.colors.error.main, 0.05),
                      border: `1px dashed ${alpha(ds.colors.error.main, 0.3)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: ds.typography.fontWeight.medium,
                        color: ds.colors.error.main,
                      }}
                    >
                      Fire: {formatLength(stock.wasteLength)} ({stock.wasteCategory})
                    </Typography>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Summary */}
      {filteredStocks.length === 0 && searchQuery && (
        <Box
          sx={{
            textAlign: 'center',
            py: ds.spacing['4'],
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: ds.colors.text.secondary }}>
            "{searchQuery}" için sonuç bulunamadı
          </Typography>
        </Box>
      )}
    </CardV2>
  );
};

