/**
 * @fileoverview App Router Component
 * @module App/Components
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";
import { Box } from "@mui/material";
import { useAppState } from "../hooks/useAppState";
import { ModernNavigationWrapper } from "./ModernNavigationWrapper";
import { PageContent } from "./PageContent";
import { SnackbarWrapper } from "./SnackbarWrapper";
import { AppRouterProps } from "../types";

/**
 * App Router Component
 */
export const AppRouter: React.FC<AppRouterProps> = () => {
  const { state, actions } = useAppState();

  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      {/* Modern Navigation */}
      <ModernNavigationWrapper
        activePage={state.activePage}
        onPageChange={actions.handlePageChange}
      />

      {/* Page Content */}
      <PageContent />

      {/* Snackbar */}
      <SnackbarWrapper
        snackbar={state.snackbar}
        onClose={actions.handleCloseSnackbar}
      />
    </Box>
  );
};
