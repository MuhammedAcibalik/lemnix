/**
 * Quick Create Dialog Component
 *
 * @module features/quick-cutting-list-create
 * @version 1.0.0 - Quick Create Dialog
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";
import { useQuickCreate } from "../model/useQuickCreate";

export interface QuickCreateDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (listId: string) => void;
}

export const QuickCreateDialog: React.FC<QuickCreateDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const ds = useDesignSystem();
  const { createList, isLoading, error } = useQuickCreate();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      const result = await createList({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (result) {
        onSuccess?.(result.id);
        onClose();
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      console.error("Failed to create cutting list:", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setTitle("");
      setDescription("");
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
          borderRadius: ds.borderRadius.lg,
          bgcolor: ds.colors.background.paper,
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: ds.colors.text.primary,
          }}
        >
          Hızlı Kesim Listesi Oluştur
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: ds.colors.text.secondary,
            mt: 0.5,
          }}
        >
          Yeni bir kesim listesi oluşturun ve hemen kullanmaya başlayın
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={ds.spacing.md} sx={{ mt: 1 }}>
          <TextField
            label="Liste Başlığı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder="Örn: Proje A - Kesim Listesi"
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: ds.colors.primary.main,
                },
              },
            }}
          />

          <TextField
            label="Açıklama (Opsiyonel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Liste hakkında kısa bir açıklama..."
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: ds.colors.primary.main,
                },
              },
            }}
          />

          {error && (
            <Box
              sx={{
                p: ds.spacing.sm,
                bgcolor: ds.colors.error[50],
                borderRadius: ds.borderRadius.sm,
                border: `1px solid ${ds.colors.error.main}`,
              }}
            >
              <Typography variant="body2" sx={{ color: ds.colors.error[700] }}>
                {error}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: ds.spacing.lg, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            color: ds.colors.text.secondary,
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || isLoading}
          variant="contained"
          sx={{
            bgcolor: ds.colors.primary.main,
            "&:hover": {
              bgcolor: ds.colors.primary[700],
            },
            "&:disabled": {
              bgcolor: ds.colors.text.disabled,
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Oluşturuluyor...
            </Box>
          ) : (
            "Oluştur"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
