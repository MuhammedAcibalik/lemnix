/**
 * @fileoverview Algorithm Tab Component
 * @module AlgorithmTab
 * @version 1.0.0
 */

import React from "react";
import { OptimizationResult } from "../../types";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  Switch,
} from "@mui/material";

interface AlgorithmTabProps {
  result: OptimizationResult;
  useProfileOptimization: boolean;
  onProfileOptimizationToggle: (value: boolean) => void;
  profileOptimizationResult: Record<string, unknown>;
}

export const AlgorithmTab: React.FC<AlgorithmTabProps> = ({
  result,
  useProfileOptimization,
  onProfileOptimizationToggle,
  profileOptimizationResult,
}) => {
  if (!result) {
    return (
      <Alert severity="info">
        <AlertTitle>Veri Bulunamadı</AlertTitle>
        Optimizasyon sonuçları henüz mevcut değil.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Algoritma ve Parametreler */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                border: "2px solid #f59e0b", // Efficiency Orange - debug border
                p: 2,
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(251,191,36,0.05) 100%)",
              }}
            >
              <Typography variant="h6">
                🔥 Profil Tipi Bazlı Optimizasyon
              </Typography>
              <Switch
                checked={useProfileOptimization}
                onChange={(e) => {
                  console.log("🔥 Toggle clicked:", e.target.checked);
                  onProfileOptimizationToggle(e.target.checked);
                }}
                color="primary"
                sx={{ transform: "scale(1.5)" }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Aynı profil tiplerindeki parçaları gruplandırarak daha verimli
              kesim planları oluşturur. Bu özellik açıldığında, sistem aynı
              profil tipindeki parçaları bir araya getirerek stok kullanımını
              optimize eder ve atık miktarını azaltır.
            </Typography>

            {useProfileOptimization && profileOptimizationResult && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Profil Optimizasyon Sonuçları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profil optimizasyonu sonuçları burada gösterilecek.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
