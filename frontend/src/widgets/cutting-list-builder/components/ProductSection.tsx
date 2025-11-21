/**
 * @fileoverview Product Section Card - Modern Edition
 * @module ProductSection
 * @version 2.0.0 - Design System v2 Compliant
 */

import React, { useState } from "react";
import {
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Straighten as ProfileIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2, Button } from "@/shared";
import {
  ProductSection as ProductSectionType,
  WorkOrderItem as WorkOrderItemType,
} from "../types";

interface ProductSectionProps {
  section: ProductSectionType;
  onAddItem: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: WorkOrderItemType) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onCopyItem: (item: WorkOrderItemType) => void;
  onViewDetails?: (section: ProductSectionType) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  section,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onCopyItem,
  onViewDetails,
  onDeleteSection,
}) => {
  const ds = useDesignSystem();
  const [isExpanded, setIsExpanded] = useState(section.isExpanded ?? false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const totalQuantity = section.items.reduce(
    (sum, item) => sum + (item.orderQuantity || 0),
    0,
  );

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <CardV2
      variant="glass"
      sx={{
        transition: ds.transitions.base,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: ds.shadows.soft.md,
          borderColor: ds.colors.primary.main,
        },
      }}
    >
      <Box sx={{ p: ds.spacing["3"] }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={ds.spacing["2"]}
            sx={{ flex: 1 }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: `${ds.borderRadius.md}px`,
                background: ds.gradients.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              <CategoryIcon
                sx={{
                  fontSize: ds.componentSizes.icon.medium,
                  color: ds.colors.text.inverse,
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: 0.5,
                }}
              >
                {section.productName}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={
                    <AssignmentIcon
                      sx={{ fontSize: ds.componentSizes.icon.small }}
                    />
                  }
                  label={`${section.items.length} iş emri`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    background: alpha(ds.colors.primary.main, 0.1),
                    color: ds.colors.primary.main,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                  }}
                />
                {totalQuantity > 0 && (
                  <Chip
                    label={`${totalQuantity.toLocaleString()} adet`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      background: alpha(ds.colors.success.main, 0.1),
                      color: ds.colors.success.main,
                      border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={ds.spacing["1"]}>
            {/* Expand/Collapse Button */}
            {section.items.length > 0 && (
              <Tooltip title={isExpanded ? "Gizle" : "Göster"} arrow>
                <IconButton
                  onClick={handleToggleExpand}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: `${ds.borderRadius.md}px`,
                    background: alpha(ds.colors.neutral[200], 0.5),
                    color: ds.colors.text.secondary,
                    "&:hover": {
                      background: alpha(ds.colors.neutral[300], 0.5),
                    },
                  }}
                >
                  {isExpanded ? (
                    <ExpandLessIcon
                      sx={{ fontSize: ds.componentSizes.icon.small }}
                    />
                  ) : (
                    <ExpandMoreIcon
                      sx={{ fontSize: ds.componentSizes.icon.small }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Detayları Gör" arrow>
              <IconButton
                onClick={() => onViewDetails?.(section)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: `${ds.borderRadius.md}px`,
                  background: alpha(ds.colors.primary.main, 0.1),
                  color: ds.colors.primary.main,
                  "&:hover": {
                    background: alpha(ds.colors.primary.main, 0.2),
                    transform: "scale(1.1)",
                  },
                  transition: ds.transitions.fast,
                }}
              >
                <VisibilityIcon
                  sx={{ fontSize: ds.componentSizes.icon.medium }}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="İş Emri Ekle" arrow>
              <IconButton
                onClick={() => onAddItem(section.id)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: `${ds.borderRadius.md}px`,
                  background: alpha(ds.colors.success.main, 0.1),
                  color: ds.colors.success.main,
                  "&:hover": {
                    background: alpha(ds.colors.success.main, 0.2),
                    transform: "scale(1.1)",
                  },
                  transition: ds.transitions.fast,
                }}
              >
                <AddIcon sx={{ fontSize: ds.componentSizes.icon.medium }} />
              </IconButton>
            </Tooltip>

            {onDeleteSection && (
              <Tooltip title="Ürünü Sil" arrow>
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: `${ds.borderRadius.md}px`,
                    background: alpha(ds.colors.error.main, 0.1),
                    color: ds.colors.error.main,
                    "&:hover": {
                      background: alpha(ds.colors.error.main, 0.2),
                      transform: "scale(1.1)",
                    },
                    transition: ds.transitions.fast,
                  }}
                >
                  <DeleteIcon
                    sx={{ fontSize: ds.componentSizes.icon.medium }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Expandable Items List */}
        <Collapse in={isExpanded}>
          <Divider sx={{ my: ds.spacing["2"] }} />
          {section.items.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: ds.spacing["3"],
                color: ds.colors.text.secondary,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  mb: ds.spacing["1"],
                }}
              >
                Henüz iş emri yok
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: ds.colors.text.secondary,
                }}
              >
                "İş Emri Ekle" butonunu kullanarak başlayın
              </Typography>
            </Box>
          ) : (
            <Stack spacing={ds.spacing["2"]}>
              {section.items.map((item, index) => (
                <Box
                  key={item.id || index}
                  sx={{
                    p: ds.spacing["2"],
                    borderRadius: `${ds.borderRadius.md}px`,
                    background: alpha(ds.colors.neutral[50], 0.8),
                    border: `1px solid ${ds.colors.neutral[200]}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={ds.spacing["2"]}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={ds.spacing["1"]}
                        mb={ds.spacing["1"]}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: ds.colors.text.primary,
                          }}
                        >
                          {item.workOrderId}
                        </Typography>
                        <Chip
                          label={item.size}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.6875rem",
                            background: alpha(ds.colors.primary.main, 0.1),
                            color: ds.colors.primary.main,
                          }}
                        />
                        <Chip
                          label={item.color}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.6875rem",
                            background: alpha(ds.colors.success.main, 0.1),
                            color: ds.colors.success.main,
                          }}
                        />
                        {item.orderQuantity && (
                          <Chip
                            label={`${item.orderQuantity} adet`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.6875rem",
                              background: alpha(ds.colors.neutral[200], 0.5),
                              color: ds.colors.text.secondary,
                            }}
                          />
                        )}
                      </Stack>
                      {/* Profiller */}
                      {item.profiles && item.profiles.length > 0 ? (
                        <Stack spacing={ds.spacing["1"]}>
                          {item.profiles.map((profile, profileIndex) => (
                            <Box
                              key={profileIndex}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: ds.spacing["1"],
                                p: ds.spacing["1"],
                                borderRadius: `${ds.borderRadius.sm}px`,
                                background: alpha(ds.colors.primary.main, 0.05),
                              }}
                            >
                              <ProfileIcon
                                sx={{
                                  fontSize: ds.componentSizes.icon.small,
                                  color: ds.colors.primary.main,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: ds.colors.text.secondary,
                                }}
                              >
                                <strong>{profile.profile}</strong>{" "}
                                {profile.measurement?.includes("mm")
                                  ? profile.measurement
                                  : `${profile.measurement}mm`}{" "}
                                × {profile.quantity}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: ds.colors.text.secondary,
                            fontStyle: "italic",
                          }}
                        >
                          Profil eklenmemiş
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={ds.spacing["1"]}>
                      <Tooltip title="Düzenle" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onEditItem(section.id, item)}
                          sx={{
                            width: 28,
                            height: 28,
                            color: ds.colors.primary.main,
                            "&:hover": {
                              background: alpha(ds.colors.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon
                            sx={{ fontSize: ds.componentSizes.icon.small }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kopyala" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onCopyItem(item)}
                          sx={{
                            width: 28,
                            height: 28,
                            color: ds.colors.info.main,
                            "&:hover": {
                              background: alpha(ds.colors.info.main, 0.1),
                            },
                          }}
                        >
                          <CopyIcon
                            sx={{ fontSize: ds.componentSizes.icon.small }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDeleteItem(section.id, item.id)}
                          sx={{
                            width: 28,
                            height: 28,
                            color: ds.colors.error.main,
                            "&:hover": {
                              background: alpha(ds.colors.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon
                            sx={{ fontSize: ds.componentSizes.icon.small }}
                          />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Collapse>
      </Box>

      {/* Delete Confirmation Dialog - Modern Edition */}
      {onDeleteSection && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: `${ds.borderRadius.xl}px`,
              boxShadow: ds.shadows.soft.xl,
              border: `1px solid ${alpha(ds.colors.error.main, 0.2)}`,
              minWidth: 420,
              maxWidth: 520,
              overflow: "hidden",
              background: `linear-gradient(135deg, ${ds.colors.neutral[50]} 0%, ${ds.colors.neutral[100]} 100%)`,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(90deg, ${ds.colors.error.main} 0%, ${ds.colors.error.dark} 100%)`,
              },
            },
          }}
          TransitionProps={{
            timeout: 300,
          }}
        >
          {/* Modern Header with Icon */}
          <Box
            sx={{
              pt: ds.spacing["4"],
              px: ds.spacing["4"],
              pb: ds.spacing["2"],
              position: "relative",
            }}
          >
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                position: "absolute",
                top: ds.spacing["2"],
                right: ds.spacing["2"],
                width: 32,
                height: 32,
                borderRadius: `${ds.borderRadius.md}px`,
                background: alpha(ds.colors.neutral[200], 0.5),
                color: ds.colors.text.secondary,
                "&:hover": {
                  background: alpha(ds.colors.neutral[300], 0.7),
                  transform: "rotate(90deg)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Stack
              direction="row"
              alignItems="center"
              spacing={ds.spacing["3"]}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: `${ds.borderRadius.lg}px`,
                  background: `linear-gradient(135deg, ${ds.colors.error.main} 0%, ${ds.colors.error.dark} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${alpha(ds.colors.error.main, 0.3)}`,
                }}
              >
                <WarningIcon
                  sx={{
                    fontSize: 28,
                    color: ds.colors.text.inverse,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: ds.colors.text.primary,
                    mb: 0.5,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ürünü Sil
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: ds.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Bu işlem geri alınamaz
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Content */}
          <DialogContent
            sx={{
              px: ds.spacing["4"],
              pt: ds.spacing["2"],
              pb: ds.spacing["3"],
            }}
          >
            <Box
              sx={{
                p: ds.spacing["3"],
                borderRadius: `${ds.borderRadius.md}px`,
                background: alpha(ds.colors.neutral[50], 0.8),
                border: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.9375rem",
                  color: ds.colors.text.primary,
                  lineHeight: 1.7,
                  mb: ds.spacing["2"],
                }}
              >
                <strong
                  style={{
                    color: ds.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  "{section.productName}"
                </strong>{" "}
                ürününü silmek istediğinize emin misiniz?
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: ds.spacing["1.5"],
                  p: ds.spacing["2"],
                  borderRadius: `${ds.borderRadius.sm}px`,
                  background: alpha(ds.colors.error.main, 0.08),
                  border: `1px solid ${alpha(ds.colors.error.main, 0.2)}`,
                }}
              >
                <WarningIcon
                  sx={{
                    fontSize: 20,
                    color: ds.colors.error.main,
                    mt: 0.25,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: ds.colors.error.main,
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  Tüm iş emirleri ve veriler kalıcı olarak silinecektir. Bu
                  işlem geri alınamaz.
                </Typography>
              </Box>
            </Box>
          </DialogContent>

          {/* Modern Actions */}
          <DialogActions
            sx={{
              px: ds.spacing["4"],
              pb: ds.spacing["4"],
              pt: 0,
              gap: ds.spacing["2"],
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                px: ds.spacing["4"],
                py: ds.spacing["1.5"],
                borderRadius: `${ds.borderRadius.md}px`,
                borderColor: ds.colors.neutral[300],
                color: ds.colors.text.secondary,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.9375rem",
                "&:hover": {
                  borderColor: ds.colors.neutral[400],
                  background: alpha(ds.colors.neutral[100], 0.8),
                  transform: "translateY(-1px)",
                  boxShadow: ds.shadows.soft.sm,
                },
                transition: "all 0.2s ease",
              }}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onDeleteSection(section.id);
                setDeleteDialogOpen(false);
              }}
              sx={{
                px: ds.spacing["4"],
                py: ds.spacing["1.5"],
                borderRadius: `${ds.borderRadius.md}px`,
                background: `linear-gradient(135deg, ${ds.colors.error.main} 0%, ${ds.colors.error.dark} 100%)`,
                color: ds.colors.text.inverse,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.9375rem",
                boxShadow: `0 4px 12px ${alpha(ds.colors.error.main, 0.3)}`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${ds.colors.error.dark} 0%, ${ds.colors.error.main} 100%)`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 6px 16px ${alpha(ds.colors.error.main, 0.4)}`,
                },
                transition: "all 0.2s ease",
              }}
            >
              Sil
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </CardV2>
  );
};
