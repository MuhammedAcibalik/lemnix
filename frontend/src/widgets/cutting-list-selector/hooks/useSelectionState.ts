/**
 * @fileoverview Custom hook for CuttingListSelector selection state management
 * @module useSelectionState
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from "react";
import {
  SelectionState,
  ProductSelectionState,
  WorkOrderSelectionState,
  SelectionStats,
  ValidationResult,
  CuttingListData,
} from "../types";
import {
  CuttingListProduct,
  CuttingListSection,
  CuttingListItem,
} from "@/shared/lib/services/cuttingListOptimizationService";
import { validationConstants, performanceConstants } from "../constants";

/**
 * Custom hook for managing selection state
 */
export const useSelectionState = (cuttingList: CuttingListData) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    products: {},
    totalSelectedItems: 0,
    totalSelectedProfiles: 0,
    estimatedTotalLength: 0,
  });

  // Initialize selection state for products
  const initializeSelectionState = useCallback(() => {
    const products: { [productId: string]: ProductSelectionState } = {};

    (cuttingList.products || []).forEach((product: CuttingListProduct) => {
      const workOrders: { [workOrderId: string]: WorkOrderSelectionState } = {};

      product.sections.forEach((section: CuttingListSection) => {
        const profiles: { [profileId: string]: boolean } = {};

        section.items.forEach((item: CuttingListItem) => {
          profiles[item.id] = false;
        });

        workOrders[section.id] = {
          selected: false,
          indeterminate: false,
          profiles,
        };
      });

      products[product.id] = {
        selected: false,
        indeterminate: false,
        workOrders,
      };
    });

    setSelectionState({
      products,
      totalSelectedItems: 0,
      totalSelectedProfiles: 0,
      estimatedTotalLength: 0,
    });
  }, [cuttingList]);

  // Update selection state
  const updateSelection = useCallback((updates: Partial<SelectionState>) => {
    setSelectionState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset selection state
  const resetSelection = useCallback(() => {
    initializeSelectionState();
  }, [initializeSelectionState]);

  // Calculate selection statistics
  const getSelectionStats = useCallback((): SelectionStats => {
    let totalItems = 0;
    let selectedItems = 0;
    let totalProfiles = 0;
    let selectedProfiles = 0;
    let estimatedLength = 0;
    let selectedLength = 0;

    (cuttingList.products || []).forEach((product: CuttingListProduct) => {
      product.sections.forEach((section: CuttingListSection) => {
        totalProfiles++;
        if (
          selectionState.products[product.id]?.workOrders[section.id]?.selected
        ) {
          selectedProfiles++;
        }

        section.items.forEach((item: CuttingListItem) => {
          totalItems++;
          const itemLength = item.profiles.reduce(
            (sum, p) => sum + (parseFloat(p.measurement) || 0),
            0,
          );
          const itemQuantity = item.profiles.reduce(
            (sum, p) => sum + p.quantity,
            0,
          );
          estimatedLength += itemLength * itemQuantity;

          const isSelected =
            selectionState.products[product.id]?.workOrders[section.id]
              ?.profiles[item.id];
          if (isSelected) {
            selectedItems++;
            selectedLength += itemLength * itemQuantity;
          }
        });
      });
    });

    return {
      totalItems,
      selectedItems,
      totalProfiles,
      selectedProfiles,
      estimatedLength,
      selectedLength,
    };
  }, [cuttingList, selectionState]);

  // Validate selection
  const validateSelection = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const stats = getSelectionStats();

    if (stats.selectedItems < validationConstants.selection.minItems) {
      errors.push(
        `En az ${validationConstants.selection.minItems} parça seçmelisiniz`,
      );
    }

    if (stats.selectedItems > validationConstants.selection.maxItems) {
      errors.push(
        `En fazla ${validationConstants.selection.maxItems} parça seçebilirsiniz`,
      );
    }

    if (stats.selectedProfiles === 0) {
      warnings.push("Hiç profil seçmediniz");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [getSelectionStats]);

  // Memoized selection statistics
  const selectionStats = useMemo(
    () => getSelectionStats(),
    [getSelectionStats],
  );

  // Memoized validation result
  const validationResult = useMemo(
    () => validateSelection(),
    [validateSelection],
  );

  return {
    selectionState,
    updateSelection,
    resetSelection,
    validateSelection,
    getSelectionStats,
    selectionStats,
    validationResult,
    initializeSelectionState,
  };
};
