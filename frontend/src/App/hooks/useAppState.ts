/**
 * @fileoverview App State Hook
 * @module App/Hooks
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import { useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppState, PageChangeHandler, SnackbarCloseHandler } from "../types";
import { defaultState, routes, pageIds } from "../constants";

/**
 * Custom hook for managing app state
 */
export const useAppState = (): {
  state: AppState;
  actions: {
    setActivePage: (page: string) => void;
    setIsLoading: (loading: boolean) => void;
    setSnackbar: (snackbar: Partial<AppState["snackbar"]>) => void;
    setExcelItems: (items: AppState["excelItems"]) => void;
    setOptimizationResult: (result: AppState["optimizationResult"]) => void;
    handlePageChange: PageChangeHandler;
    handleCloseSnackbar: SnackbarCloseHandler;
  };
} => {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<Omit<AppState, "activePage">>(() => ({
    isLoading: defaultState.isLoading,
    snackbar: { ...defaultState.snackbar },
    excelItems: [...defaultState.excelItems],
    optimizationResult: defaultState.optimizationResult,
  }));

  const activePage = useMemo(
    () => getPageFromLocation(location.pathname),
    [location.pathname],
  );

  const setIsLoading = useCallback((loading: boolean): void => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const setSnackbar = useCallback(
    (snackbar: Partial<AppState["snackbar"]>): void => {
      setState((prev) => ({
        ...prev,
        snackbar: { ...prev.snackbar, ...snackbar },
      }));
    },
    [],
  );

  const setExcelItems = useCallback((items: AppState["excelItems"]): void => {
    setState((prev) => ({ ...prev, excelItems: items }));
  }, []);

  const setOptimizationResult = useCallback(
    (result: AppState["optimizationResult"]): void => {
      setState((prev) => ({ ...prev, optimizationResult: result }));
    },
    [],
  );

  const handlePageChange = useCallback(
    (page: string): void => {
      // Update URL based on page
      const routeMap: Record<string, string> = {
        [pageIds.home]: routes.home,
        [pageIds.dashboard]: routes.dashboard,
        [pageIds.cuttingList]: routes.cuttingList,
        [pageIds.enterpriseOptimization]: routes.enterpriseOptimization,
        [pageIds.statistics]: routes.statistics,
        [pageIds.productionPlan]: routes.productionPlan,
        [pageIds.profileManagement]: routes.profileManagement,
        [pageIds.settings]: routes.settings,
      };

      const route = routeMap[page] || routes.home;
      navigate(route);
    },
    [navigate],
  );

  const handleCloseSnackbar = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      snackbar: { ...prev.snackbar, open: false },
    }));
  }, []);

  const viewState: AppState = { ...state, activePage };

  const setActivePage = useCallback(
    (page: string): void => {
      handlePageChange(page);
    },
    [handlePageChange],
  );

  return {
    state: viewState,
    actions: {
      setActivePage,
      setIsLoading,
      setSnackbar,
      setExcelItems,
      setOptimizationResult,
      handlePageChange,
      handleCloseSnackbar,
    },
  };
};

/**
 * Helper function to get page ID from location pathname
 */
function getPageFromLocation(pathname: string): string {
  const pathToPageMap: Record<string, string> = {
    [routes.home]: pageIds.home,
    [routes.dashboard]: pageIds.dashboard,
    [routes.cuttingList]: pageIds.cuttingList,
    [routes.enterpriseOptimization]: pageIds.enterpriseOptimization,
    [routes.statistics]: pageIds.statistics,
    [routes.productionPlan]: pageIds.productionPlan,
    [routes.profileManagement]: pageIds.profileManagement,
    [routes.settings]: pageIds.settings,
  };

  return pathToPageMap[pathname] || pageIds.home;
}
