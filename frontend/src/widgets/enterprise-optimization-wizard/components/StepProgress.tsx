/**
 * @fileoverview Wizard Tabs Component - Design System v2.0
 * @module EnterpriseOptimizationWizard/Components/WizardTabs
 * @version 2.0.0
 *
 * Modern tab-based navigation replacing classic step wizard
 */

import React from "react";
import { Box, Tabs, Tab, alpha, useMediaQuery, useTheme } from "@mui/material";
import {
  ListAlt as ListIcon,
  Settings as SettingsIcon,
  Visibility as PreviewIcon,
  Assessment as ResultsIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";

interface WizardTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  completedTabs?: number[];
  canProceedToTab?: (tab: number) => boolean;
}

export const WizardTabs: React.FC<WizardTabsProps> = ({
  activeTab,
  onTabChange,
  completedTabs = [],
  canProceedToTab = () => true,
}) => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const tabs = [
    { label: "Kesim Listesi", icon: ListIcon },
    { label: "Parametreler", icon: SettingsIcon },
    { label: "Önizleme", icon: PreviewIcon },
    { label: "Sonuçlar", icon: ResultsIcon },
  ];

  return (
    <Box
      sx={{
        height: 50,
        borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
        background: ds.colors.surface.elevated1,
        display: "flex",
        alignItems: "center",
        px: isMobile ? ds.spacing["2"] : ds.spacing["4"],
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{
          minHeight: 50,
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: `${ds.borderRadius.xs}px ${ds.borderRadius.xs}px 0 0`,
            background: ds.gradients.primary,
          },
          "& .MuiTabs-flexContainer": {
            gap: isMobile ? 0 : ds.spacing["2"],
          },
        }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isCompleted = completedTabs.includes(index);
          const isActive = index === activeTab;
          const isDisabled = !canProceedToTab(index);

          return (
            <Tab
              key={index}
              label={isMobile ? `${index + 1}` : tab.label}
              icon={<Icon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              disabled={isDisabled}
              aria-label={`${index + 1}. Adım: ${tab.label}`}
              aria-current={isActive ? "step" : undefined}
              sx={{
                minHeight: 50,
                px: isMobile ? ds.spacing["2"] : ds.spacing["3"],
                fontSize: "0.8125rem",
                fontWeight: isActive
                  ? ds.typography.fontWeight.semibold
                  : ds.typography.fontWeight.medium,
                color: isDisabled
                  ? ds.colors.text.disabled
                  : isActive
                    ? ds.colors.primary.main
                    : ds.colors.text.secondary,
                textTransform: "none",
                transition: ds.transitions.fast,
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
                "&:hover": {
                  color: isDisabled
                    ? ds.colors.text.disabled
                    : ds.colors.primary.main,
                  backgroundColor: isDisabled
                    ? "transparent"
                    : alpha(ds.colors.primary.main, 0.04),
                },
                "&.Mui-disabled": {
                  color: ds.colors.text.disabled,
                  opacity: 0.5,
                },
                "& .MuiTab-iconWrapper": {
                  mb: 0,
                  mr: isMobile ? 0 : ds.spacing["1"],
                  color: isDisabled
                    ? ds.colors.text.disabled
                    : isCompleted
                      ? ds.colors.success.main
                      : isActive
                        ? ds.colors.primary.main
                        : ds.colors.text.secondary,
                },
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
};

// Export with backward compatibility name
export const StepProgress = WizardTabs;
