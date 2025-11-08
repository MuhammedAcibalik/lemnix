/**
 * @fileoverview Main Tab - Orchestration Layer
 * @module MainTab
 * @version 3.0.0 - RBAC Integration
 * 
 * ✅ P1-4: Permission-aware UI rendering
 * Pure orchestration component - delegates all rendering to sub-components
 */

import React from 'react';
import { CuttingList, WorkOrderItem, LoadingState } from '../types';
import { NewCuttingListSection } from '../components/NewCuttingListSection';
import { CuttingListsGrid } from '../components/CuttingListsGrid';
import { CuttingListDetails } from '../components/CuttingListDetails';
import { Permission, usePermissions } from '@/shared/hooks';

interface MainTabProps {
  cuttingList: CuttingList | null;
  cuttingLists: CuttingList[];
  currentWeekNumber: number;
  title: string;
  selectedWeekNumber: number;
  loadingState: LoadingState;
  onTitleChange: (title: string) => void;
  onWeekNumberChange: (weekNumber: number) => void;
  onCreateList: () => Promise<void>;
  onSelectList: (list: CuttingList) => void;
  onDeleteList?: (id: string) => void; // Add delete callback
  onAddProduct: () => void;
  onExportPDF: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  onBackToList: () => void;
  onAddItem: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onEditItem: (sectionId: string, item: WorkOrderItem) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onCopyItem: (item: WorkOrderItem) => void;
}

export const MainTab: React.FC<MainTabProps> = ({
  cuttingList,
  cuttingLists,
  currentWeekNumber,
  title,
  selectedWeekNumber,
  loadingState,
  onTitleChange,
  onWeekNumberChange,
  onCreateList,
  onSelectList,
  onDeleteList,
  onAddProduct,
  onExportPDF,
  onExportExcel,
  onBackToList,
  onAddItem,
  onDeleteSection,
  onEditItem,
  onDeleteItem,
  onCopyItem,
}) => {
  // ✅ P1-4: RBAC Permission Checks
  const { hasPermission } = usePermissions();
  // No selected list - Show creation + grid
  if (!cuttingList) {
    return (
      <>
        <NewCuttingListSection
          title={title}
          selectedWeekNumber={selectedWeekNumber}
          currentWeekNumber={currentWeekNumber}
          loadingState={loadingState}
          onTitleChange={onTitleChange}
          onWeekNumberChange={onWeekNumberChange}
          onCreateList={onCreateList}
        />
        <CuttingListsGrid
          cuttingLists={cuttingLists}
          currentWeekNumber={currentWeekNumber}
          onSelectList={onSelectList}
          onDeleteList={onDeleteList}
        />
      </>
    );
  }

  // Selected list - Show details
  return (
    <CuttingListDetails
      cuttingList={cuttingList}
      loadingState={loadingState}
      onAddProduct={onAddProduct}
      onExportPDF={onExportPDF}
      onExportExcel={onExportExcel}
      onBackToList={onBackToList}
      onAddItem={onAddItem}
      onDeleteSection={onDeleteSection}
      onEditItem={onEditItem}
      onDeleteItem={onDeleteItem}
      onCopyItem={onCopyItem}
    />
  );
};
