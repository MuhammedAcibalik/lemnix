/**
 * @fileoverview Profile Info Alert Component
 * @module ProfileInfoAlert
 * @version 1.0.0
 */

import React from "react";
import {
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ProfileInfoAlertProps {
  show: boolean;
  duplicates: boolean;
  onClose: () => void;
}

export const ProfileInfoAlert: React.FC<ProfileInfoAlertProps> = ({
  show,
  duplicates,
  onClose,
}) => {
  return (
    <Collapse in={show}>
      <Alert
        severity="info"
        onClose={onClose}
        sx={{
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(30,64,175,0.05) 0%, rgba(124,58,237,0.05) 100%)", // Industrial Harmony
          border: "1px solid rgba(30,64,175,0.2)", // Industrial Harmony
          borderRadius: 2,
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>🔍 Profil Optimizasyonu</AlertTitle>
        <Stack spacing={1}>
          <Typography variant="body2">
            • <strong>Profil Optimizasyonu:</strong> Aynı profil tipindeki iş
            emirlerini birleştirerek stok kullanımını optimize eder
          </Typography>
          <Typography variant="body2">
            • <strong>Havuzlama:</strong> Benzer profilleri gruplandırarak kesim
            verimliliğini artırır
          </Typography>
          <Typography variant="body2">
            • <strong>Avantajlar:</strong> Daha az stok, daha az atık, daha
            düşük maliyet
          </Typography>
          {duplicates && (
            <Typography variant="body2" color="warning.main" fontWeight="bold">
              ⚠️ Bu optimizasyonda farklı profil tipleri tespit edildi. Profil
              optimizasyonu önerilir.
            </Typography>
          )}
        </Stack>
      </Alert>
    </Collapse>
  );
};
