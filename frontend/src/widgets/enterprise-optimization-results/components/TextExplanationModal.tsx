/**
 * @fileoverview Text Explanation Modal Component
 * @module TextExplanationModal
 * @version 1.0.0
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface TextExplanationModalProps {
  explanationData: { [key: string]: string };
  textExplanationOpen: { [key: string]: boolean };
  onClose: (cardId: string) => void;
}

export const TextExplanationModal: React.FC<TextExplanationModalProps> = ({
  explanationData,
  textExplanationOpen,
  onClose
}) => {
  return (
    <>
      {Object.entries(textExplanationOpen).map(
        ([cardId, isOpen]) =>
          isOpen && (
            <Dialog
              key={cardId}
              open={isOpen}
              onClose={() => onClose(cardId)}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(30, 64, 175, 0.2)", // Industrial Harmony
                  borderRadius: 3,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background:
                      "linear-gradient(90deg, #1e40af, #7c3aed, #06b6d4, #059669)", // Industrial Harmony
                    borderRadius: "12px 12px 0 0",
                  },
                },
              }}
            >
              <DialogTitle
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)", // Industrial Harmony
                  borderBottom: "1px solid rgba(30, 64, 175, 0.2)", // Industrial Harmony
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)", // Industrial Harmony
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)", // Industrial Harmony
                    }}
                  >
                    <DescriptionIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      background: "linear-gradient(135deg, #1e40af, #7c3aed)", // Industrial Harmony
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "bold",
                    }}
                  >
                    Kesim Deseni Detaylı Açıklaması
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => onClose(cardId)}
                  sx={{
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    "&:hover": {
                      background: "rgba(239, 68, 68, 0.2)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <CloseIcon sx={{ color: "error.main", fontSize: 20 }} />
                </IconButton>
              </DialogTitle>

              <DialogContent
                sx={{
                  p: 3,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(0, 0, 0, 0.05)",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "linear-gradient(135deg, #1e40af, #7c3aed)", // Industrial Harmony
                    borderRadius: "4px",
                    "&:hover": {
                      background: "linear-gradient(135deg, #1e40af, #7c3aed)", // Industrial Harmony
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(30, 64, 175, 0.1)", // Industrial Harmony
                    borderRadius: 2,
                    p: 3,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-line",
                      lineHeight: 1.8,
                      fontSize: "0.95rem",
                      color: "text.primary",
                      "& strong": {
                        color: "primary.main",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    {explanationData[cardId] || "Açıklama yükleniyor..."}
                  </Typography>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                  onClick={() => onClose(cardId)}
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
          )
      )}
    </>
  );
};
