/**
 * @fileoverview Material Profile Mapping Entity Entry Point
 * @module entities/material-profile-mapping
 * @version 1.0.0
 */

// Types
export type {
  ProfileSuggestion,
  SaveMappingRequest,
  ProfileSuggestionsResponse,
  SaveMappingResponse,
  PopularMappingsResponse,
  IncrementUsageRequest,
  IncrementUsageResponse
} from './model/types';

// API Client
export { materialProfileMappingApi } from './api/materialProfileMappingApi';

// React Query Hooks
export {
  useProfileSuggestions,
  useAllMappingsForMaterial,
  usePopularMappings,
  useSaveProfileMapping,
  useIncrementUsageCount,
  materialProfileMappingKeys
} from './api/materialProfileMappingQueries';

// Helper Functions
export {
  getConfidenceColor,
  getConfidenceLabel,
  isProfileSuggestion,
  isSaveMappingRequest
} from './model/types';
