/**
 * @fileoverview Page Content Component
 * @module App/Components
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useDesignSystem } from "@/shared/hooks";
import {
  LazyHomePage,
  LazyDashboardPage,
  LazyCuttingListBuilder,
  LazyEnterpriseOptimizationWizard,
  LazyStatisticsPage,
  LazyProductionPlanLayout,
  LazyProductionPlanListPage,
  LazyBackorderPage,
  LazyProductionPlanStatisticsPage,
  LazyProfileManagementPage,
} from "@/shared/ui/LazyComponents";
import { navigationConfig } from "../constants";

/**
 * Page Content Component
 */
export const PageContent: React.FC = () => {
  const ds = useDesignSystem();

  return (
    <Box
      id="main-content"
      component="main"
      sx={{
        flexGrow: 1,
        width: "100%",
        minHeight: "100vh",
        overflow: "auto",
        pt: navigationConfig.useModernNavigation
          ? { xs: "64px", md: "72px" }
          : 0,
        pb: { xs: ds.spacing["4"], md: ds.spacing["6"] },
        px: {
          xs: 0,
          sm: ds.spacing["2"],
          md: ds.spacing["4"],
          lg: ds.spacing["6"],
        },
      }}
    >
      <Routes>
        <Route path="/" element={<LazyHomePage />} />
        <Route path="/dashboard" element={<LazyDashboardPage />} />
        <Route path="/cutting-list" element={<LazyCuttingListBuilder />} />
        <Route
          path="/enterprise-optimization"
          element={<LazyEnterpriseOptimizationWizard />}
        />
        <Route path="/statistics" element={<LazyStatisticsPage />} />
        <Route path="/production-plan" element={<LazyProductionPlanLayout />}>
          <Route
            index
            element={<Navigate to="/production-plan/plans" replace />}
          />
          <Route path="plans" element={<LazyProductionPlanListPage />} />
          <Route path="backorder" element={<LazyBackorderPage />} />
          <Route
            path="statistics"
            element={<LazyProductionPlanStatisticsPage />}
          />
        </Route>
        <Route
          path="/profile-management"
          element={<LazyProfileManagementPage />}
        />
        <Route
          path="/settings"
          element={
            <Box
              sx={{
                p: {
                  xs: ds.spacing["3"],
                  md: ds.spacing["4"],
                  lg: ds.spacing["6"],
                },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: ds.typography.fontWeight.bold,
                  color: ds.colors.text.primary,
                  mb: ds.spacing["2"],
                }}
              >
                Ayarlar
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sistem ayarları burada yapılandırılacak.
              </Typography>
            </Box>
          }
        />
        <Route path="*" element={<LazyHomePage />} />
      </Routes>
    </Box>
  );
};
