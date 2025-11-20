/**
 * Product Group Card Component
 * Displays sections grouped by product category
 *
 * @module ProductGroupCard
 * @version 1.0.0
 */

import React from "react";
import { Stack, Typography, Box, Chip, Divider, alpha } from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";

import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared";
import { ProductSection, WorkOrderItem } from "../types";
import { ProductSection as ProductSectionComponent } from "./ProductSection";

interface ProductGroupCardProps {
  readonly categoryName: string;
  readonly sections: readonly ProductSection[];
  readonly onAddItem: (sectionId: string) => void;
  readonly onEditItem: (sectionId: string, item: WorkOrderItem) => void;
  readonly onDeleteItem: (sectionId: string, itemId: string) => void;
  readonly onCopyItem: (item: WorkOrderItem) => void;
  readonly onDeleteSection: (sectionId: string) => void;
}

export const ProductGroupCard: React.FC<ProductGroupCardProps> = ({
  categoryName,
  sections,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onCopyItem,
  onDeleteSection,
}) => {
  const ds = useDesignSystem();

  const totalItems = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  const totalQuantity = sections.reduce(
    (sum, section) =>
      sum +
      section.items.reduce(
        (itemSum, item) => itemSum + (item.orderQuantity || 0),
        0,
      ),
    0,
  );

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
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={ds.spacing["2"]}
          sx={{ mb: ds.spacing["3"] }}
        >
          <Stack direction="row" alignItems="center" spacing={ds.spacing["2"]}>
            <Box
              sx={{
                p: ds.spacing["1"],
                borderRadius: `${ds.borderRadius.md}px`,
                background: alpha(ds.colors.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CategoryIcon
                sx={{
                  color: ds.colors.primary.main,
                  fontSize: ds.componentSizes.icon.medium,
                }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.text.primary,
                  lineHeight: 1.2,
                }}
              >
                {categoryName}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: ds.colors.text.secondary,
                  mt: 0.5,
                }}
              >
                {sections.length} ürün • {totalItems} öğe • {totalQuantity} adet
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${sections.length} Ürün`}
            size="small"
            sx={{
              background: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
              fontWeight: ds.typography.fontWeight.medium,
            }}
          />
        </Stack>

        <Divider sx={{ mb: ds.spacing["3"] }} />

        {/* Sections */}
        <Stack spacing={ds.spacing["2"]}>
          {sections.map((section) => (
            <ProductSectionComponent
              key={section.id}
              section={section}
              onAddItem={onAddItem}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onCopyItem={onCopyItem}
              onDeleteSection={onDeleteSection}
            />
          ))}
        </Stack>
      </Box>
    </CardV2>
  );
};
