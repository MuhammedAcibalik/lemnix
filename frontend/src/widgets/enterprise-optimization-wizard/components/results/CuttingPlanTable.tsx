/**
 * Cutting Plan Table Component
 * DataGrid with all cutting segments
 * 
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { Box, Typography, Chip, alpha } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { CardV2 } from '@/shared';
import { useDesignSystem } from '@/shared/hooks';
// Cut type definition
interface Cut {
  id: string;
  stockLength: number;
  segments: Array<{
    id: string;
    profileType: string;
    length: number;
    quantity: number;
    workOrderId: string;
  }>;
  usedLength: number;
  remainingLength: number;
  wasteCategory: string;
}
import { formatLength, getWorkOrderColor } from './utils';
import type { SegmentTableRow } from './types';

export interface CuttingPlanTableProps {
  readonly cuts: ReadonlyArray<Cut>;
}

/**
 * Cutting Plan Table
 * Comprehensive table of all segments with sorting and filtering
 */
export const CuttingPlanTable: React.FC<CuttingPlanTableProps> = ({ cuts }) => {
  const ds = useDesignSystem();

  // Transform cuts to table rows
  const rows = useMemo<ReadonlyArray<SegmentTableRow>>(() => {
    const tableRows: SegmentTableRow[] = [];

    cuts.forEach((cut, cutIndex) => {
      cut.segments.forEach((segment, segIndex) => {
        tableRows.push({
          id: `${cutIndex}-${segIndex}`,
          stockIndex: cutIndex + 1,
          segmentIndex: segIndex + 1,
          profileType: segment.profileType,
          length: segment.length,
          quantity: segment.quantity || 1,
          workOrderId: segment.workOrderId || 'N/A',
          startPosition: (segment as { position?: number }).position || 0,
          endPosition: (segment as { endPosition?: number; position?: number; length: number }).endPosition || ((segment as { position?: number; length: number }).position || 0) + segment.length,
          waste: cut.remainingLength || 0,
          color: getWorkOrderColor(segment.workOrderId || ''),
        });
      });
    });

    return tableRows;
  }, [cuts]);

  const columns: GridColDef[] = [
    {
      field: 'stockIndex',
      headerName: 'Stok #',
      width: 80,
      type: 'number',
    },
    {
      field: 'segmentIndex',
      headerName: 'Kesim #',
      width: 90,
      type: 'number',
    },
    {
      field: 'profileType',
      headerName: 'Profil Tipi',
      width: 180,
      flex: 1,
    },
    {
      field: 'length',
      headerName: 'Uzunluk',
      width: 120,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => formatLength(params.value as number),
    },
    {
      field: 'quantity',
      headerName: 'Adet',
      width: 80,
      type: 'number',
    },
    {
      field: 'workOrderId',
      headerName: 'İş Emri',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const workOrderId = params.value as string;
        const color = params.row.color as string;
        
        return (
          <Chip
            label={workOrderId}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: alpha(color, 0.15),
              color,
              border: `1px solid ${alpha(color, 0.3)}`,
            }}
          />
        );
      },
    },
    {
      field: 'startPosition',
      headerName: 'Başlangıç',
      width: 120,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => formatLength(params.value as number),
    },
    {
      field: 'endPosition',
      headerName: 'Bitiş',
      width: 120,
      type: 'number',
      renderCell: (params: GridRenderCellParams) => formatLength(params.value as number),
    },
  ];

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing['4'], height: '100%' }}>
      <Typography
        sx={{
          fontSize: '1.125rem',
          fontWeight: ds.typography.fontWeight.semibold,
          color: ds.colors.text.primary,
          mb: ds.spacing['3'],
        }}
      >
        Kesim Planı Tablosu
      </Typography>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            border: `1px solid ${ds.colors.neutral[200]}`,
            borderRadius: `${ds.borderRadius.md}px`,
            '& .MuiDataGrid-cell': {
              fontSize: '0.8125rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha(ds.colors.neutral[100], 0.5),
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          }}
        />
      </Box>
    </CardV2>
  );
};

