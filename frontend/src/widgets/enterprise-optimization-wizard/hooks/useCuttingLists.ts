/**
 * @fileoverview Cutting lists management hook
 * @module EnterpriseOptimizationWizard/Hooks/useCuttingLists
 * @version 1.0.0
 */

import { useCallback } from "react";
import { CuttingList, ConversionResult, CuttingListItem } from "../types";
import { SAMPLE_CUTTING_ITEMS } from "../constants";
import { API_ENDPOINTS } from "../constants";
import { generateUniqueId } from "../utils";

export const useCuttingLists = () => {
  // Load cutting lists from API
  const loadCuttingLists = useCallback(async (): Promise<CuttingList[]> => {
    try {
      const response = await fetch(API_ENDPOINTS.CUTTING_LISTS);
      const result = await response.json();

      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : [];
      }
      return [];
    } catch (error) {
      console.error("Kesim listeleri yüklenemedi:", error);
      return [];
    }
  }, []);

  // Add sample cutting list items
  const addSampleItems = useCallback(
    (
      cuttingList: CuttingListItem[],
      setCuttingList: (items: CuttingListItem[]) => void,
    ) => {
      const sampleItems = SAMPLE_CUTTING_ITEMS.map((item) => ({
        ...item,
        id: generateUniqueId(),
        date: new Date().toISOString().split("T")[0] as string | undefined,
        orderQuantity: item.quantity,
        profiles: [
          {
            id: `${item.workOrderId}-profile`,
            profile: item.profileType,
            measurement: `${item.length}mm`,
            quantity: item.quantity,
          },
        ],
      }));
      setCuttingList([...cuttingList, ...sampleItems]);
    },
    [],
  );

  // Handle detailed cutting list selection
  const handleDetailedSelection = useCallback(
    (
      list: Record<string, unknown>,
      callbacks: {
        setSelectedCuttingList: (list: Record<string, unknown>) => void;
        setShowDetailedSelection: (show: boolean) => void;
      },
    ) => {
      callbacks.setSelectedCuttingList(list);
      callbacks.setShowDetailedSelection(true);
    },
    [],
  );

  // Handle selection from detailed selector
  const handleSelectionFromDetailed = useCallback(
    (
      items: CuttingListItem[],
      setCuttingList: (items: CuttingListItem[]) => void,
    ) => {
      const convertedItems = items.map((item) => ({
        id: `${item.workOrderId}-${item.profileType}`,
        workOrderId: item.workOrderId,
        color: item.color || "Eloksal",
        version: item.version || "V1.0",
        size: item.size || "40x40",
        profileType: item.profileType,
        length: item.length,
        quantity: item.quantity,
        cuttingPattern: item.cuttingPattern || "Düz",
      }));
      setCuttingList(
        convertedItems as Array<{
          id: string;
          workOrderId: string;
          color: string;
          version: string;
          size: string;
          profileType: string;
          length: number;
          quantity: number;
          cuttingPattern: string;
          date: string;
          orderQuantity: number;
          profiles: Array<{
            id: string;
            profile: string;
            measurement: string;
            quantity: number;
          }>;
        }>,
      );
    },
    [],
  );

  // Handle conversion complete from detailed selector
  const handleConversionFromDetailed = useCallback(
    (
      result: ConversionResult,
      callbacks: {
        setConversionResult: (result: ConversionResult) => void;
        setShowDetailedSelection: (show: boolean) => void;
        setActiveStep: (step: number) => void;
      },
    ) => {
      callbacks.setConversionResult(result);
      if (result.success && result.items && result.items.length > 0) {
        callbacks.setShowDetailedSelection(false);
        callbacks.setActiveStep(1);
      }
    },
    [],
  );

  return {
    loadCuttingLists,
    addSampleItems,
    handleDetailedSelection,
    handleSelectionFromDetailed,
    handleConversionFromDetailed,
  };
};
