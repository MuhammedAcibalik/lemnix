/**
 * @fileoverview Suggestions Entity Public API
 * @module entities/suggestions
 * @version 1.0.0
 *
 * Public API for suggestion entity
 * Follows FSD architecture pattern
 */

// API
export { suggestionApi } from "./api/suggestionApi";
export type {
  SmartSuggestion,
  ProfileSuggestion,
  AlternativeSuggestion,
  CombinationSuggestion,
  SuggestionStatistics,
} from "./api/suggestionApi";

// React Query Hooks
export {
  useProductSuggestions,
  useSizeSuggestions,
  useProfileSuggestions,
  useCombinationSuggestions,
  useSuggestionStatistics,
  useSuggestionHealth,
  useApplySmartSuggestion,
  suggestionKeys,
} from "./api/suggestionQueries";
