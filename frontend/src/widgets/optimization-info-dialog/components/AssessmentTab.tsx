/**
 * @fileoverview Assessment Tab Component for Training Simulation
 * @module AssessmentTab
 * @version 1.0.0
 */

import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Divider,
  Chip,
  Box,
  Alert,
} from "@mui/material";
import {
  Quiz as QuizIcon,
  EmojiEvents as TrophyIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  GpsFixed as PrecisionIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { AssessmentTabProps } from "../types";

/**
 * Assessment Tab Component
 */
export const AssessmentTab: React.FC<AssessmentTabProps> = ({
  operatorScore,
  safetyViolations,
  trainingProgress,
  operatorProfile,
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
              <QuizIcon color="primary" />
              Performans Değerlendirmesi
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Genel Puan: {Math.round(operatorScore)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(operatorScore, 100)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Güvenlik Skoru: {Math.max(100 - safetyViolations * 20, 0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.max(100 - safetyViolations * 20, 0)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: safetyViolations === 0 ? "#4caf50" : "#f44336",
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                İlerleme: {Math.round(trainingProgress)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={trainingProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  "& .MuiLinearProgress-bar": { bgcolor: "#2196f3" },
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Sertifikalar
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {operatorProfile.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  color="success"
                  variant="outlined"
                  icon={<CheckIcon />}
                />
              ))}
              {operatorProfile.certifications.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Henüz sertifika alınmadı
                </Typography>
              )}
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
              <TrophyIcon color="primary" />
              Başarımlar ve Rozetler
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <TrophyIcon
                    sx={{
                      fontSize: 40,
                      color: operatorScore > 50 ? "#ffd700" : "#9e9e9e",
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    İlk Ders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <SecurityIcon
                    sx={{
                      fontSize: 40,
                      color: safetyViolations === 0 ? "#4caf50" : "#9e9e9e",
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Güvenlik Uzmanı
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <SpeedIcon
                    sx={{
                      fontSize: 40,
                      color: trainingProgress > 75 ? "#2196f3" : "#9e9e9e",
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Hızlı Öğrenen
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <PrecisionIcon
                    sx={{
                      fontSize: 40,
                      color: operatorScore > 100 ? "#9c27b0" : "#9e9e9e",
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Profesyonel
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Eğitim Önerileri
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {safetyViolations > 0 && (
                <Alert severity="warning">
                  Güvenlik kurallarına daha fazla dikkat edin
                </Alert>
              )}
              {operatorScore < 50 && (
                <Alert severity="info">
                  Temel eğitim modüllerini tekrar edin
                </Alert>
              )}
              {trainingProgress > 80 && (
                <Alert severity="success">
                  Mükemmel ilerleme! Bir sonraki seviyeye geçebilirsiniz
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
