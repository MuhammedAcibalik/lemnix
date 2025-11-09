/**
 * Profile Management Upload Dialog
 * Design System v2.0 compliant
 */

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { alpha } from "@mui/material/styles";
import { useUploadProfileManagement } from "../model/useProfileManagement";

interface UploadDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onClose,
}) => {
  const ds = useDesignSystem();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const uploadMutation = useUploadProfileManagement();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    },
    [],
  );

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadMutation.mutateAsync(file);

      if (result.success) {
        setTimeout(() => {
          onClose();
          setFile(null);
        }, 2000);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      onClose();
      setFile(null);
      uploadMutation.reset();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: `${ds.borderRadius.xl}px`,
          overflow: "hidden",
        },
      }}
    >
      {/* Glass Header */}
      <Box
        sx={{
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
          borderBottom: ds.glass.border,
          p: ds.spacing["4"],
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: ds.spacing["2"] }}
        >
          <CloudUploadIcon
            sx={{
              color: ds.colors.primary.main,
              fontSize: ds.componentSizes.icon.large,
            }}
          />
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: ds.typography.fontWeight.bold,
              background: ds.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: ds.typography.letterSpacing.tight,
            }}
          >
            Profil Yönetimi Yükle
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={uploadMutation.isPending}
          size="small"
          sx={{
            color: ds.colors.text.secondary,
            transition: ds.transitions.fast,
            "&:hover": {
              color: ds.colors.text.primary,
              backgroundColor: alpha(ds.colors.neutral[900], 0.04),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: ds.spacing["6"] }}>
        <Stack spacing={ds.spacing["4"]}>
          {/* Upload Area */}
          <Box
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: `2px dashed ${
                dragActive ? ds.colors.primary.main : ds.colors.neutral[300]
              }`,
              borderRadius: `${ds.borderRadius.lg}px`,
              p: ds.spacing["8"],
              textAlign: "center",
              backgroundColor: dragActive
                ? alpha(ds.colors.primary.main, 0.02)
                : ds.colors.neutral[50],
              transition: ds.transitions.base,
              cursor: "pointer",
              "&:hover": {
                borderColor: ds.colors.primary.main,
                backgroundColor: alpha(ds.colors.primary.main, 0.02),
              },
            }}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              style={{ display: "none" }}
            />

            <UploadIcon
              sx={{
                fontSize: 64,
                color: file ? ds.colors.success.main : ds.colors.neutral[400],
                mb: ds.spacing["2"],
              }}
            />

            {file ? (
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: ds.typography.fontWeight.semibold,
                    color: ds.colors.text.primary,
                    mb: ds.spacing["1"],
                  }}
                >
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: ds.typography.fontWeight.medium,
                    mb: ds.spacing["1"],
                  }}
                >
                  Excel dosyasını sürükleyin veya seçin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  .xlsx veya .xls formatı
                </Typography>
              </Box>
            )}
          </Box>

          {/* Success Message */}
          {uploadMutation.isSuccess && (
            <Alert
              icon={<CheckCircleIcon />}
              severity="success"
              sx={{
                borderRadius: `${ds.borderRadius.md}px`,
                backgroundColor: alpha(ds.colors.success.main, 0.1),
                "& .MuiAlert-icon": {
                  color: ds.colors.success.main,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: ds.typography.fontWeight.medium }}
              >
                Profil yönetimi başarıyla yüklendi!
              </Typography>
              {uploadMutation.data?.data && (
                <Typography variant="caption" color="text.secondary">
                  {uploadMutation.data.data.profilesCreated} profil oluşturuldu,{" "}
                  {uploadMutation.data.data.profilesUpdated} profil güncellendi,{" "}
                  {uploadMutation.data.data.mappingsCreated} eşleştirme eklendi
                </Typography>
              )}
            </Alert>
          )}

          {/* Error Message */}
          {uploadMutation.isError && (
            <Alert
              severity="error"
              sx={{
                borderRadius: `${ds.borderRadius.md}px`,
                backgroundColor: alpha(ds.colors.error.main, 0.1),
              }}
            >
              <Typography variant="body2">
                {(uploadMutation.error as Error)?.message ||
                  "Yükleme başarısız oldu"}
              </Typography>
            </Alert>
          )}

          {/* Warnings */}
          {uploadMutation.data?.warnings &&
            uploadMutation.data.warnings.length > 0 && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: `${ds.borderRadius.md}px`,
                  backgroundColor: alpha(ds.colors.warning.main, 0.1),
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: ds.typography.fontWeight.medium,
                    mb: ds.spacing["1"],
                  }}
                >
                  Uyarılar:
                </Typography>
                {uploadMutation.data.warnings
                  .slice(0, 3)
                  .map((warning, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      • {warning}
                    </Typography>
                  ))}
              </Alert>
            )}

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: ds.spacing["2"],
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              sx={{
                borderRadius: `${ds.borderRadius.button}px`,
                textTransform: "none",
                fontWeight: ds.typography.fontWeight.medium,
              }}
            >
              İptal
            </Button>

            <Button
              onClick={handleUpload}
              disabled={
                !file || uploadMutation.isPending || uploadMutation.isSuccess
              }
              variant="contained"
              startIcon={
                uploadMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <UploadIcon />
                )
              }
              sx={{
                borderRadius: `${ds.borderRadius.button}px`,
                textTransform: "none",
                fontWeight: ds.typography.fontWeight.semibold,
                background: ds.gradients.primary,
                "&:hover": {
                  background: ds.gradients.primary,
                  opacity: 0.9,
                },
              }}
            >
              {uploadMutation.isPending ? "Yükleniyor..." : "Yükle"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
