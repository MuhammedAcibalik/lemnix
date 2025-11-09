/**
 * Profile Management Panel - Public API
 * @module widgets/profile-management-panel
 */

export { ProfileManagementPanel } from "./ui/ProfileManagementPanel";
export { UploadDialog } from "./ui/UploadDialog";
export { ProfileDefinitionsTable } from "./ui/ProfileDefinitionsTable";
export { MappingsTable } from "./ui/MappingsTable";

// Hooks
export {
  useProfileDefinitions,
  useMappingsByWeek,
  useProfileStatistics,
  useUploadProfileManagement,
  useUpdateMapping,
  useUpdateProfileDefinition,
  useDeleteProfileDefinition,
} from "./model/useProfileManagement";

// Default export for lazy loading
export { ProfileManagementPanel as default } from "./ui/ProfileManagementPanel";
