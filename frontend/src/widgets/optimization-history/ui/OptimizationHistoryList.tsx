/**
 * Optimization History List Component
 * Full-featured history list with filtering and pagination
 *
 * @module widgets/optimization-history
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  useOptimizationHistory,
  ALGORITHM_CATALOG,
  type AlgorithmType,
} from "@/entities/optimization";

export interface OptimizationHistoryListProps {
  readonly onViewDetails?: (id: string) => void;
  readonly onExport?: (id: string) => void;
}

export const OptimizationHistoryList: React.FC<
  OptimizationHistoryListProps
> = ({ onViewDetails, onExport }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [algorithmFilter, setAlgorithmFilter] = useState<AlgorithmType | "all">(
    "all",
  );

  const {
    data: history,
    isLoading,
    error,
  } = useOptimizationHistory({
    page: page + 1,
    pageSize: rowsPerPage,
    ...(algorithmFilter !== "all" ? { algorithm: algorithmFilter } : {}),
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      {/* Filters */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          select
          label="Algoritma"
          value={algorithmFilter}
          onChange={(e) =>
            setAlgorithmFilter(e.target.value as AlgorithmType | "all")
          }
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Tümü</MenuItem>
          <MenuItem value="ffd">FFD</MenuItem>
          <MenuItem value="bfd">BFD</MenuItem>
          <MenuItem value="genetic">Genetic</MenuItem>
          <MenuItem value="pooling">Pooling</MenuItem>
        </TextField>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Geçmiş yüklenemedi
          </Alert>
        )}

        {!isLoading && !error && history && history.length === 0 && (
          <Alert severity="info" sx={{ m: 2 }}>
            {algorithmFilter === "all"
              ? "Henüz optimizasyon geçmişi yok"
              : "Bu algoritma için kayıt bulunamadı"}
          </Alert>
        )}

        {!isLoading && !error && history && history.length > 0 && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tarih</TableCell>
                  <TableCell>Algoritma</TableCell>
                  <TableCell align="right">Parça Sayısı</TableCell>
                  <TableCell align="right">Verimlilik</TableCell>
                  <TableCell align="right">Atık</TableCell>
                  <TableCell align="right">Süre</TableCell>
                  <TableCell align="center">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => {
                  const algorithm = item.result.algorithm;
                  const algorithmInfo = ALGORITHM_CATALOG[algorithm];
                  const efficiency = item.result.totalEfficiency;
                  const wastePercentage = item.result.wastePercentage;
                  const executionTime = item.result.executionTime;

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{algorithmInfo.icon}</span>
                          <Typography variant="body2">
                            {algorithmInfo.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.request.items.length}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${efficiency.toFixed(1)}%`}
                          size="small"
                          color={
                            efficiency >= 90
                              ? "success"
                              : efficiency >= 75
                                ? "warning"
                                : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${wastePercentage.toFixed(1)}%`}
                          size="small"
                          color={
                            wastePercentage <= 5
                              ? "success"
                              : wastePercentage <= 10
                                ? "warning"
                                : "error"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">
                          {executionTime < 1000
                            ? `${executionTime}ms`
                            : `${(executionTime / 1000).toFixed(1)}s`}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          {onViewDetails && (
                            <IconButton
                              size="small"
                              onClick={() => onViewDetails(item.id)}
                              title="Detayları Görüntüle"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          )}
                          {onExport && (
                            <IconButton
                              size="small"
                              onClick={() => onExport(item.id)}
                              title="Dışa Aktar"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={-1} // Unknown total, infinite scroll
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Sayfa başına satır:"
              labelDisplayedRows={({ from, to }) => `${from}-${to}`}
            />
          </>
        )}
      </TableContainer>
    </Box>
  );
};
