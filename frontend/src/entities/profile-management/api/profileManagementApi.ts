/**
 * Profile Management API Client
 * React Query hooks and API functions for profile management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import {
  ProfileDefinition,
  ProfileManagementUploadResult,
  WorkOrderProfileMapping,
  ProfileStockLength,
} from "../model/types";

export class ProfileManagementApi {
  private static readonly BASE_URL = "/profile-management";

  public static async uploadProfileData(
    file: File,
  ): Promise<ProfileManagementUploadResult> {
    const formData = new FormData();
    formData.append("profileFile", file);

    const response = await apiClient.post<ProfileManagementUploadResult>(
      `${ProfileManagementApi.BASE_URL}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  }

  public static async getProfileDefinitions(filters?: {
    isActive?: boolean;
    search?: string;
  }): Promise<ProfileDefinition[]> {
    const params: Record<string, string> = {};
    if (filters?.isActive !== undefined)
      params.activeOnly = String(filters.isActive);
    if (filters?.search) params.search = filters.search;

    const response = await apiClient.get<{
      success: boolean;
      data: ProfileDefinition[];
    }>(`${ProfileManagementApi.BASE_URL}/definitions`, { params });

    return response.data.data;
  }

  public static async updateProfileDefinition(
    id: string,
    data: {
      profileName?: string;
      isActive?: boolean;
      stockLengths?: ProfileStockLength[];
    },
  ): Promise<ProfileDefinition> {
    const response = await apiClient.put<{
      success: boolean;
      data: ProfileDefinition;
    }>(`${ProfileManagementApi.BASE_URL}/definitions/${id}`, data);

    return response.data.data;
  }

  public static async deleteProfileDefinition(id: string): Promise<void> {
    await apiClient.delete(
      `${ProfileManagementApi.BASE_URL}/definitions/${id}`,
    );
  }

  public static async getWorkOrderProfileMappings(filters: {
    weekNumber: number;
    year: number;
    workOrderId?: string;
    profileType?: string;
    search?: string;
  }): Promise<WorkOrderProfileMapping[]> {
    const params: Record<string, string> = {
      weekNumber: String(filters.weekNumber),
      year: String(filters.year),
    };
    if (filters.workOrderId) params.workOrderId = filters.workOrderId;
    if (filters.profileType) params.profileType = filters.profileType;
    if (filters.search) params.search = filters.search;

    const response = await apiClient.get<{
      success: boolean;
      data: WorkOrderProfileMapping[];
    }>(`${ProfileManagementApi.BASE_URL}/mappings`, { params });

    return response.data.data;
  }

  public static async updateWorkOrderProfileMapping(
    id: string,
    data: { profileId?: string; profileType?: string },
  ): Promise<WorkOrderProfileMapping> {
    const response = await apiClient.put<{
      success: boolean;
      data: WorkOrderProfileMapping;
    }>(`${ProfileManagementApi.BASE_URL}/mappings/${id}`, data);

    return response.data.data;
  }

  public static async deleteWorkOrderProfileMapping(id: string): Promise<void> {
    await apiClient.delete(`${ProfileManagementApi.BASE_URL}/mappings/${id}`);
  }

  public static async getStatistics(): Promise<{
    totalProfiles: number;
    activeProfiles: number;
    totalMappings: number;
    uniqueWeeks: number;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        totalProfiles: number;
        activeProfiles: number;
        totalMappings: number;
        uniqueWeeks: number;
      };
    }>(`${ProfileManagementApi.BASE_URL}/statistics`);

    return response.data.data;
  }

  public static async getActiveProfiles(): Promise<
    Array<{
      readonly profileId: string;
      readonly profileCode: string;
      readonly profileName: string;
      readonly stockLengths: readonly number[];
    }>
  > {
    const response = await apiClient.get<{
      success: boolean;
      data: ProfileDefinition[];
    }>(`${ProfileManagementApi.BASE_URL}/definitions`, {
      params: {
        activeOnly: "true",
        includeStockLengths: "true",
      },
    });

    // Transform to match expected interface
    return response.data.data
      .filter(
        (profile) => profile.stockLengths && profile.stockLengths.length > 0,
      )
      .map((profile) => ({
        profileId: profile.id,
        profileCode: profile.profileCode,
        profileName: profile.profileName,
        stockLengths: profile.stockLengths.map((sl) => sl.stockLength),
      }));
  }
}

export const useProfileManagementQueries = () => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ProfileManagementApi.uploadProfileData,
    onSuccess: () => {
      // Invalidate all profile-related queries
      queryClient.invalidateQueries({ queryKey: ["profileDefinitions"] });
      queryClient.invalidateQueries({ queryKey: ["workOrderProfileMappings"] });
      queryClient.invalidateQueries({
        queryKey: ["profile-management", "active"],
      });
      // Also invalidate any queries that start with 'profile-management'
      queryClient.invalidateQueries({ queryKey: ["profile-management"] });
    },
  });

  const getDefinitionsQuery = (filters?: {
    isActive?: boolean;
    search?: string;
  }) =>
    useQuery({
      queryKey: ["profileDefinitions", filters],
      queryFn: () => ProfileManagementApi.getProfileDefinitions(filters),
    });

  const updateDefinitionMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        profileName?: string;
        isActive?: boolean;
        stockLengths?: ProfileStockLength[];
      };
    }) => ProfileManagementApi.updateProfileDefinition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileDefinitions"] });
    },
  });

  const deleteDefinitionMutation = useMutation({
    mutationFn: ProfileManagementApi.deleteProfileDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileDefinitions"] });
    },
  });

  const getMappingsQuery = (filters: {
    weekNumber: number;
    year: number;
    workOrderId?: string;
    profileType?: string;
    search?: string;
  }) =>
    useQuery({
      queryKey: ["workOrderProfileMappings", filters],
      queryFn: () => ProfileManagementApi.getWorkOrderProfileMappings(filters),
      enabled: filters.weekNumber !== undefined && filters.year !== undefined,
    });

  const updateMappingMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { profileId?: string; profileType?: string };
    }) => ProfileManagementApi.updateWorkOrderProfileMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrderProfileMappings"] });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: ProfileManagementApi.deleteWorkOrderProfileMapping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrderProfileMappings"] });
    },
  });

  return {
    uploadMutation,
    getDefinitionsQuery,
    updateDefinitionMutation,
    deleteDefinitionMutation,
    getMappingsQuery,
    updateMappingMutation,
    deleteMappingMutation,
  };
};

export function useActiveProfiles() {
  return useQuery({
    queryKey: ["profile-management", "active"],
    queryFn: () => ProfileManagementApi.getActiveProfiles(),
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
