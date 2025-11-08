/**
 * @fileoverview Cutting Plan Modal Component
 * @module CuttingPlanModal
 * @version 1.0.0
 */

import React from 'react';
import { Cut } from '../types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  Grid,
  Paper
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  ContentCut as CutIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface CuttingPlanModalProps {
  open: boolean;
  stock: Cut;
  onClose: () => void;
}

export const CuttingPlanModal: React.FC<CuttingPlanModalProps> = ({
  open,
  stock,
  onClose
}) => {
  console.log('🔍 CuttingPlanModal render:', { open, stock, onClose: typeof onClose });
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(30,64,175,0.1)', // Industrial Harmony
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.08)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', // Industrial Harmony
        color: 'white',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <EngineeringIcon />
        Kesim Planı Detayları
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {stock && (
          <Stack spacing={3}>
            {/* Header Info */}
            <Box sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(124,58,237,0.05) 100%)', // Industrial Harmony
              borderRadius: 2,
              border: '1px solid rgba(30,64,175,0.1)' // Industrial Harmony
            }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                İş Emri: {stock.workOrderId || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Algoritma:</strong> {stock.algorithmName || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Stok Uzunluğu:</strong> {stock.length || 0}mm • <strong>Profil Sayısı:</strong> {stock.count || 0} adet
              </Typography>
            </Box>

            {/* Cutting Details */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="semibold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CutIcon />
                  Kesim Detayları
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', // Industrial Harmony
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(30,64,175,0.3)', // Industrial Harmony
                  }}
                >
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                  Bilgi
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(30,64,175,0.05)', border: '1px solid rgba(30,64,175,0.1)' }}> {/* Industrial Harmony */}
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {stock.totalPieces || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toplam Parça
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.1)' }}> {/* Precision Green */}
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {stock.count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Profil Sayısı
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {stock.count ? Math.round((stock.waste || 0) / stock.count) : 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ort. Atık (mm)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)' }}> {/* Tech Purple */}
                    <Typography variant="h6" fontWeight="bold" color="secondary.main">
                      {stock.length && stock.count && stock.used ? 
                        ((stock.used / (stock.length * stock.count)) * 100).toFixed(1) : '0.0'}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Verimlilik
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Summary */}
            <Box sx={{ 
              p: 2, 
              background: 'linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(124,58,237,0.05) 100%)', // Industrial Harmony
              borderRadius: 2,
              border: '1px solid rgba(30,64,175,0.1)' // Industrial Harmony
            }}>
              <Typography variant="h6" fontWeight="semibold" gutterBottom color="primary.dark">
                ✅ Sonuç
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • <strong>{stock.count || 0}</strong> boy profil kullanıldı
                </Typography>
                <Typography variant="body2">
                  • <strong>{stock.used?.toLocaleString() || 0}</strong>mm toplam kesim yapıldı
                </Typography>
                <Typography variant="body2">
                  • <strong>{stock.length && stock.count && stock.used ? 
                    ((stock.used / (stock.length * stock.count)) * 100).toFixed(1) : '0.0'}%</strong> verimlilik sağlandı
                </Typography>
                <Typography variant="body2">
                  • Ortalama <strong>{stock.count && stock.waste ? Math.round(stock.waste / stock.count) : 0}mm</strong> atık
                </Typography>
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)', // Industrial Harmony
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(30,64,175,0.3)', // Industrial Harmony
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #1e40af 100%)', // Industrial Harmony
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(30,64,175,0.4)', // Industrial Harmony
            },
          }}
        >
          Tamam
        </Button>
      </DialogActions>
    </Dialog>
  );
};
