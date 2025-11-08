/**
 * @fileoverview Upload Dialog Component
 * @module widgets/production-plan-manager/ui
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  useTheme
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { useUploadProductionPlan } from '@/entities/production-plan';
import { useQueryClient } from '@tanstack/react-query';

interface UploadDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useUploadProductionPlan();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan büyük olamaz');
      return;
    }

    setSelectedFile(file);
    // Auto-upload after file selection
    handleUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    try {
      setUploadProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadMutation.mutateAsync({ file: fileToUpload });
      
      console.log('✅ [UploadDialog] Upload result:', result);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        console.log('✅ [UploadDialog] Upload successful, calling onSuccess...');
        // Mutation onSuccess will handle cache invalidation
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1000);
      } else {
        console.error('❌ [UploadDialog] Upload failed:', result);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    uploadMutation.reset();
    onClose();
  };

  const isUploading = uploadMutation.isPending || uploadProgress > 0;
  const isSuccess = uploadMutation.isSuccess && uploadProgress === 100;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={false}
      sx={{
        zIndex: 9999,
        '& .MuiDialog-paper': {
          zIndex: 9999,
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          py: ds.spacing['6'],
          background: ds.gradients.primary,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 700,
        }}
      >
        Üretim Planı Yükle
      </DialogTitle>

      <DialogContent sx={{ px: ds.spacing['6'], pb: ds.spacing['4'] }}>
        {uploadMutation.error && (
          <Alert 
            severity="error" 
            sx={{ mb: ds.spacing['4'] }}
          >
            {uploadMutation.error.message || 'Dosya yüklenirken hata oluştu'}
          </Alert>
        )}

        {isSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: ds.spacing['4'] }}
            icon={<CheckCircleIcon />}
          >
            Üretim planı başarıyla yüklendi!
          </Alert>
        )}

        {!selectedFile ? (
          <Box
            sx={{
              border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
              borderRadius: ds.borderRadius['lg'],
              p: ds.spacing['8'],
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              backgroundColor: dragActive ? theme.palette.primary.light + '20' : 'transparent',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light + '10',
              }
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <CloudUploadIcon 
              sx={{ 
                fontSize: 48, 
                color: theme.palette.grey[400],
                mb: ds.spacing['3']
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: ds.spacing['2']
              }}
            >
              Excel dosyasını sürükleyin veya tıklayın
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.grey[600],
                mb: ds.spacing['3']
              }}
            >
              .xlsx, .xls dosyaları desteklenir (Max: 10MB)
            </Typography>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.xlsm"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: ds.spacing['3'],
                p: ds.spacing['4'],
                backgroundColor: theme.palette.grey[50],
                borderRadius: ds.borderRadius['lg'],
                mb: ds.spacing['4']
              }}
            >
              <CloudUploadIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              <Chip 
                label="Excel" 
                color="primary" 
                size="small" 
                variant="outlined"
              />
            </Box>

            {isUploading && (
              <Box>
                <Typography variant="body2" sx={{ mb: ds.spacing['2'] }}>
                  Yükleniyor... {uploadProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: ds.borderRadius['sm'],
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: ds.borderRadius['sm'],
                      background: ds.gradients.primary,
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: ds.spacing['6'], pb: ds.spacing['6'] }}>
        <Button
          onClick={handleClose}
          disabled={isUploading}
          sx={{ mr: ds.spacing['2'] }}
        >
          {isSuccess ? 'Tamam' : 'İptal'}
        </Button>
        
        {selectedFile && !isSuccess && (
          <Button
            onClick={() => handleUpload()}
            variant="contained"
            disabled={isUploading}
            sx={{
              background: ds.gradients.primary,
              px: ds.spacing['4'],
              py: ds.spacing['2'],
              fontWeight: 600,
              borderRadius: ds.borderRadius['lg'],
            }}
          >
            {isUploading ? 'Yükleniyor...' : 'Yükle'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
