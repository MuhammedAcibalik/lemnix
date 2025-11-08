/**
 * @fileoverview Safety Tab Component for Training Simulation
 * @module SafetyTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Button,
  Box
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { SafetyTabProps } from '../types';

/**
 * Safety Tab Component
 */
export const SafetyTab: React.FC<SafetyTabProps> = ({
  workshopState,
  onWorkshopStateChange
}) => {
  return (
    <Grid container spacing={3} sx={{ height: '100%' }}>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Güvenlik Ekipmanları
            </Typography>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Kişisel Koruyucu Donanım (KKD)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={workshopState.safetyGearOn}
                        onChange={(e) => onWorkshopStateChange({ safetyGearOn: e.target.checked })}
                      />
                    }
                    label="Güvenlik Gözlüğü"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="İş Eldiveni"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="İş Ayakkabısı"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="İş Kıyafeti"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Çalışma Alanı Güvenliği</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={<Switch />}
                    label="Acil Çıkış Yolları Açık"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Yangın Söndürücü Hazır"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="İlk Yardım Çantası Erişilebilir"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Çalışma Alanı Temiz"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Acil Durum Prosedürleri</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="outlined" color="error" startIcon={<WarningIcon />}>
                    Acil Durdurma Butonu Test Et
                  </Button>
                  <Button variant="outlined" color="warning" startIcon={<InfoIcon />}>
                    Acil Durum Numaraları
                  </Button>
                  <Button variant="outlined" color="info" startIcon={<SecurityIcon />}>
                    Güvenlik Protokolleri
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              3D Güvenlik Simülasyonu
            </Typography>

            <Box sx={{
              position: 'relative',
              width: '100%',
              height: '400px',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              borderRadius: 2,
              border: '2px solid #2196f3',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              {/* Operatör Karakteri */}
              <Box sx={{
                width: '80px',
                height: '100px',
                background: workshopState.safetyGearOn 
                  ? 'linear-gradient(180deg, #4caf50, #2e7d32)' 
                  : 'linear-gradient(180deg, #f44336, #c62828)',
                borderRadius: '40px 40px 20px 20px',
                position: 'relative',
                transition: 'all 0.3s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '50px',
                  height: '25px',
                  background: workshopState.safetyGearOn ? '#4caf50' : '#f44336',
                  borderRadius: '25px 25px 8px 8px',
                  transition: 'all 0.3s ease'
                }
              }} />

              {/* Güvenlik Ekipmanları */}
              <Box sx={{
                position: 'absolute',
                top: '20%',
                right: '20%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                <Box sx={{
                  width: '40px',
                  height: '25px',
                  background: '#17a2b8',
                  borderRadius: 2,
                  opacity: workshopState.safetyGearOn ? 1 : 0.3,
                  transition: 'opacity 0.3s ease'
                }} />
                <Box sx={{
                  width: '35px',
                  height: '20px',
                  background: '#6f42c1',
                  borderRadius: 2,
                  opacity: workshopState.safetyGearOn ? 1 : 0.3,
                  transition: 'opacity 0.3s ease'
                }} />
              </Box>

              {/* Güvenlik Durumu */}
              <Box sx={{
                position: 'absolute',
                bottom: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: workshopState.safetyGearOn ? 'rgba(76,175,80,0.9)' : 'rgba(244,67,54,0.9)',
                color: 'white',
                padding: 2,
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {workshopState.safetyGearOn ? '✅ Güvenli' : '❌ Güvensiz'}
                </Typography>
                <Typography variant="body2">
                  {workshopState.safetyGearOn 
                    ? 'Tüm güvenlik ekipmanları takılı' 
                    : 'Güvenlik ekipmanları eksik'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
