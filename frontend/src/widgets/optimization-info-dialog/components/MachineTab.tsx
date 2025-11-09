/**
 * @fileoverview Machine Tab Component for Training Simulation
 * @module MachineTab
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
  Slider,
  Box,
} from "@mui/material";
import {
  Build as BuildIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { MachineTabProps } from "../types";

/**
 * Machine Tab Component
 */
export const MachineTab: React.FC<MachineTabProps> = ({
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
              <BuildIcon color="primary" />
              Makine Kontrolleri
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Makine Durumu
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={workshopState.machineOn}
                    onChange={(e) =>
                      onWorkshopStateChange({ machineOn: e.target.checked })
                    }
                  />
                }
                label={
                  workshopState.machineOn ? "Makine Açık" : "Makine Kapalı"
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bıçak Hızı: {workshopState.machineSettings.bladeSpeed} RPM
              </Typography>
              <Slider
                value={workshopState.machineSettings.bladeSpeed}
                onChange={(_, value) =>
                  onWorkshopStateChange({
                    machineSettings: {
                      ...workshopState.machineSettings,
                      bladeSpeed: value as number,
                    },
                  })
                }
                min={0}
                max={3000}
                step={100}
                disabled={!workshopState.machineOn}
                sx={{ color: "#f59e0b" }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Kesim Derinliği: {workshopState.machineSettings.cuttingDepth} mm
              </Typography>
              <Slider
                value={workshopState.machineSettings.cuttingDepth}
                onChange={(_, value) =>
                  onWorkshopStateChange({
                    machineSettings: {
                      ...workshopState.machineSettings,
                      cuttingDepth: value as number,
                    },
                  })
                }
                min={0}
                max={50}
                step={1}
                disabled={!workshopState.machineOn}
                sx={{ color: "#e53e3e" }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Besleme Hızı: {workshopState.machineSettings.feedRate} mm/min
              </Typography>
              <Slider
                value={workshopState.machineSettings.feedRate}
                onChange={(_, value) =>
                  onWorkshopStateChange({
                    machineSettings: {
                      ...workshopState.machineSettings,
                      feedRate: value as number,
                    },
                  })
                }
                min={0}
                max={1000}
                step={50}
                disabled={!workshopState.machineOn}
                sx={{ color: "#60a5fa" }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Soğutma Akışı: {workshopState.machineSettings.coolantFlow}%
              </Typography>
              <Slider
                value={workshopState.machineSettings.coolantFlow}
                onChange={(_, value) =>
                  onWorkshopStateChange({
                    machineSettings: {
                      ...workshopState.machineSettings,
                      coolantFlow: value as number,
                    },
                  })
                }
                min={0}
                max={100}
                step={5}
                disabled={!workshopState.machineOn}
                sx={{ color: "#22c55e" }}
              />
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
              <SettingsIcon color="primary" />
              3D Makine Simülasyonu
            </Typography>

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "400px",
                background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                borderRadius: 2,
                border: "2px solid #9c27b0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {/* Kesim Masası */}
              <Box
                sx={{
                  width: "250px",
                  height: "30px",
                  background: "linear-gradient(90deg, #6c757d, #495057)",
                  borderRadius: 2,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "10%",
                    right: "10%",
                    height: "3px",
                    background: "linear-gradient(90deg, #28a745, #20c997)",
                    borderRadius: 1,
                  },
                }}
              />

              {/* Testere Bıçağı */}
              <Box
                sx={{
                  width: "8px",
                  height: "80px",
                  background: workshopState.machineOn
                    ? "linear-gradient(180deg, #e53e3e, #c53030, #9b2c2c)"
                    : "linear-gradient(180deg, #6b7280, #4b5563)",
                  borderRadius: "4px",
                  boxShadow: workshopState.machineOn
                    ? "0 0 20px rgba(229,62,62,0.8)"
                    : "none",
                  animation: workshopState.machineOn
                    ? "sawBlade3D 0.1s infinite"
                    : "none",
                  "@keyframes sawBlade3D": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />

              {/* Makine Durumu */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "20%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: workshopState.machineOn
                    ? "rgba(76,175,80,0.9)"
                    : "rgba(108,117,125,0.9)",
                  color: "white",
                  padding: 2,
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {workshopState.machineOn ? "🟢 Çalışıyor" : "🔴 Durdu"}
                </Typography>
                <Typography variant="body2">
                  Hız: {workshopState.machineSettings.bladeSpeed} RPM
                </Typography>
                <Typography variant="body2">
                  Derinlik: {workshopState.machineSettings.cuttingDepth} mm
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
