/**
 * Export Dialog Component
 * Advanced export dialog with options
 *
 * @module features/export-results/ui
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Stack,
  Divider,
} from "@mui/material";
import type {
  ExportFormat,
  ExportOptimizationRequest,
} from "@/entities/optimization";

export interface ExportDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onExport: (
    format: ExportFormat,
    options?: ExportOptimizationRequest["options"],
  ) => void;
  readonly isLoading?: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  onExport,
  isLoading = false,
}) => {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  const handleExport = () => {
    onExport(format, {
      includeCharts,
      includeMetrics,
      includeRecommendations,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sonuçları Dışa Aktar</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Dosya Formatı
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
            >
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label="Excel (.xlsx) - Tablo formatı"
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label="PDF (.pdf) - Yazdırılabilir rapor"
              />
              <FormControlLabel
                value="json"
                control={<Radio />}
                label="JSON (.json) - Ham veri"
              />
            </RadioGroup>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              İçerik Seçenekleri
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                  />
                }
                label="Grafikler ve görselleştirmeler"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeMetrics}
                    onChange={(e) => setIncludeMetrics(e.target.checked)}
                  />
                }
                label="Performans metrikleri"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeRecommendations}
                    onChange={(e) =>
                      setIncludeRecommendations(e.target.checked)
                    }
                  />
                }
                label="Öneriler ve iyileştirmeler"
              />
            </FormGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          İptal
        </Button>
        <Button onClick={handleExport} variant="contained" disabled={isLoading}>
          {isLoading ? "İndiriliyor..." : "İndir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
