/**
 * @fileoverview Cutting List Section Component
 * @module EnterpriseOptimizationForm/Components/CuttingListSection
 * @version 1.0.0
 */

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import { Add as AddIcon, ContentCut as CutIcon } from "@mui/icons-material";
import { FormCuttingListItem, LengthUnit } from "../types";

interface CuttingListSectionProps {
  cuttingList: FormCuttingListItem[];
  unit: LengthUnit;
  onAddItem: () => void;
  onAddSampleItems: () => void;
  onUnitChange: (unit: LengthUnit) => void;
  errors: Record<string, string>;
}

export const CuttingListSection: React.FC<CuttingListSectionProps> = ({
  cuttingList,
  unit,
  onAddItem,
  onAddSampleItems,
  onUnitChange,
  errors,
}) => {
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            <CutIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kesim Listesi
          </Typography>
          <Chip
            label={`${cuttingList.length} parça`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        {/* Manual Entry Section */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(217,119,6,0.05) 100%)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                }}
              >
                <AddIcon sx={{ fontSize: 24, color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Manuel Parça Ekleme
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mevcut kesim listesi yoksa manuel olarak parça
                  ekleyebilirsiniz
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAddItem}
                    sx={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(59,130,246,0.4)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Yeni Parça Ekle
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onAddSampleItems}
                    sx={{
                      border: "2px solid #f59e0b",
                      color: "#f59e0b",
                      "&:hover": {
                        border: "2px solid #d97706",
                        background: "rgba(245,158,11,0.05)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Örnek Veriler Ekle
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Birim</InputLabel>
                  <Select
                    value={unit}
                    label="Birim"
                    onChange={(e) => onUnitChange(e.target.value as LengthUnit)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="mm">Milimetre (mm)</MenuItem>
                    <MenuItem value="cm">Santimetre (cm)</MenuItem>
                    <MenuItem value="m">Metre (m)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {cuttingList.length > 0 && (
              <Alert
                severity="success"
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.05) 100%)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">
                  {cuttingList.length} parça eklendi. Devam etmek için
                  "Optimizasyonu Başlat" butonuna tıklayın.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>

        {errors.cuttingList && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {errors.cuttingList}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
