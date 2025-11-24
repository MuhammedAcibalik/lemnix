/**
 * @fileoverview Production Plan Layout - Tab Navigation Wrapper
 * @module pages/production-plan-layout
 * @version 1.0.0
 */

import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";

interface TabConfig {
  readonly label: string;
  readonly path: string;
  readonly icon: React.ReactElement;
}

export const ProductionPlanLayout: React.FC = () => {
  const theme = useTheme();
  const ds = useDesignSystem();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: TabConfig[] = [
    {
      label: "Üretim Planı",
      path: "/production-plan/plans",
      icon: <AssignmentIcon />,
    },
    {
      label: "Backorder",
      path: "/production-plan/backorder",
      icon: <WarningIcon />,
    },
    {
      label: "İstatistikler",
      path: "/production-plan/statistics",
      icon: <BarChartIcon />,
    },
  ];

  const currentTab = tabs.findIndex((tab) => location.pathname === tab.path);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const selectedTab = tabs[newValue];
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[50],
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "&": {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      }}
    >
      {/* Tab Navigation - Glassmorphism Design */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          px: ds.spacing["4"],
          py: ds.spacing["2"],
          boxShadow: ds.shadows.soft.sm,
        }}
      >
        <Tabs
          value={currentTab >= 0 ? currentTab : 0}
          onChange={handleTabChange}
          variant="standard"
          sx={{
            "& .MuiTabs-indicator": {
              background: ds.gradients.primary,
              height: 3,
              borderRadius: "2px 2px 0 0",
            },
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: theme.palette.grey[600],
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                fontWeight: 700,
              },
              "& .MuiSvgIcon-root": {
                marginRight: ds.spacing["1"],
                fontSize: "1.25rem",
              },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.path}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                borderRadius: ds.borderRadius["sm"],
                mx: ds.spacing["1"],
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Page Content */}
      <Box
        sx={{
          p: ds.spacing["2"],
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default ProductionPlanLayout;
