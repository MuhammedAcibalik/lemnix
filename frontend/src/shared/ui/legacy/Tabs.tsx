/**
 * @fileoverview Shared Tabs Component
 * @module SharedTabs
 * @version 1.0.0
 *
 * Reusable tabs component with consistent styling and behavior
 */

import React from "react";
import { Tabs, Tab, Box, Paper, useTheme, alpha } from "@mui/material";

interface TabItem {
  label: string;
  icon?: React.ReactNode;
  value: number;
  disabled?: boolean;
}

interface SharedTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: TabItem[];
  variant?: "standard" | "scrollable" | "fullWidth";
  centered?: boolean;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}

export const SharedTabs: React.FC<SharedTabsProps> = ({
  value,
  onChange,
  tabs,
  variant = "fullWidth",
  centered = false,
  orientation = "horizontal",
  children,
}) => {
  const theme = useTheme();

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          borderRadius: theme.shape.borderRadius * 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
          mb: 2,
        }}
      >
        <Tabs
          value={value}
          onChange={onChange}
          variant={variant}
          centered={centered}
          orientation={orientation}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              minHeight: 48,
              color: theme.palette.text.secondary,
              transition: theme.transitions.create(
                ["color", "background-color"],
                {
                  duration: theme.transitions.duration.short,
                },
              ),
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                fontWeight: 600,
              },
              "&.Mui-disabled": {
                color: theme.palette.action.disabled,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: theme.palette.primary.main,
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
            "& .MuiTabs-scrollButtons": {
              color: theme.palette.text.secondary,
              "&.Mui-disabled": {
                opacity: 0.3,
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              value={tab.value}
              disabled={tab.disabled}
            />
          ))}
        </Tabs>
      </Paper>

      <Box>{children}</Box>
    </Box>
  );
};
