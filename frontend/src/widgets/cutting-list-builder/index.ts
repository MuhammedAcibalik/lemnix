/**
 * @fileoverview Main export file for CuttingListBuilder module
 * @module CuttingListBuilder
 * @version 2.0.0 - Clean exports
 */

// Main component
export { CuttingListBuilder } from "./CuttingListBuilder";

// Types
export type {
  CuttingList,
  WorkOrderItem,
  ProfileFormItem,
  WorkOrderForm,
  ProfileCombination,
  LoadingState,
  StatsItem,
  CuttingListStats,
  StyledCardProps,
  StyledButtonProps,
  StyledTextFieldProps,
  StyledChipProps,
  PageHeaderProps,
  ActionToolbarProps,
  CuttingListStatsProps,
} from "./types";

export type { ProductSection } from "./types";

// Styled components (as components, not types)
export {
  StyledCard,
  StyledButton,
  StyledTextField,
  StyledChip,
  PageHeader,
  ActionToolbar,
  CuttingListStats as CuttingListStatsComponent,
} from "./styled";

// Hooks
export { useCuttingListState } from "./hooks/useCuttingListState";
export { useCuttingListData } from "./hooks/useCuttingListData";
export { useSmartSuggestions } from "./hooks/useSmartSuggestions";

// Dialogs
export { NewProductDialog } from "./dialogs/NewProductDialog";
export { NewItemDialog } from "./dialogs/NewItemDialog";
export { CombinationDialog } from "./dialogs/CombinationDialog";
export { EditItemDialog } from "./dialogs/EditItemDialog";

// Components
export { ProductSection as ProductSectionComponent } from "./components/ProductSection";
export { WorkOrderItem as WorkOrderItemComponent } from "./components/WorkOrderItem";
export { CuttingListsGrid } from "./components/CuttingListsGrid";
export { NewCuttingListSection } from "./components/NewCuttingListSection";
export { CuttingListDetails } from "./components/CuttingListDetails";
export { StatisticsTab } from "./components/StatisticsTab";
export { SettingsTab } from "./components/SettingsTab";

// Tabs
export { MainTab } from "./tabs/MainTab";
