/**
 * Cost Analysis Tab Component
 * Detailed cost breakdown and analysis
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from "react";
import { Box } from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";
import type { CostBreakdownData } from "./utils";
import { formatCurrency } from "./utils";
import { SummaryCard, BreakdownCard } from "./shared";

export interface CostAnalysisTabProps {
  readonly costData: CostBreakdownData;
}

/**
 * Cost Analysis Tab
 * Detailed cost breakdown
 */
export const CostAnalysisTab: React.FC<CostAnalysisTabProps> = ({
  costData,
}) => {
  const ds = useDesignSystem();

  const costItems = [
    {
      key: "material",
      label: "Materyal Maliyeti",
      value: costData.materialCost,
      color: ds.colors.primary.main,
    },
    {
      key: "labor",
      label: "İşçilik Maliyeti",
      value: costData.laborCost,
      color: ds.colors.success.main,
    },
    {
      key: "waste",
      label: "Fire Maliyeti",
      value: costData.wasteCost,
      color: ds.colors.error.main,
    },
    {
      key: "setup",
      label: "Kurulum Maliyeti",
      value: costData.setupCost,
      color: ds.colors.warning.main,
    },
    {
      key: "cutting",
      label: "Kesim Maliyeti",
      value: costData.cuttingCost,
      color: ds.colors.accent.main,
    },
    {
      key: "time",
      label: "Zaman Maliyeti",
      value: costData.timeCost,
      color: ds.colors.neutral[600],
    },
  ].filter((item) => item.value > 0); // Only show non-zero costs

  const summaryItems = [
    {
      label: "Toplam Maliyet",
      value: formatCurrency(costData.totalCost),
      color: ds.colors.primary.main,
    },
    {
      label: "Metre Başı Maliyet",
      value: formatCurrency(costData.costPerMeter),
      color: ds.colors.accent.main,
    },
  ];

  return (
    <Box>
      <SummaryCard title="Maliyet Özeti" items={summaryItems} />
      <BreakdownCard
        title="Maliyet Dağılımı"
        items={costItems.map((item) => ({
          ...item,
          displayValue: formatCurrency(item.value),
        }))}
        total={costData.totalCost}
      />
    </Box>
  );
};
