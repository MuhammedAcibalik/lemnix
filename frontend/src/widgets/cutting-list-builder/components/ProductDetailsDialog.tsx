/**
 * @fileoverview Product Details Dialog - Premium UI/UX Edition
 * @module ProductDetailsDialog
 * @version 2.0.0 - Design System v2 Compliant
 *
 * Modern, compact, professional product details modal
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  Divider,
  Grid,
  Button,
  alpha,
  Tooltip,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import {
  Close as CloseIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  Palette as PaletteIcon,
  Straighten as SizeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2, FadeIn, ScaleIn } from "@/shared";
import { ProductSection as ProductSectionType, WorkOrderItem } from "../types";

interface ProductDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  section: ProductSectionType | null;
  onEditItem?: (sectionId: string, item: WorkOrderItem) => void;
  onDelete?: (section: ProductSectionType) => void;
}

// Collapsible Work Order Card Component
const CollapsibleWorkOrderCard: React.FC<{
  item: WorkOrderItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, index, onEdit, onDelete }) => {
  const ds = useDesignSystem();
  const [isExpanded, setIsExpanded] = useState(false);

  // Summary: "WO-001 • 60x120 • ELS • 5 adet"
  const summary = `${item.workOrderId} • ${item.size} • ${item.color} • ${item.orderQuantity} adet`;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: `${ds.borderRadius.md}px`,
        border: `1px solid ${ds.colors.neutral[300]}`, // More prominent
        transition: ds.transitions.base,
      }}
    >
      {/* Collapsible Header */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          p: ds.spacing["2"],
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: isExpanded
            ? `1px solid ${ds.colors.neutral[200]}`
            : "none",
          "&:hover": { background: alpha(ds.colors.primary.main, 0.04) },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={ds.spacing["2"]}
          sx={{ flex: 1 }}
        >
          {/* Number badge */}
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: `${ds.borderRadius.sm}px`,
              background: ds.colors.primary.main,
              color: ds.colors.text.inverse,
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {index + 1}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {item.workOrderId}
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
            >
              {summary}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={ds.spacing["1"]}>
          {/* Edit button - compact */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{
              color: ds.colors.primary.main,
              "&:hover": { background: alpha(ds.colors.primary.main, 0.1) },
            }}
          >
            <EditIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
          </IconButton>

          {/* Delete button */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              color: ds.colors.error.main,
              "&:hover": { background: alpha(ds.colors.error.main, 0.1) },
            }}
          >
            <DeleteIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
          </IconButton>

          {/* Expand icon */}
          <IconButton
            size="small"
            sx={{
              color: ds.colors.text.secondary,
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: ds.transitions.base,
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent sx={{ p: ds.spacing["2"], pt: ds.spacing["1"] }}>
          <Stack spacing={ds.spacing["2"]}>
            {/* Grid 2x2 for details */}
            <Stack direction="row" spacing={ds.spacing["2"]}>
              <TextField
                label="Ebat"
                value={item.size}
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Renk"
                value={item.color}
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Stack>

            <Stack direction="row" spacing={ds.spacing["2"]}>
              <TextField
                label="Sipariş Adedi"
                value={item.orderQuantity}
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Tarih"
                value={new Date(item.date).toLocaleDateString("tr-TR")}
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Stack>

            {item.note && (
              <TextField
                label="Not"
                value={item.note}
                size="small"
                fullWidth
                multiline
                rows={2}
                InputProps={{ readOnly: true }}
              />
            )}

            {/* Profiles */}
            {item.profiles && item.profiles.length > 0 && (
              <Box>
                <Typography
                  sx={{ fontSize: "0.75rem", fontWeight: 600, mb: 1 }}
                >
                  Profiller ({item.profiles.length})
                </Typography>
                <Stack spacing={ds.spacing["1"]}>
                  {item.profiles.map((profile, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: ds.spacing["2"],
                        borderRadius: `${ds.borderRadius.sm}px`,
                        background: alpha(ds.colors.primary.main, 0.05),
                        border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
                      >
                        {profile.profile}{" "}
                        {profile.measurement?.includes("mm")
                          ? profile.measurement
                          : `${profile.measurement}mm`}{" "}
                        × {profile.quantity}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};

export const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onClose,
  section,
  onEditItem,
  onDelete,
}) => {
  const ds = useDesignSystem();

  if (!section) return null;

  const totalItems = section.items.length;
  const totalQuantity = section.items.reduce(
    (sum, item) => sum + (item.orderQuantity || 0),
    0,
  );

  const handleDelete = () => {
    if (
      window.confirm(
        "Bu ürün bölümünü ve tüm iş emirlerini silmek istediğinizden emin misiniz?",
      )
    ) {
      onDelete?.(section);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: `${ds.borderRadius.xl}px`,
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Glass Header - NewItemDialog Format */}
      <Box
        sx={{
          p: ds.spacing["2"],
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
          borderBottom: ds.glass.border,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              background: ds.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: ds.typography.letterSpacing.tight,
            }}
          >
            {section.productName} - İş Emirleri ({totalItems})
          </Typography>

          <IconButton
            onClick={onClose}
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
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: ds.spacing["3"] }}>
        <Stack spacing={ds.spacing["3"]}>
          {/* Compact Stats Chips */}
          <Stack
            direction="row"
            spacing={ds.spacing["2"]}
            sx={{ mb: ds.spacing["1"] }}
          >
            <Chip
              icon={<AssignmentIcon sx={{ fontSize: 14 }} />}
              label={`${totalItems} İş Emri`}
              sx={{
                height: 28,
                fontSize: "0.8125rem",
                fontWeight: 600,
                background: alpha(ds.colors.primary.main, 0.1),
                color: ds.colors.primary.main,
                borderRadius: `${ds.borderRadius.sm}px`,
              }}
            />
            <Chip
              icon={<InventoryIcon sx={{ fontSize: 14 }} />}
              label={`${totalQuantity.toLocaleString()} Adet`}
              sx={{
                height: 28,
                fontSize: "0.8125rem",
                fontWeight: 600,
                background: alpha(ds.colors.success.main, 0.1),
                color: ds.colors.success.main,
                borderRadius: `${ds.borderRadius.sm}px`,
              }}
            />
            <Chip
              icon={<CalendarIcon sx={{ fontSize: 14 }} />}
              label={new Date(section.createdAt).toLocaleDateString("tr-TR")}
              sx={{
                height: 28,
                fontSize: "0.8125rem",
                fontWeight: 600,
                background: alpha(ds.colors.accent.main, 0.1),
                color: ds.colors.accent.main,
                borderRadius: `${ds.borderRadius.sm}px`,
              }}
            />
          </Stack>

          {/* Work Orders */}
          <Box>
            {section.items.length === 0 ? (
              <FadeIn>
                <Box
                  sx={{
                    p: ds.spacing["8"],
                    textAlign: "center",
                    border: `2px dashed ${ds.colors.neutral[300]}`,
                    borderRadius: `${ds.borderRadius.lg}px`,
                    background: alpha(ds.colors.neutral[100], 0.5),
                  }}
                >
                  <AssignmentIcon
                    sx={{
                      fontSize: 48,
                      color: ds.colors.neutral[400],
                      mb: ds.spacing["3"],
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: ds.colors.text.primary,
                      mb: ds.spacing["1"],
                    }}
                  >
                    Henüz İş Emri Yok
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      color: ds.colors.text.secondary,
                    }}
                  >
                    Bu ürün için henüz iş emri eklenmemiş.
                  </Typography>
                </Box>
              </FadeIn>
            ) : (
              <Stack spacing={ds.spacing["2"]}>
                {section.items.map((item, index) => (
                  <CollapsibleWorkOrderCard
                    key={item.id}
                    item={item}
                    index={index}
                    onEdit={() => onEditItem?.(section.id, item)}
                    onDelete={() => {
                      if (
                        window.confirm(
                          "Bu iş emrini silmek istediğinizden emin misiniz?",
                        )
                      ) {
                        // TODO: Implement delete functionality
                        console.log("Delete item:", item.id);
                      }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
