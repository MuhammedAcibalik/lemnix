/**
 * Waste Analysis Tab Component
 * Detailed waste analysis and insights
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from "react";
import { Box } from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";
import type { WasteDistribution } from "./utils";
import {
  formatLength,
  getWasteCategoryColor,
  getWasteCategoryLabel,
} from "./utils";
import { SummaryCard, BreakdownCard } from "./shared";

export interface WasteAnalysisTabProps {
  readonly wasteDistribution: WasteDistribution;
  readonly totalWaste: number;
  readonly wastePercentage: number;
}

/**
 * Waste Analysis Tab
 * Detailed waste breakdown and analysis
 */
export const WasteAnalysisTab: React.FC<WasteAnalysisTabProps> = ({
  wasteDistribution,
  totalWaste,
  wastePercentage,
}) => {
  const ds = useDesignSystem();

  const categories = [
    {
      key: "minimal",
      label: getWasteCategoryLabel("minimal"),
      value: wasteDistribution.minimal || 0,
    },
    {
      key: "small",
      label: getWasteCategoryLabel("small"),
      value: wasteDistribution.small || 0,
    },
    {
      key: "medium",
      label: getWasteCategoryLabel("medium"),
      value: wasteDistribution.medium || 0,
    },
    {
      key: "large",
      label: getWasteCategoryLabel("large"),
      value: wasteDistribution.large || 0,
    },
    {
      key: "excessive",
      label: getWasteCategoryLabel("excessive"),
      value: wasteDistribution.excessive || 0,
    },
  ];

  const totalPieces = wasteDistribution.totalPieces || 1;

  const summaryItems = [
    {
      label: "Toplam Fire",
      value: formatLength(totalWaste),
      color: ds.colors.error.main,
    },
    {
      label: "Fire Oranı",
      value: `${wastePercentage.toFixed(1)}%`,
      color: ds.colors.warning.main,
    },
    {
      label: "Geri Kazanılabilir",
      value: wasteDistribution.reclaimable || 0,
      color: ds.colors.success.main,
    },
  ];

  const breakdownItems = categories.map((category) => ({
    key: category.key,
    label: category.label,
    value: category.value,
    color: getWasteCategoryColor(category.key),
    displayValue: `${category.value} adet`,
  }));

  return (
    <Box>
      <SummaryCard title="Fire Analizi Özeti" items={summaryItems} />
      <BreakdownCard
        title="Kategori Dağılımı"
        items={breakdownItems}
        total={totalPieces}
        showChip={true}
        indicatorShape="circle"
      />
    </Box>
  );
};
