/**
 * @fileoverview Training Overview Component for Simulation Tab
 * @module TrainingOverview
 * @version 1.0.0
 */

import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Divider,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  Security as SafetyIcon,
  GpsFixed as PrecisionIcon,
  Engineering as EngineeringIcon,
} from "@mui/icons-material";
import { TrainingOverviewProps } from "../types";

/**
 * Training Overview Component
 */
export const TrainingOverview: React.FC<TrainingOverviewProps> = ({
  trainingMode,
  onTrainingModeChange,
  isTrainingActive,
  onStartTraining,
  onStopTraining,
  onResetTraining,
  operatorProfile,
  trainingModules,
  currentModule,
  onStartModule,
}) => {
  return (
    <Grid container spacing={3} sx={{ height: "100%" }}>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PersonIcon color="primary" />
              Operatör Profili
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: "primary.main" }}>
                {operatorProfile.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{operatorProfile.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {trainingMode === "beginner"
                    ? "Başlangıç Seviyesi"
                    : trainingMode === "intermediate"
                      ? "Orta Seviye"
                      : "İleri Seviye"}
                </Typography>
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Eğitim Seviyesi</InputLabel>
              <Select
                value={trainingMode}
                onChange={(e) =>
                  onTrainingModeChange(
                    e.target.value as "beginner" | "intermediate" | "advanced",
                  )
                }
                label="Eğitim Seviyesi"
                disabled={isTrainingActive}
              >
                <MenuItem value="beginner">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SafetyIcon sx={{ color: "#4caf50" }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Başlangıç
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Temel güvenlik ve makine kullanımı
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="intermediate">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PrecisionIcon sx={{ color: "#ff9800" }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Orta Seviye
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hassas ölçüm ve kesim teknikleri
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="advanced">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EngineeringIcon sx={{ color: "#f44336" }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        İleri Seviye
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Karmaşık kesimler ve optimizasyon
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={onStartTraining}
                disabled={isTrainingActive}
                sx={{ flex: 1 }}
              >
                Eğitimi Başlat
              </Button>
              <Button
                variant="outlined"
                startIcon={<PauseIcon />}
                onClick={onStopTraining}
                disabled={!isTrainingActive}
                sx={{ flex: 1 }}
              >
                Durdur
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={onResetTraining}
                sx={{ flex: 1 }}
              >
                Sıfırla
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Performans Metrikleri
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Hız</Typography>
                <Typography variant="body2" color="primary.main">
                  {operatorProfile.performance.speed}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={operatorProfile.performance.speed}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Hassasiyet</Typography>
                <Typography variant="body2" color="success.main">
                  {operatorProfile.performance.accuracy}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={operatorProfile.performance.accuracy}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  "& .MuiLinearProgress-bar": { bgcolor: "#4caf50" },
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Güvenlik</Typography>
                <Typography
                  variant="body2"
                  color={
                    operatorProfile.performance.safety > 80
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {operatorProfile.performance.safety}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={operatorProfile.performance.safety}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  "& .MuiLinearProgress-bar": {
                    bgcolor:
                      operatorProfile.performance.safety > 80
                        ? "#4caf50"
                        : "#f44336",
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Verimlilik</Typography>
                <Typography variant="body2" color="info.main">
                  {operatorProfile.performance.efficiency}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={operatorProfile.performance.efficiency}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  "& .MuiLinearProgress-bar": { bgcolor: "#2196f3" },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SchoolIcon color="primary" />
              Eğitim Modülleri
            </Typography>

            <Stepper
              activeStep={currentModule}
              orientation="vertical"
              sx={{ height: "100%" }}
            >
              {trainingModules[trainingMode].map((module, index) => (
                <Step key={module.id}>
                  <StepLabel
                    optional={
                      <Typography variant="caption">
                        {module.duration} dk • {module.points} puan
                      </Typography>
                    }
                  >
                    {module.title}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {module.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Gerekli Beceriler:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {module.skills?.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => onStartModule(module)}
                        disabled={isTrainingActive && currentModule !== index}
                      >
                        Başlat
                      </Button>
                      <Button variant="outlined">Detaylar</Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
