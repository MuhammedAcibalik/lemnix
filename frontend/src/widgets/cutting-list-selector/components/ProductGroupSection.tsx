/**
 * @fileoverview Product Group Section Component for CuttingListSelector
 * @module ProductGroupSection
 * @version 1.0.0
 */

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Inventory as ProductIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  IndeterminateCheckBox as IndeterminateIcon,
} from "@mui/icons-material";
import { ProductGroupSectionProps } from "../types";
import {
  textContent,
  stylingConstants,
  accessibilityConstants,
} from "../constants";

/**
 * Product Group Section Component
 */
export const ProductGroupSection: React.FC<ProductGroupSectionProps> = ({
  product,
  selectionState,
  searchTerm,
  isExpanded,
  onToggleExpansion,
  onProductSelectionChange,
  onWorkOrderSelectionChange,
  onProfileSelectionChange,
}) => {
  const productSelection = selectionState.products[product.id];
  const isSelected = productSelection?.selected || false;
  const isIndeterminate = productSelection?.indeterminate || false;

  const totalItems = product.sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  const selectedItems = product.sections.reduce((sum, section) => {
    const workOrderSelection = productSelection?.workOrders[section.id];
    if (workOrderSelection?.selected) {
      return sum + section.items.length;
    }
    return (
      sum +
      section.items.filter((item) => workOrderSelection?.profiles[item.id])
        .length
    );
  }, 0);

  const handleProductCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onProductSelectionChange(product.id, event.target.checked);
  };

  return (
    <Accordion
      expanded={isExpanded}
      onChange={() => onToggleExpansion(product.id)}
      sx={{
        mb: 2,
        borderRadius: stylingConstants.borderRadius.medium,
        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: "grey.50",
          borderRadius: stylingConstants.borderRadius.medium,
          "&.Mui-expanded": {
            borderRadius: `${stylingConstants.borderRadius.medium}px ${stylingConstants.borderRadius.medium}px 0 0`,
          },
        }}
        aria-label={accessibilityConstants.ariaLabels.productAccordion}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSelected}
                indeterminate={isIndeterminate}
                onChange={handleProductCheckboxChange}
                icon={<UncheckedIcon />}
                checkedIcon={<CheckIcon />}
                indeterminateIcon={<IndeterminateIcon />}
                color="primary"
              />
            }
            label=""
            sx={{ mr: 2 }}
          />

          <ProductIcon sx={{ mr: 2, color: "primary.main" }} />

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {product.name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip
                label={`${product.sections.length} İş Emri`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${totalItems} Parça`}
                size="small"
                variant="outlined"
              />
              {selectedItems > 0 && (
                <Chip
                  label={`${selectedItems} Seçili`}
                  size="small"
                  color="primary"
                />
              )}
            </Stack>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {product.sections.map((section) => (
            <Box key={section.id} sx={{ pl: 4 }}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                {section.productName} ({section.items.length} parça)
              </Typography>

              {/* TODO: Implement WorkOrderSection component */}
              <Typography variant="body2" color="text.secondary">
                İş emri detayları burada gösterilecek
              </Typography>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
