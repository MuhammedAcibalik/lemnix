/**
 * Quick Optimize Dialog Component
 *
 * @module features/quick-optimization
 * @version 1.0.0 - Quick Optimize Dialog
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";
import { useQuickOptimize } from "../model/useQuickOptimize";

export interface QuickOptimizeDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: (resultId: string) => void;
}

export const QuickOptimizeDialog: React.FC<QuickOptimizeDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const ds = useDesignSystem();
  const { optimize, isLoading, error } = useQuickOptimize();

  const [algorithm, setAlgorithm] = React.useState<
    "ffd" | "bfd" | "genetic" | "pooling"
  >("ffd");
  const [inputData, setInputData] = React.useState("");

  const handleSubmit = async () => {
    if (!inputData.trim()) return;

    try {
      // Parse input data (simple format: length,quantity per line)
      const items = inputData
        .trim()
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [length, quantity] = line.split(",").map((s) => s.trim());
          return {
            length: parseFloat(length) || 0,
            quantity: parseInt(quantity) || 0,
          };
        })
        .filter((item) => item.length > 0 && item.quantity > 0);

      if (items.length === 0) {
        throw new Error("Geçerli veri giriniz");
      }

      const result = await optimize({
        algorithm,
        items,
      });

      if (result) {
        onSuccess?.(result.id);
        onClose();
        setInputData("");
      }
    } catch (err) {
      console.error("Failed to optimize:", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setInputData("");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          Hızlı Optimizasyon
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: ds.colors.text.secondary,
            mt: 0.5,
          }}
        >
          Kompakt optimizasyon formu ile hızlı sonuç alın
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={ds.spacing.md} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Algoritma</InputLabel>
            <Select
              value={algorithm}
              onChange={(e) =>
                setAlgorithm(
                  e.target.value as "ffd" | "bfd" | "genetic" | "pooling",
                )
              }
              label="Algoritma"
              disabled={isLoading}
            >
              <MenuItem value="ffd">FFD (First Fit Decreasing)</MenuItem>
              <MenuItem value="bfd">BFD (Best Fit Decreasing)</MenuItem>
              <MenuItem value="genetic">Genetic Algorithm</MenuItem>
              <MenuItem value="pooling">Pooling Algorithm</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Veri Girişi"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            fullWidth
            multiline
            rows={8}
            placeholder={`Uzunluk,Miktar formatında veri giriniz:
120,5
80,3
100,2
150,1`}
            disabled={isLoading}
            helperText="Her satırda: uzunluk,miktar formatında veri giriniz"
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
          disabled={!inputData.trim() || isLoading}
          variant="contained"
          sx={{
            bgcolor: ds.colors.primary.main,
            "&:hover": {
              bgcolor: ds.colors.primary.dark,
            },
            "&:disabled": {
              bgcolor: ds.colors.text.disabled,
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Optimize ediliyor...
            </Box>
          ) : (
            "Optimize Et"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
