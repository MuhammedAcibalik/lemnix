/**
 * @fileoverview Production Plan Backorder Page - Overdue Items Tab
 * @module pages/production-plan-backorder-page
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { Card } from "@/shared/ui/Card";
import {
  useBackorderItems,
  type ProductionPlanFilters,
  type BackorderItem,
} from "@/entities/production-plan";
import { ProductionPlanFilters as ProductionPlanFiltersComponent } from "@/widgets/production-plan-manager/ui/ProductionPlanFilters";

export const ProductionPlanBackorderPage: React.FC = () => {
  const theme = useTheme();
  const ds = useDesignSystem();

  const [filters, setFilters] = useState<ProductionPlanFilters>({
    status: "active",
    page: 1,
    limit: 50,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Query
  const {
    data: backorderItems = [],
    isLoading,
    error,
    refetch,
  } = useBackorderItems(filters);

  const handleFiltersChange = (newFilters: ProductionPlanFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const calculateDaysOverdue = (planlananBitisTarihi: string): number => {
    const plannedDate = new Date(planlananBitisTarihi);
    const today = new Date();
    const diffTime = today.getTime() - plannedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRiskLevel = (daysOverdue: number): "high" | "medium" | "low" => {
    if (daysOverdue >= 15) return "high";
    if (daysOverdue >= 7) return "medium";
    return "low";
  };

  const getRiskColor = (riskLevel: "high" | "medium" | "low"): string => {
    switch (riskLevel) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getRiskLabel = (riskLevel: "high" | "medium" | "low"): string => {
    switch (riskLevel) {
      case "high":
        return "Yüksek Risk";
      case "medium":
        return "Orta Risk";
      case "low":
        return "Düşük Risk";
      default:
        return "Bilinmeyen";
    }
  };

  // Empty state
  if (!isLoading && backorderItems.length === 0 && !error) {
    return (
      <Box
        sx={{
          p: ds.spacing["4"],
          minHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: ds.spacing["3"],
        }}
      >
        <WarningIcon
          sx={{
            fontSize: 64,
            color: theme.palette.success.main,
            mb: ds.spacing["2"],
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: theme.palette.success.main,
            mb: ds.spacing["1"],
          }}
        >
          Gecikmiş İş Yok - Tebrikler! 🎉
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.grey[600],
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          Tüm üretim planı öğeleri zamanında tamamlanmış durumda
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[50],
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: ds.spacing["3"],
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: ds.spacing["2"],
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: "1.25rem",
              color: theme.palette.error.main,
              mb: ds.spacing["1"],
            }}
          >
            Backorder - Gecikmiş İşler
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[600],
              fontSize: "0.875rem",
            }}
          >
            {backorderItems.length} gecikmiş iş bulundu
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: ds.spacing["2"] }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              px: ds.spacing["3"],
              py: ds.spacing["1"],
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: ds.borderRadius["sm"],
            }}
          >
            {showFilters ? "Filtreleri Gizle" : "Filtreler"}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
            sx={{
              px: ds.spacing["3"],
              py: ds.spacing["1"],
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: ds.borderRadius["sm"],
            }}
          >
            Yenile
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: ds.spacing["3"] }}>
          <Card variant="outlined">
            <ProductionPlanFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Card>
        </Box>
      )}

      {/* Table */}
      <Card variant="outlined">
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  İş Tanımı
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Sipariş No
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Planlanan Bitiş
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Gecikme
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Risk Seviyesi
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Bölüm
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Öncelik
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Miktar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ textAlign: "center", py: ds.spacing["4"] }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Yükleniyor...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ textAlign: "center", py: ds.spacing["4"] }}
                  >
                    <Typography variant="body2" color="error">
                      Hata: {error.message}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : backorderItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ textAlign: "center", py: ds.spacing["4"] }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Gecikmiş iş bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                backorderItems.map((item: BackorderItem) => {
                  const daysOverdue = calculateDaysOverdue(
                    item.planlananBitisTarihi,
                  );
                  const riskLevel = getRiskLevel(daysOverdue);

                  return (
                    <TableRow
                      key={item.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.ad}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.malzemeKisaMetni}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {item.siparis}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(
                            item.planlananBitisTarihi,
                          ).toLocaleDateString("tr-TR")}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${daysOverdue} gün`}
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(riskLevel),
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRiskLabel(riskLevel)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: getRiskColor(riskLevel),
                            color: getRiskColor(riskLevel),
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.bolum}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.oncelik}
                          size="small"
                          color={
                            item.oncelik === "yuksek"
                              ? "error"
                              : item.oncelik === "orta"
                                ? "warning"
                                : "success"
                          }
                          sx={{ fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.miktar}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default ProductionPlanBackorderPage;
