/**
 * Quick Create Hook
 * 
 * @module features/quick-cutting-list-create
 * @version 1.0.0 - Quick Create Hook
 */

import { useState } from 'react';
import { useCreateCuttingList } from '@/entities/cutting-list';
import type { CreateCuttingListRequest } from '@/entities/cutting-list';

export interface QuickCreateParams {
  readonly title: string;
  readonly description?: string;
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
      setError(error.message || 'Kesim listesi oluşturulurken bir hata oluştu');
    },
  });

  const createList = async (params: QuickCreateParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: CreateCuttingListRequest = {
        title: params.title,
        description: params.description,
        sections: [], // Empty sections to start with
      };

      const result = await createMutation.mutateAsync(request);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      throw err;
    }
  };

  return {
    createList,
    isLoading,
    error,
  };
}
