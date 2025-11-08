/**
 * @fileoverview Multi-Material Stock Length Input Component
 * @module EnterpriseOptimizationForm/components
 * @version 1.0.0
 * 
 * ✅ P0-4: Multi-material stock length support
 * ✅ BACKEND: materialStockLengths: MaterialStockLength[]
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  IconButton,
  Card,
  CardContent,
  Button,
  Chip,
  InputAdornment,
  Tooltip,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Straighten as RulerIcon,
  Category as ProfileIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import type { MaterialStockLength } from '@/entities/optimization';

interface MaterialStockInputProps {
  readonly stockLengths: ReadonlyArray<MaterialStockLength>;
  readonly onChange: (stockLengths: ReadonlyArray<MaterialStockLength>) => void;
  readonly availableProfileTypes: ReadonlyArray<string>; // Auto-detected from items
  readonly readonly?: boolean;
}

export const MaterialStockInput: React.FC<MaterialStockInputProps> = ({
  stockLengths,
  onChange,
  availableProfileTypes,
  readonly = false,
}) => {
  const ds = useDesignSystem();

  // Check missing profile types
  const missingProfiles = useMemo(() => {
    const configuredProfiles = new Set(stockLengths.map((s) => s.profileType));
    return availableProfileTypes.filter((p) => !configuredProfiles.has(p));
  }, [stockLengths, availableProfileTypes]);

  const addStockLength = () => {
    const newStock: MaterialStockLength = {
      profileType: missingProfiles[0] || '',
      stockLength: 6100, // Default
    };
    onChange([...stockLengths, newStock]);
  };

  const removeStockLength = (index: number) => {
    onChange(stockLengths.filter((_, i) => i !== index));
  };

  const updateStockLength = (
    index: number,
    field: keyof MaterialStockLength,
    value: string | number
  ) => {
    const updated = stockLengths.map((stock, i) =>
      i === index ? { ...stock, [field]: value } : stock
    );
    onChange(updated);
  };

  // Auto-fill missing profiles
  const autoFillMissingProfiles = () => {
    const newStocks = missingProfiles.map((profile) => ({
      profileType: profile,
      stockLength: 6100,
    }));
    onChange([...stockLengths, ...newStocks]);
  };

  return (
    <Accordion
      defaultExpanded
      sx={{
        borderRadius: `${ds.borderRadius.lg}px`,
        border: `1px solid ${ds.colors.neutral[300]}`,
        boxShadow: 'none',
        '&:before': { display: 'none' },
        mb: ds.spacing['3'],
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          background: alpha(ds.colors.primary.main, 0.05),
          borderRadius: `${ds.borderRadius.lg}px`,
          '&:hover': {
            background: alpha(ds.colors.primary.main, 0.08),
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={ds.spacing['2']} sx={{ flex: 1 }}>
          <RulerIcon sx={{ color: ds.colors.primary.main, fontSize: ds.componentSizes.icon.medium }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              Stok Boyları ({stockLengths.length})
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
              Profil tiplerine göre stok uzunlukları
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: ds.spacing['3'] }}>
        <Stack spacing={ds.spacing['2']}>
          {/* Missing Profiles Warning */}
          {missingProfiles.length > 0 && (
            <Card
              sx={{
                background: alpha(ds.colors.warning.main, 0.05),
                border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: ds.spacing['2'], '&:last-child': { pb: ds.spacing['2'] } }}>
                <Stack direction="row" alignItems="center" spacing={ds.spacing['2']}>
                  <InfoIcon sx={{ color: ds.colors.warning.main, fontSize: 20 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {missingProfiles.length} profil tipi için stok boyu tanımlanmamış
                    </Typography>
                    <Stack direction="row" spacing={ds.spacing['1']} sx={{ mt: ds.spacing['1'] }}>
                      {missingProfiles.map((profile) => (
                        <Chip
                          key={profile}
                          label={profile}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6875rem',
                            background: alpha(ds.colors.warning.main, 0.1),
                            color: ds.colors.warning.main,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={autoFillMissingProfiles}
                    disabled={readonly}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Otomatik Ekle
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Stock Length List */}
          {stockLengths.length === 0 ? (
            <Card
              variant="outlined"
              sx={{
                p: ds.spacing['4'],
                textAlign: 'center',
                border: `1px dashed ${ds.colors.neutral[300]}`,
                background: alpha(ds.colors.neutral[100], 0.5),
              }}
            >
              <RulerIcon sx={{ fontSize: 40, color: ds.colors.neutral[400], mb: ds.spacing['1'] }} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: ds.colors.text.secondary }}>
                Henüz stok boyu eklenmemiş
              </Typography>
            </Card>
          ) : (
            <Stack spacing={ds.spacing['2']}>
              {stockLengths.map((stock, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    borderRadius: `${ds.borderRadius.md}px`,
                    border: `1px solid ${ds.colors.neutral[300]}`,
                  }}
                >
                  <CardContent sx={{ p: ds.spacing['2'], '&:last-child': { pb: ds.spacing['2'] } }}>
                    <Stack direction="row" spacing={ds.spacing['2']} alignItems="center">
                      {/* Profile Type */}
                      <TextField
                        label="Profil Tipi"
                        value={stock.profileType}
                        onChange={(e) => updateStockLength(index, 'profileType', e.target.value)}
                        size="small"
                        fullWidth
                        disabled={readonly}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ProfileIcon sx={{ 
                                color: ds.colors.primary.main, 
                                fontSize: ds.componentSizes.icon.small 
                              }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Stock Length */}
                      <TextField
                        label="Stok Boyu"
                        type="number"
                        value={stock.stockLength}
                        onChange={(e) =>
                          updateStockLength(index, 'stockLength', parseInt(e.target.value))
                        }
                        size="small"
                        fullWidth
                        disabled={readonly}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <RulerIcon sx={{ 
                                color: ds.colors.accent.main, 
                                fontSize: ds.componentSizes.icon.small 
                              }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: ds.colors.text.secondary }}>
                                mm
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Remove Button */}
                      {!readonly && stockLengths.length > 1 && (
                        <Tooltip title="Kaldır" arrow>
                          <IconButton
                            onClick={() => removeStockLength(index)}
                            size="small"
                            sx={{
                              color: ds.colors.error.main,
                              '&:hover': {
                                background: alpha(ds.colors.error.main, 0.1),
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          {/* Add Button */}
          {!readonly && (
            <Button
              startIcon={<AddIcon />}
              onClick={addStockLength}
              variant="outlined"
              fullWidth
              sx={{
                textTransform: 'none',
                borderRadius: `${ds.borderRadius.md}px`,
                borderStyle: 'dashed',
                py: ds.spacing['2'],
              }}
            >
              Stok Boyu Ekle
            </Button>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

