/**
 * Algorithm Performance Card Component
 * Displays algorithm comparison
 *
 * @module widgets/statistics-dashboard
 * @version 1.0.0
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BarChart as ChartIcon } from "@mui/icons-material";
import { useAlgorithmPerformance } from "@/entities/statistics";
import { ALGORITHM_CATALOG, type AlgorithmType } from "@/entities/optimization";

export const AlgorithmPerformanceCard: React.FC = () => {
  const { data, isLoading, error } = useAlgorithmPerformance();

  return (
    <Card>
      <CardHeader
        avatar={<ChartIcon />}
        title="Algoritma Performansı"
        subheader="Algoritma karşılaştırması"
      />
      <CardContent>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error">Performans verileri yüklenemedi</Alert>
        )}

        {!isLoading && !error && data && data.length === 0 && (
          <Alert severity="info">Henüz yeterli veri yok</Alert>
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Algoritma</TableCell>
                  <TableCell align="right">Kullanım</TableCell>
                  <TableCell align="right">Ortalama Verimlilik</TableCell>
                  <TableCell align="right">Ortalama Atık</TableCell>
                  <TableCell align="right">Ortalama Süre</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => {
                  const algorithmInfo =
                    ALGORITHM_CATALOG[item.algorithm as AlgorithmType];

                  return (
                    <TableRow key={item.algorithm} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{algorithmInfo?.icon}</span>
                          {algorithmInfo?.name || item.algorithm}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.count}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${item.averageEfficiency.toFixed(1)}%`}
                          size="small"
                          color={
                            item.averageEfficiency >= 90 ? "success" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        {item.averageWaste.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">
                        {item.averageTime < 1000
                          ? `${item.averageTime}ms`
                          : `${(item.averageTime / 1000).toFixed(1)}s`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};
