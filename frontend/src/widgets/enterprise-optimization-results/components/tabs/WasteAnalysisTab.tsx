/**
 * @fileoverview Waste Analysis Tab Component
 * @module WasteAnalysisTab
 * @version 1.0.0
 */

import React from "react";
import { OptimizationResult, Cut } from "../../types";
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Grid,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

interface WasteAnalysisTabProps {
  result: OptimizationResult;
}

export const WasteAnalysisTab: React.FC<WasteAnalysisTabProps> = ({
  result,
}) => {
  if (!result) {
    return (
      <Alert severity="info">
        <AlertTitle>Veri Bulunamadı</AlertTitle>
        Optimizasyon sonuçları henüz mevcut değil.
      </Alert>
    );
  }

  // Calculate waste analysis
  const wasteAnalysis = React.useMemo(() => {
    if (!result?.cuts) return null;

    const categories = {
      minimal: 0,
      small: 0,
      medium: 0,
      large: 0,
      excessive: 0,
      reclaimable: 0,
    };

    (result.cuts as Cut[]).forEach((cut: Cut) => {
      const waste = cut.remainingLength || 0;
      if (waste < 50) categories.minimal++;
      else if (waste < 100) categories.small++;
      else if (waste < 200) categories.medium++;
      else if (waste < 500) categories.large++;
      else categories.excessive++;

      if (cut.isReclaimable) categories.reclaimable++;
    });

    return categories;
  }, [result]);

  return (
    <Box>
      {/* Atık Analizi */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity={result.wastePercentage < 10 ? "success" : "warning"}>
            <AlertTitle>
              Atık Oranı: %{result.wastePercentage?.toFixed(1)}
            </AlertTitle>
            {result.wastePercentage < 10
              ? "Mükemmel! Atık oranı endüstri standardının altında."
              : "Atık oranını azaltmak için farklı algoritmalar deneyin."}
          </Alert>
        </Grid>
        {wasteAnalysis && (
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kategori</TableCell>
                    <TableCell align="center">Adet</TableCell>
                    <TableCell align="center">Yüzde</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(wasteAnalysis).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </TableCell>
                      <TableCell align="center">{value}</TableCell>
                      <TableCell align="center">
                        {((value / result.stockCount) * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {key === "reclaimable" && value > 0 && (
                          <Chip
                            label="Geri Kazanılabilir"
                            color="success"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
