/**
 * @fileoverview Settings Dialog Component
 * @module SettingsDialog
 * @version 1.0.0
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Slider
} from '@mui/material';
import {
  SettingsDialogProps
} from '../types';

/**
 * Settings Dialog Component
 */
export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  settings,
  onClose,
  onSettingsChange
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1600 }}
    >
      <DialogTitle>Görünüm Ayarları</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showLabels}
                onChange={(e) => onSettingsChange({ showLabels: e.target.checked })}
              />
            }
            label="Profil Etiketlerini Göster"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.showMeasurements}
                onChange={(e) => onSettingsChange({ showMeasurements: e.target.checked })}
              />
            }
            label="Ölçüleri Göster"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.showColors}
                onChange={(e) => onSettingsChange({ showColors: e.target.checked })}
              />
            }
            label="Renkleri Göster"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.showWaste}
                onChange={(e) => onSettingsChange({ showWaste: e.target.checked })}
              />
            }
            label="Fire Alanlarını Göster"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Yakınlaştırma: {(settings.zoomLevel * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={settings.zoomLevel}
              onChange={(_, value) => onSettingsChange({ zoomLevel: value as number })}
              min={0.5}
              max={3}
              step={0.1}
              marks={[
                { value: 0.5, label: '50%' },
                { value: 1, label: '100%' },
                { value: 2, label: '200%' },
                { value: 3, label: '300%' }
              ]}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};
