/**
 * Profile Management React Query Hooks
 * @module widgets/profile-management-panel/model
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileManagementApi } from "@/entities/profile-management";

/**
 * Get profile definitions
 */
export function useProfileDefinitions(activeOnly = true) {
  return useQuery({
    queryKey: ["profile-management", "definitions", { activeOnly }] as const,
    queryFn: () =>
      ProfileManagementApi.getProfileDefinitions({ isActive: activeOnly }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get mappings by week/year
 */
export function useMappingsByWeek(
  weekNumber: number,
  year: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["profile-management", "mappings", { weekNumber, year }] as const,
    queryFn: () =>
      ProfileManagementApi.getWorkOrderProfileMappings({ weekNumber, year }),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get statistics
 */
export function useProfileStatistics() {
  return useQuery({
    queryKey: ["profile-management", "statistics"] as const,
    queryFn: () => ProfileManagementApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Upload Excel file
 */
export function useUploadProfileManagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => ProfileManagementApi.uploadProfileData(file),
    onSuccess: () => {
      // Invalidate all profile management queries
      queryClient.invalidateQueries({ queryKey: ["profile-management"] });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "definitions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "mappings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "statistics"],
      });
      queryClient.invalidateQueries({ queryKey: ["profileDefinitions"] });
      queryClient.invalidateQueries({ queryKey: ["workOrderProfileMappings"] });
    },
  });
}

/**
 * Update mapping
 */
export function useUpdateMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, profileCode }: { id: string; profileCode: string }) =>
      ProfileManagementApi.updateWorkOrderProfileMapping(id, {
        profileId: profileCode,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "mappings"],
      });
    },
  });
}

/**
 * Update profile definition
 */
export function useUpdateProfileDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { profileCode: string; profileName: string };
    }) => ProfileManagementApi.updateProfileDefinition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "definitions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "statistics"],
      });
    },
  });
}

/**
 * Delete profile definition
 */
export function useDeleteProfileDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      ProfileManagementApi.deleteProfileDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-management"] });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "definitions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "statistics"],
      });
    },
  });
}
