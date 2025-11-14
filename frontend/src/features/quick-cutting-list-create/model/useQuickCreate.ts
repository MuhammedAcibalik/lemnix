/**
 * Quick Create Hook
 *
 * @module features/quick-cutting-list-create
 * @version 1.0.0 - Quick Create Hook
 */

import { useState } from "react";
import { useCreateCuttingList, useCuttingLists } from "@/entities/cutting-list";
import type { CreateCuttingListRequest } from "@/entities/cutting-list";

export interface QuickCreateParams {
  readonly title: string;
  readonly description?: string;
}

// Helper to get current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

export function useQuickCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: cuttingLists } = useCuttingLists({
    staleTime: 0,
    gcTime: 0,
  });

  const createMutation = useCreateCuttingList({
    onSuccess: () => {
      setError(null);
    },
    onError: (error) => {
      setError(error.message || "Kesim listesi oluşturulurken bir hata oluştu");
    },
  });

  const createList = async (params: QuickCreateParams) => {
    setError(null);

    const currentWeek = getCurrentWeekNumber();
    const existingList = cuttingLists?.find(
      (list) => list.weekNumber === currentWeek,
    );

    if (existingList) {
      setError(
        `${currentWeek}. hafta için zaten "${existingList.title}" adlı bir kesim listesi mevcut.`,
      );
      return null;
    }

    setIsLoading(true);

    try {
      const request: CreateCuttingListRequest = {
        name: params.title,
        weekNumber: currentWeek,
      };

      const result = await createMutation.mutateAsync(request);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createList,
    isLoading,
    error,
  };
}
