/**
 * @fileoverview Material Profile Mapping Types
 * @module entities/material-profile-mapping/model/types
 * @version 1.0.0
 */

export interface ProfileSuggestion {
  readonly profileType: string;
  readonly length: number;
  readonly usageCount: number;
  readonly lastUsed: string;
  readonly confidence: "high" | "medium" | "low";
}

export interface SaveMappingRequest {
  readonly malzemeNo: string;
  readonly malzemeKisaMetni: string;
  readonly profileType: string;
  readonly length: number;
  readonly createdBy?: string;
}

export interface ProfileSuggestionsResponse {
  readonly success: boolean;
  readonly data: ProfileSuggestion[];
  readonly error?: string;
}

export interface SaveMappingResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
}

export interface PopularMappingsResponse {
  readonly success: boolean;
  readonly data: ProfileSuggestion[];
  readonly error?: string;
}

export interface IncrementUsageRequest {
  readonly malzemeNo: string;
  readonly profileType: string;
  readonly length: number;
}

export interface IncrementUsageResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
}

// Confidence level helpers
export const getConfidenceColor = (
  confidence: "high" | "medium" | "low",
): string => {
  switch (confidence) {
    case "high":
      return "#4caf50"; // Green
    case "medium":
      return "#ff9800"; // Orange
    case "low":
      return "#f44336"; // Red
    default:
      return "#9e9e9e"; // Grey
  }
};

export const getConfidenceLabel = (
  confidence: "high" | "medium" | "low",
): string => {
  switch (confidence) {
    case "high":
      return "Yüksek";
    case "medium":
      return "Orta";
    case "low":
      return "Düşük";
    default:
      return "Bilinmiyor";
  }
};

// Type guards
export const isProfileSuggestion = (
  value: unknown,
): value is ProfileSuggestion => {
  return (
    typeof value === "object" &&
    value !== null &&
    "profileType" in value &&
    "length" in value &&
    "usageCount" in value &&
    "lastUsed" in value &&
    "confidence" in value &&
    typeof (value as ProfileSuggestion).profileType === "string" &&
    typeof (value as ProfileSuggestion).length === "number" &&
    typeof (value as ProfileSuggestion).usageCount === "number" &&
    typeof (value as ProfileSuggestion).lastUsed === "string" &&
    ["high", "medium", "low"].includes((value as ProfileSuggestion).confidence)
  );
};

export const isSaveMappingRequest = (
  value: unknown,
): value is SaveMappingRequest => {
  return (
    typeof value === "object" &&
    value !== null &&
    "malzemeNo" in value &&
    "malzemeKisaMetni" in value &&
    "profileType" in value &&
    "length" in value &&
    typeof (value as SaveMappingRequest).malzemeNo === "string" &&
    typeof (value as SaveMappingRequest).malzemeKisaMetni === "string" &&
    typeof (value as SaveMappingRequest).profileType === "string" &&
    typeof (value as SaveMappingRequest).length === "number"
  );
};
