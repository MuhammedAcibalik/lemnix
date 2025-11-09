/**
 * Quick Create Hook
 *
 * @module features/quick-cutting-list-create
 * @version 1.0.0 - Quick Create Hook
 */

import { useState } from "react";
import { useCreateCuttingList } from "@/entities/cutting-list";
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

  const createMutation = useCreateCuttingList({
    onSuccess: () => {
      setIsLoading(false);
      setError(null);
    },
    onError: (error) => {
      setIsLoading(false);
      setError(error.message || "Kesim listesi oluşturulurken bir hata oluştu");
    },
  });

  const createList = async (params: QuickCreateParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: CreateCuttingListRequest = {
        name: params.title,
        weekNumber: getCurrentWeekNumber(),
      };

      const result = await createMutation.mutateAsync(request);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      throw err;
    }
  };

  return {
    createList,
    isLoading,
    error,
  };
}
