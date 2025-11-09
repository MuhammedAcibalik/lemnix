/**
 * @fileoverview Cutting Tab Component for Training Simulation
 * @module CuttingTab
 * @version 1.0.0
 */

import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Box,
} from "@mui/material";
import {
  ContentCut as ContentCutIcon,
  Animation as AnimationIcon,
} from "@mui/icons-material";
import { CuttingTabProps } from "../types";

/**
 * Cutting Tab Component
 */
export const CuttingTab: React.FC<CuttingTabProps> = ({
  workshopState,
  onWorkshopStateChange,
}) => {
  return (
    <Grid container spacing={3} sx={{ height: "100%" }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ContentCutIcon color="primary" />
              Kesim Parametreleri
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Malzeme Yüklendi
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={workshopState.materialLoaded}
                    onChange={(e) =>
                      onWorkshopStateChange({
                        materialLoaded: e.target.checked,
                      })
                    }
                  />
                }
                label={
                  workshopState.materialLoaded ? "Malzeme Hazır" : "Malzeme Yok"
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Kesim İşlemi
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={workshopState.cuttingInProgress}
                    onChange={(e) =>
                      onWorkshopStateChange({
                        cuttingInProgress: e.target.checked,
                      })
                    }
                    disabled={
                      !workshopState.materialLoaded || !workshopState.machineOn
                    }
                  />
                }
                label={
                  workshopState.cuttingInProgress
                    ? "Kesim Devam Ediyor"
                    : "Kesim Bekliyor"
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Malzeme Tipi
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Malzeme Seçin</InputLabel>
                <Select
                  value={workshopState.currentMaterial || ""}
                  onChange={(e) =>
                    onWorkshopStateChange({ currentMaterial: e.target.value })
                  }
                  label="Malzeme Seçin"
                >
                  <MenuItem value="aluminum">Alüminyum Profil</MenuItem>
                  <MenuItem value="steel">Çelik Profil</MenuItem>
                  <MenuItem value="plastic">Plastik Profil</MenuItem>
                  <MenuItem value="composite">Kompozit Malzeme</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Kesim Kalitesi
              </Typography>
              <Rating value={4} readOnly size="large" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Mükemmel kesim kalitesi
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <AnimationIcon color="primary" />
              3D Kesim Simülasyonu
            </Typography>

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "400px",
                background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                borderRadius: 2,
                border: "2px solid #ff9800",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {/* Profil Çubuğu */}
              <Box
                sx={{
                  width: "200px",
                  height: "15px",
                  background:
                    workshopState.currentMaterial === "aluminum"
                      ? "linear-gradient(90deg, #ffc107, #fd7e14)"
                      : workshopState.currentMaterial === "steel"
                        ? "linear-gradient(90deg, #6c757d, #495057)"
                        : workshopState.currentMaterial === "plastic"
                          ? "linear-gradient(90deg, #17a2b8, #138496)"
                          : "linear-gradient(90deg, #6f42c1, #5a32a3)",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  animation: workshopState.cuttingInProgress
                    ? "materialCut 2s ease-in-out infinite"
                    : "none",
                  "@keyframes materialCut": {
                    "0%, 100%": { transform: "translateX(0px)" },
                    "50%": { transform: "translateX(20px)" },
                  },
                }}
              />

              {/* Kesim Kıvılcımları */}
              {workshopState.cuttingInProgress && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "20px",
                    height: "20px",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "4px",
                      height: "4px",
                      background:
                        "radial-gradient(circle, #fbbf24, #f59e0b, transparent)",
                      borderRadius: "50%",
                      animation: "spark1 0.3s infinite",
                      "@keyframes spark1": {
                        "0%": {
                          transform: "translate(-50%, -50%) scale(0)",
                          opacity: 1,
                        },
                        "100%": {
                          transform: "translate(-50%, -50%) scale(3)",
                          opacity: 0,
                        },
                      },
                    },
                  }}
                />
              )}

              {/* Kesim Durumu */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: workshopState.cuttingInProgress
                    ? "rgba(255,152,0,0.9)"
                    : "rgba(108,117,125,0.9)",
                  color: "white",
                  padding: 2,
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {workshopState.cuttingInProgress
                    ? "✂️ Kesim Devam Ediyor"
                    : "⏸️ Kesim Bekliyor"}
                </Typography>
                <Typography variant="body2">
                  Malzeme: {workshopState.currentMaterial || "Seçilmedi"}
                </Typography>
                <Typography variant="body2">Kalite: Mükemmel</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
