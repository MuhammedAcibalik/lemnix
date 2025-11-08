/**
 * @fileoverview Cost Model Configuration Section
 * @module EnterpriseOptimizationForm/components
 * @version 1.0.0
 * 
 * ✅ P1-6: Cost model configuration UI
 * ✅ BACKEND: costModel: CostModel
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  Build as SetupIcon,
  ContentCut as CuttingIcon,
  AccessTime as TimeIcon,
  Delete as WasteIcon,
  Work as LaborIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import type { CostModel } from '@/entities/optimization/model/types';

interface CostModelSectionProps {
  readonly costModel: CostModel;
  readonly onChange: (costModel: CostModel) => void;
  readonly readonly?: boolean;
}

const COST_FIELDS = [
  {
    key: 'materialCostPerMeter' as keyof CostModel,
    label: 'Malzeme Maliyeti',
    description: 'Metre başına malzeme maliyeti',
    icon: <MoneyIcon />,
    color: '#2196f3',
  },
  {
    key: 'cuttingCostPerCut' as keyof CostModel,
    label: 'Kesim Maliyeti',
    description: 'Kesim başına işçilik ve enerji',
    icon: <CuttingIcon />,
    color: '#ff9800',
  },
  {
    key: 'setupCostPerStock' as keyof CostModel,
    label: 'Kurulum Maliyeti',
    description: 'Stok başına kurulum maliyeti',
    icon: <SetupIcon />,
    color: '#9c27b0',
  },
  {
    key: 'laborCostPerHour' as keyof CostModel,
    label: 'İşçilik Maliyeti',
    description: 'Saat başına işçilik maliyeti',
    icon: <LaborIcon />,
    color: '#4caf50',
  },
  {
    key: 'wasteCostPerMeter' as keyof CostModel,
    label: 'Fire Maliyeti',
    description: 'Metre başına fire maliyeti',
    icon: <WasteIcon />,
    color: '#f44336',
  },
];

export const CostModelSection: React.FC<CostModelSectionProps> = ({
  costModel,
  onChange,
  readonly = false,
}) => {
  const ds = useDesignSystem();

  const updateCost = (key: keyof CostModel, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...costModel, [key]: numValue });
  };

  // Calculate total estimated cost preview
  const totalEstimate = useMemo(() => {
    const stockCount = 10; // Example
    const cutsCount = 50; // Example
    const hoursEstimate = 2; // Example

    return (
      costModel.materialCostPerMeter * 60 +
      costModel.cuttingCostPerCut * cutsCount +
      costModel.setupCostPerStock * stockCount +
      costModel.laborCostPerHour * hoursEstimate +
      costModel.wasteCostPerMeter * 5
    );
  }, [costModel]);

  return (
    <Accordion
      defaultExpanded={false}
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
          background: alpha(ds.colors.warning.main, 0.05),
          borderRadius: `${ds.borderRadius.lg}px`,
          '&:hover': {
            background: alpha(ds.colors.warning.main, 0.08),
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={ds.spacing['2']} sx={{ flex: 1 }}>
          <MoneyIcon sx={{ color: ds.colors.warning.main, fontSize: ds.componentSizes.icon.medium }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              Maliyet Modeli
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
              Detaylı maliyet hesaplama parametreleri
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: ds.spacing['3'] }}>
        <Stack spacing={ds.spacing['3']}>
          {/* Cost Inputs Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: ds.spacing['3'],
            }}
          >
            {COST_FIELDS.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                type="number"
                value={costModel[field.key]}
                onChange={(e) => updateCost(field.key, e.target.value)}
                helperText={field.description}
                fullWidth
                size="small"
                disabled={readonly}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {React.cloneElement(field.icon, {
                        sx: { color: field.color, fontSize: ds.componentSizes.icon.small },
                      })}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: ds.colors.text.secondary }}>
                        ₺
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            ))}
          </Box>

          {/* Cost Preview Card */}
          <Card
            sx={{
              background: alpha(ds.colors.success.main, 0.05),
              border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          >
            <CardContent sx={{ p: ds.spacing['2'], '&:last-child': { pb: ds.spacing['2'] } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
                    Tahmini Maliyet (Örnek İş Emri)
                  </Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: ds.colors.success[700] }}>
                    ₺{totalEstimate.toFixed(2)}
                  </Typography>
                </Box>
                <Chip
                  label="Önizleme"
                  size="small"
                  sx={{
                    background: alpha(ds.colors.success.main, 0.1),
                    color: ds.colors.success.main,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Box
            sx={{
              p: ds.spacing['2'],
              background: alpha(ds.colors.neutral[100], 0.5),
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: ds.colors.text.secondary }}>
              💡 <strong>İpucu:</strong> Maliyet modeli, her algoritmanın toplam maliyetini hesaplamak için kullanılır.
              Gerçek değerlerinizi girerek en doğru maliyet analizini elde edin.
            </Typography>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

