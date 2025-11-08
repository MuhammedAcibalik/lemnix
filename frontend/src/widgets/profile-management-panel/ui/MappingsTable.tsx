/**
 * Mappings Table with Week/Year Filter
 */

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';
import { useDesignSystem } from '@/shared/hooks';
import { alpha } from '@mui/material/styles';
import { TextField } from '@/shared';
import { useMappingsByWeek } from '../model/useProfileManagement';
import { getCurrentISOWeek } from '@/shared/lib/dateUtils';

export const MappingsTable: React.FC = () => {
  const ds = useDesignSystem();
  const isoWeek = getCurrentISOWeek();
  
  const [weekNumber, setWeekNumber] = useState(isoWeek.week);
  const [year, setYear] = useState(isoWeek.year);

  const { data: mappings, isLoading } = useMappingsByWeek(weekNumber, year);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: ds.spacing['6'] }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: ds.spacing['2'], pb: ds.spacing['3'] }}>
      {/* Filters */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: ds.spacing['3'] }}
      >
        <TextField
          label="Hafta"
          type="number"
          value={weekNumber}
          onChange={(e) => setWeekNumber(Number(e.target.value))}
          size="small"
          inputProps={{ min: 1, max: 53 }}
          sx={{ width: { xs: '100%', sm: 140 } }}
        />
        <TextField
          label="Yıl"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          size="small"
          inputProps={{ min: 2020, max: 2030 }}
          sx={{ width: { xs: '100%', sm: 140 } }}
        />
      </Stack>

      {!mappings || mappings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: ds.spacing['3'] }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Bu hafta için eşleştirme bulunamadı
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ px: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: ds.typography.fontWeight.semibold,
                  fontSize: '0.8125rem',
                  py: ds.spacing['1'],
                }}>
                  Sipariş No
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: ds.typography.fontWeight.semibold,
                  fontSize: '0.8125rem',
                  py: ds.spacing['1'],
                }}>
                  Profil Tipi
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: ds.typography.fontWeight.semibold,
                  fontSize: '0.8125rem',
                  py: ds.spacing['1'],
                }}>
                  Atanan Profil
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: ds.typography.fontWeight.semibold,
                  fontSize: '0.8125rem',
                  py: ds.spacing['1'],
                }}>
                  Stok Uzunlukları
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow
                  key={mapping.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(ds.colors.primary.main, 0.02)
                    },
                    '& td': {
                      py: ds.spacing['1'],
                      fontSize: '0.8125rem',
                    }
                  }}
                >
                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: ds.typography.fontWeight.medium,
                        fontFamily: 'monospace'
                      }}
                    >
                      {mapping.workOrderId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={mapping.profileType}
                      size="small"
                      sx={{
                        borderRadius: `${ds.borderRadius.sm}px`,
                        fontWeight: ds.typography.fontWeight.medium,
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: ds.typography.fontWeight.medium }}>
                      {mapping.profile?.profileName || '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {mapping.profile?.profileCode || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75}>
                      {mapping.profile?.stockLengths
                        .sort((a, b) => a.priority - b.priority)
                        .slice(0, 3)
                        .map((sl) => (
                          <Chip
                            key={sl.id}
                            label={`${sl.stockLength}mm`}
                            size="small"
                            variant={sl.isDefault ? 'filled' : 'outlined'}
                            color={sl.isDefault ? 'primary' : 'default'}
                            sx={{
                              fontSize: '0.7rem',
                              height: 22
                            }}
                          />
                        ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

