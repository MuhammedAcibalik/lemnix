/**
 * @fileoverview Production Plan Table Component
 * @module widgets/production-plan-manager/ui
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
  Button,
  alpha,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  DEPARTMENT_MAPPING,
} from "@/entities/production-plan";
import type {
  ProductionPlan,
  ProductionPlanFilters,
} from "@/entities/production-plan";

interface ProductionPlanTableProps {
  readonly plans: ProductionPlan[];
  readonly loading: boolean;
  readonly error: unknown;
  readonly filters: ProductionPlanFilters;
  readonly onFiltersChange: (filters: ProductionPlanFilters) => void;
}

export const ProductionPlanTable: React.FC<ProductionPlanTableProps> = ({
  plans,
  loading,
  error,
  filters,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();

  // Selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Get all item IDs from all plans
  const allItemIds = plans.flatMap((plan) => plan.items.map((item) => item.id));

  // Handle individual item selection
  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(allItemIds);
      setSelectAll(true);
    } else {
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  // Handle create cutting list

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityChip = (priority: string) => {
    // Eğer priority boş veya undefined ise, varsayılan değer ver
    if (!priority || priority.trim() === "") {
      return (
        <Chip
          label="Belirtilmemiş"
          color="default"
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            fontSize: "0.75rem",
            height: 24,
          }}
        />
      );
    }

    const color = PRIORITY_COLORS[priority] || "default";
    const label = PRIORITY_LABELS[priority] || priority;

    return (
      <Chip
        label={label}
        color={color as any}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 600,
          fontSize: "0.75rem",
          height: 24,
        }}
      />
    );
  };

  const getDepartmentChip = (department: string) => {
    // Rakamları isimlere çevir
    const displayName = DEPARTMENT_MAPPING[department] || department;

    // Bölüm bazlı renkler (isimlere göre)
    const getDepartmentColor = (dept: string) => {
      switch (dept) {
        case "MONTAJ":
          return {
            bg: theme.palette.primary.light + "20",
            color: theme.palette.primary.main,
          };
        case "HELEZON":
          return {
            bg: theme.palette.success.light + "20",
            color: theme.palette.success.main,
          };
        case "ABOARD":
          return {
            bg: theme.palette.warning.light + "20",
            color: theme.palette.warning.main,
          };
        case "UYUP":
          return {
            bg: theme.palette.error.light + "20",
            color: theme.palette.error.main,
          };
        default:
          return {
            bg: theme.palette.grey[300] + "20",
            color: theme.palette.grey[600],
          };
      }
    };

    const colors = getDepartmentColor(displayName);

    return (
      <Chip
        label={displayName}
        size="small"
        variant="filled"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
          fontSize: "0.7rem",
          height: 20,
        }}
      />
    );
  };

  if (error) {
    return (
      <Box sx={{ p: ds.spacing["6"], textAlign: "center" }}>
        <Typography color="error" variant="h6">
          Veriler yüklenirken hata oluştu
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: ds.spacing["4"] }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ mb: ds.spacing["3"] }}>
            <Skeleton
              variant="rectangular"
              height={60}
              sx={{ borderRadius: ds.borderRadius["lg"] }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (plans.length === 0) {
    return (
      <Box sx={{ p: ds.spacing["6"], textAlign: "center" }}>
        <CalendarIcon
          sx={{
            fontSize: 48,
            color: theme.palette.grey[400],
            mb: ds.spacing["2"],
          }}
        />
        <Typography variant="h6" color="text.secondary">
          Seçili filtrelerle eşleşen kayıt yok
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: ds.spacing["1"] }}
        >
          Farklı filtre kombinasyonu deneyin
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Action Bar */}
      {selectedItems.length > 0 && (
        <Box
          sx={{
            p: ds.spacing["2"],
            bgcolor: theme.palette.primary.light + "10",
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: ds.borderRadius["md"],
            mb: ds.spacing["2"],
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
            {selectedItems.length} item seçildi
          </Typography>
          <Box sx={{ display: "flex", gap: ds.spacing["1"] }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSelectedItems([]);
                setSelectAll(false);
              }}
              sx={{ fontSize: "0.75rem" }}
            >
              Seçimi Temizle
            </Button>
          </Box>
        </Box>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          overflow: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "&": {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  minWidth: 60,
                  textAlign: "center",
                }}
              >
                Hafta
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 100 }}
              >
                Ad
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 120 }}
              >
                Sipariş Veren
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 100 }}
              >
                Müşteri No
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 120 }}
              >
                Müşteri Kalemi
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 120 }}
              >
                Sipariş
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 200 }}
              >
                Malzeme No
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.75rem", minWidth: 300 }}
              >
                Malzeme Açıklaması
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  minWidth: 80,
                  textAlign: "center",
                }}
              >
                Miktar
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                Bitiş Tarihi
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                Bölüm
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  minWidth: 100,
                  textAlign: "center",
                }}
              >
                Öncelik
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  width: 60,
                  textAlign: "center",
                }}
              >
                Seç
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.flatMap((plan) =>
              plan.items.map((item, index) => (
                <TableRow
                  key={`${plan.id}-${item.id}`}
                  hover
                  selected={selectedItems.includes(item.id)}
                  sx={{
                    "&:hover": {
                      backgroundColor: theme.palette.primary.light + "05",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor: theme.palette.grey[50],
                    },
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.light + "10",
                    },
                  }}
                >
                  {/* Hafta */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    >
                      {plan.weekNumber}
                    </Typography>
                  </TableCell>

                  {/* Ad */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        maxWidth: 100,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.ad}
                    >
                      {item.ad}
                    </Typography>
                  </TableCell>

                  {/* Sipariş Veren */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.siparisVeren}
                    >
                      {item.siparisVeren}
                    </Typography>
                  </TableCell>

                  {/* Müşteri No */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        maxWidth: 100,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.musteriNo}
                    >
                      {item.musteriNo}
                    </Typography>
                  </TableCell>

                  {/* Müşteri Kalemi */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.musteriKalemi}
                    >
                      {item.musteriKalemi}
                    </Typography>
                  </TableCell>

                  {/* Sipariş */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        maxWidth: 120,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.siparis}
                    >
                      {item.siparis}
                    </Typography>
                  </TableCell>

                  {/* Malzeme No */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        wordBreak: "break-all",
                      }}
                    >
                      {item.malzemeNo}
                    </Typography>
                  </TableCell>

                  {/* Malzeme Açıklaması */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.malzemeKisaMetni}
                    </Typography>
                  </TableCell>

                  {/* Miktar */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      {item.miktar}
                    </Typography>
                  </TableCell>

                  {/* Bitiş Tarihi */}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                      {formatDate(item.planlananBitisTarihi)}
                    </Typography>
                  </TableCell>

                  {/* Bölüm */}
                  <TableCell sx={{ textAlign: "center" }}>
                    {getDepartmentChip(item.bolum)}
                  </TableCell>

                  {/* Öncelik */}
                  <TableCell sx={{ textAlign: "center" }}>
                    {getPriorityChip(item.oncelik)}
                  </TableCell>

                  {/* Selection Button */}
                  <TableCell sx={{ textAlign: "center", width: 60 }}>
                    <Tooltip
                      title={
                        selectedItems.includes(item.id)
                          ? "Seçimi kaldır"
                          : "Seç"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleItemSelect(
                            item.id,
                            !selectedItems.includes(item.id),
                          )
                        }
                        sx={{
                          color: selectedItems.includes(item.id)
                            ? theme.palette.primary.main
                            : theme.palette.grey[400],
                          "&:hover": {
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1,
                            ),
                          },
                        }}
                      >
                        {selectedItems.includes(item.id) ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
