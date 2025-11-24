/**
 * AlgorithmSelector - Smart algorithm selection component
 * FSD Feature Component
 *
 * @module features/algorithm-selection
 * @version 1.0.0 - GA v1.7.1 Support
 */

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Chip,
  Alert,
  Box,
  Stack,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  PrecisionManufacturing as AccuracyIcon,
  TrendingUp as ScalabilityIcon,
} from "@mui/icons-material";
import type { AlgorithmType } from "@/entities/optimization";
import { ALGORITHM_CATALOG } from "@/entities/optimization/model/types";

interface AlgorithmSelectorProps {
  readonly value: AlgorithmType;
  readonly itemCount: number;
  readonly onChange: (algorithm: AlgorithmType) => void;
  readonly showRecommendation?: boolean;
  readonly disabled?: boolean;
}

export function AlgorithmSelector({
  value,
  itemCount,
  onChange,
  showRecommendation = true,
  disabled = false,
}: AlgorithmSelectorProps) {
  // Smart recommendation based on item count
  const recommendation = useMemo((): AlgorithmType => {
    if (itemCount < 50) return "bfd";
    return "genetic";
  }, [itemCount]);

  const algorithms = useMemo(() => Object.values(ALGORITHM_CATALOG), []);

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          🧬 Optimizasyon Algoritması
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {itemCount} parça için algoritma seçin
        </Typography>

        {showRecommendation && value !== recommendation && (
          <Alert severity="info" sx={{ mb: 2 }} icon="💡">
            <strong>{itemCount} parça</strong> için{" "}
            <strong>{ALGORITHM_CATALOG[recommendation].name}</strong> önerilir (
            {ALGORITHM_CATALOG[recommendation].description})
          </Alert>
        )}

        <RadioGroup
          value={value}
          onChange={(e) => onChange(e.target.value as AlgorithmType)}
        >
          <Stack spacing={1.5}>
            {algorithms.map((alg) => {
              const isInRange =
                itemCount >= alg.recommendedItemRange.min &&
                itemCount <= alg.recommendedItemRange.max;

              const isRecommended = alg.id === recommendation;

              return (
                <Card
                  key={alg.id}
                  variant="outlined"
                  sx={{
                    opacity: disabled ? 0.5 : isInRange ? 1 : 0.7,
                    border: value === alg.id ? 2 : 1,
                    borderColor: value === alg.id ? "primary.main" : "divider",
                    transition: "all 0.2s",
                    "&:hover": disabled
                      ? {}
                      : {
                          boxShadow: 2,
                          borderColor: "primary.light",
                        },
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !disabled && onChange(alg.id)}
                >
                  <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                    <FormControlLabel
                      value={alg.id}
                      control={<Radio disabled={disabled} />}
                      sx={{ width: "100%", m: 0 }}
                      label={
                        <Box sx={{ width: "100%", ml: 1 }}>
                          {/* Header */}
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={0.5}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: value === alg.id ? 600 : 500,
                              }}
                            >
                              {alg.icon} {alg.name}
                            </Typography>
                            {isRecommended && (
                              <Chip
                                label="Önerilen"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                            {alg.supportsObjectives && (
                              <Chip
                                label="Çoklu Hedef"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1.5 }}
                          >
                            {alg.description}
                          </Typography>

                          {/* Metrics */}
                          <Stack spacing={1}>
                            {/* Complexity */}
                            <Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={0.5}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Karmaşıklık: {alg.complexity}
                                </Typography>
                                <Tooltip
                                  title={`Ölçeklenebilirlik: ${alg.scalability}/10`}
                                >
                                  <Chip
                                    icon={
                                      <ScalabilityIcon sx={{ fontSize: 14 }} />
                                    }
                                    label={`${alg.scalability}/10`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20 }}
                                  />
                                </Tooltip>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={alg.scalability * 10}
                                color={
                                  alg.scalability > 7
                                    ? "success"
                                    : alg.scalability > 5
                                      ? "primary"
                                      : "warning"
                                }
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>

                            {/* Best For Tags */}
                            <Box display="flex" gap={0.5} flexWrap="wrap">
                              {alg.bestFor.map((feature) => (
                                <Chip
                                  key={feature}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    height: 22,
                                    fontSize: "0.7rem",
                                    borderColor: "divider",
                                  }}
                                />
                              ))}
                            </Box>

                            {/* Recommended Range */}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Önerilen: {alg.recommendedItemRange.min}-
                              {alg.recommendedItemRange.max} parça
                            </Typography>
                          </Stack>

                          {/* Warning for out of range */}
                          {!isInRange && (
                            <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                              <Typography variant="caption">
                                Bu algoritma {itemCount} parça için optimal
                                olmayabilir
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </RadioGroup>

        {/* Additional Info */}
        <Box mt={2} p={1.5} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            💡 <strong>İpucu:</strong> Genetic Algorithm çoklu hedef
            optimizasyonu ve gelişmiş ayarları destekler. 10-200 parça arası
            için en iyi sonuçları verir.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
