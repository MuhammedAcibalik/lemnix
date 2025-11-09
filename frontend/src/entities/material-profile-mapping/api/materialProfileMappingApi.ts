/**
 * @fileoverview Material Profile Mapping API Client
 * @module entities/material-profile-mapping/api/materialProfileMappingApi
 * @version 1.0.0
 */

import { apiClient } from "@/shared/api/client";
import type {
  ProfileSuggestion,
  SaveMappingRequest,
  ProfileSuggestionsResponse,
  SaveMappingResponse,
  PopularMappingsResponse,
  IncrementUsageRequest,
  IncrementUsageResponse,
} from "../model/types";

class MaterialProfileMappingApi {
  private readonly baseUrl = "/api/material-profile-mappings";

  /**
   * Malzeme numarası için profil önerileri getir
   */
  async getSuggestions(malzemeNo: string): Promise<ProfileSuggestion[]> {
    const response = await apiClient.get<ProfileSuggestionsResponse>(
      `${this.baseUrl}/suggestions?malzemeNo=${encodeURIComponent(malzemeNo)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Profil önerileri alınamadı");
    }

    return response.data.data;
  }

  /**
   * Yeni mapping kaydet
   */
  async saveMapping(request: SaveMappingRequest): Promise<void> {
    const response = await apiClient.post<SaveMappingResponse>(
      this.baseUrl,
      request,
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Mapping kaydedilemedi");
    }
  }

  /**
   * Malzeme numarası için tüm mapping'leri getir
   */
  async getAllMappingsForMaterial(
    malzemeNo: string,
  ): Promise<ProfileSuggestion[]> {
    const response = await apiClient.get<ProfileSuggestionsResponse>(
      `${this.baseUrl}/material/${encodeURIComponent(malzemeNo)}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Malzeme mapping'leri alınamadı");
    }

    return response.data.data;
  }

  /**
   * En popüler mapping'leri getir
   */
  async getPopularMappings(limit: number = 20): Promise<ProfileSuggestion[]> {
    const response = await apiClient.get<PopularMappingsResponse>(
      `${this.baseUrl}/popular?limit=${limit}`,
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Popüler mapping'ler alınamadı");
    }

    return response.data.data;
  }

  /**
   * Usage count artır
   */
  async incrementUsageCount(request: IncrementUsageRequest): Promise<void> {
    const response = await apiClient.post<IncrementUsageResponse>(
      `${this.baseUrl}/increment-usage`,
      request,
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "Usage count artırılamadı");
    }
  }
}

export const materialProfileMappingApi = new MaterialProfileMappingApi();
