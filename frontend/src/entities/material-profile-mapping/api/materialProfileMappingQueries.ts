/**
 * @fileoverview Material Profile Mapping React Query Hooks
 * @module entities/material-profile-mapping/api/materialProfileMappingQueries
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialProfileMappingApi } from "./materialProfileMappingApi";
import type {
  ProfileSuggestion,
  SaveMappingRequest,
  IncrementUsageRequest,
} from "../model/types";

// Query Keys
export const materialProfileMappingKeys = {
  all: ["material-profile-mappings"] as const,
  suggestions: (malzemeNo: string) =>
    [...materialProfileMappingKeys.all, "suggestions", malzemeNo] as const,
  materialMappings: (malzemeNo: string) =>
    [...materialProfileMappingKeys.all, "material", malzemeNo] as const,
  popular: (limit: number) =>
    [...materialProfileMappingKeys.all, "popular", limit] as const,
} as const;

/**
 * Malzeme numarası için profil önerileri getir
 */
export const useProfileSuggestions = (malzemeNo: string) => {
  return useQuery({
    queryKey: materialProfileMappingKeys.suggestions(malzemeNo),
    queryFn: () => materialProfileMappingApi.getSuggestions(malzemeNo),
    enabled: !!malzemeNo && malzemeNo.trim() !== "",
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: (failureCount, error) => {
      // 404 hatalarında retry yapma (öneri yok demektir)
      if ((error as any)?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Malzeme numarası için tüm mapping'leri getir
 */
export const useAllMappingsForMaterial = (malzemeNo: string) => {
  return useQuery({
    queryKey: materialProfileMappingKeys.materialMappings(malzemeNo),
    queryFn: () =>
      materialProfileMappingApi.getAllMappingsForMaterial(malzemeNo),
    enabled: !!malzemeNo && malzemeNo.trim() !== "",
    staleTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * En popüler mapping'leri getir
 */
export const usePopularMappings = (limit: number = 20) => {
  return useQuery({
    queryKey: materialProfileMappingKeys.popular(limit),
    queryFn: () => materialProfileMappingApi.getPopularMappings(limit),
    staleTime: 15 * 60 * 1000, // 15 dakika
  });
};

/**
 * Yeni mapping kaydet
 */
export const useSaveProfileMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveMappingRequest) =>
      materialProfileMappingApi.saveMapping(request),
    onSuccess: (_, variables) => {
      // İlgili query'leri invalidate et
      queryClient.invalidateQueries({
        queryKey: materialProfileMappingKeys.suggestions(variables.malzemeNo),
      });
      queryClient.invalidateQueries({
        queryKey: materialProfileMappingKeys.materialMappings(
          variables.malzemeNo,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: materialProfileMappingKeys.popular(20),
      });
    },
    onError: (error) => {
      console.error("Save profile mapping error:", error);
    },
  });
};

/**
 * Usage count artır
 */
export const useIncrementUsageCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IncrementUsageRequest) =>
      materialProfileMappingApi.incrementUsageCount(request),
    onSuccess: (_, variables) => {
      // İlgili query'leri invalidate et
      queryClient.invalidateQueries({
        queryKey: materialProfileMappingKeys.suggestions(variables.malzemeNo),
      });
      queryClient.invalidateQueries({
        queryKey: materialProfileMappingKeys.materialMappings(
          variables.malzemeNo,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: materialProfileMappingKeys.popular(20),
      });
    },
    onError: (error) => {
      console.error("Increment usage count error:", error);
    },
  });
};
