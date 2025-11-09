/**
 * @fileoverview Custom hook for Smart Suggestions functionality
 * @module useSmartSuggestions
 * @version 2.0.0 - Updated to use new unified API
 */

import { useCallback } from "react";
import { suggestionApi } from "@/entities/suggestions";
import type { AxiosError } from "axios";
import { ApiResponse, ProfileCombination, WorkOrderForm } from "../types";

interface UseSmartSuggestionsProps {
  setAvailableSizes: (sizes: string[]) => void;
  setProfileCombinations: (combinations: ProfileCombination[]) => void;
  setIsLoadingSuggestions: (loading: boolean) => void;
  setNewItemForm: (
    form: WorkOrderForm | ((prev: WorkOrderForm) => WorkOrderForm),
  ) => void;
  setShowCombinationDialog: (show: boolean) => void;
  setSuccess: (message: string | null) => void;
}

export const useSmartSuggestions = ({
  setAvailableSizes,
  setProfileCombinations,
  setIsLoadingSuggestions,
  setNewItemForm,
  setShowCombinationDialog,
  setSuccess,
}: UseSmartSuggestionsProps) => {
  // ============================================================================
  // SMART SUGGESTIONS API FUNCTIONS
  // ============================================================================

  const getAvailableSizes = useCallback(
    async (productName: string): Promise<void> => {
      if (!productName.trim()) {
        setAvailableSizes([]);
        return;
      }

      setIsLoadingSuggestions(true);

      try {
        // ✅ NEW: Using unified suggestion API
        const suggestions = await suggestionApi.getSizes(productName.trim());
        const sizes = suggestions.map((s) => s.value);
        setAvailableSizes(sizes);
      } catch (error) {
        // Silently handle errors (already logged by apiClient interceptor)
        if (
          error instanceof Error &&
          (error as AxiosError).code !== "ERR_CANCELED"
        ) {
          console.warn("⚠️ Size suggestions could not be loaded");
        }
        setAvailableSizes([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [setAvailableSizes, setIsLoadingSuggestions],
  );

  const getProfileCombinations = useCallback(
    async (productName: string, size: string): Promise<void> => {
      if (!productName.trim() || !size.trim()) {
        setProfileCombinations([]);
        return;
      }

      setIsLoadingSuggestions(true);

      try {
        // ✅ NEW: Using unified suggestion API
        const combinations = await suggestionApi.getCombinations(
          productName.trim(),
          size.trim(),
        );

        // Transform to ProfileCombination format
        const transformed: ProfileCombination[] = combinations.map((combo) => ({
          profiles: combo.profiles.map((p) => ({
            profile: p.profile,
            measurement: p.measurement,
            ratio: p.ratio,
          })),
          confidence: combo.totalConfidence,
          reasoning: combo.reasoning,
        }));

        setProfileCombinations(transformed);
      } catch (error) {
        // Silently handle errors (already logged by apiClient interceptor)
        if (
          error instanceof Error &&
          (error as AxiosError).code !== "ERR_CANCELED"
        ) {
          console.warn("⚠️ Profile combinations could not be loaded");
        }
        setProfileCombinations([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [setProfileCombinations, setIsLoadingSuggestions],
  );

  const applyProfileCombination = useCallback(
    (combination: ProfileCombination, orderQuantity: number): void => {
      const newProfiles = combination.profiles.map((profile, index) => ({
        id: (index + 1).toString(),
        profile: profile.profile,
        measurement: profile.measurement,
        quantity: Math.round(orderQuantity * profile.ratio).toString(),
      }));

      setNewItemForm(
        (prev: WorkOrderForm) =>
          ({
            ...prev,
            profiles: newProfiles,
          }) as WorkOrderForm,
      );

      setShowCombinationDialog(false);
      setSuccess("Profil kombinasyonu uygulandı");
    },
    [setNewItemForm, setShowCombinationDialog, setSuccess],
  );

  return {
    getAvailableSizes,
    getProfileCombinations,
    applyProfileCombination,
  };
};
