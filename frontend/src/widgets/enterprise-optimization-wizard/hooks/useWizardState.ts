/**
 * @fileoverview Main wizard state management hook
 * @module EnterpriseOptimizationWizard/Hooks/useWizardState
 * @version 1.0.0
 */

import { useState, useCallback } from "react";
import { WizardState, OptimizationParams } from "../types";
import { DEFAULT_PARAMS } from "../constants";
import { generateUniqueId } from "../utils";

export const useWizardState = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [cuttingList, setCuttingList] = useState<WizardState["cuttingList"]>(
    [],
  );
  const [params, setParams] = useState<OptimizationParams>(DEFAULT_PARAMS);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<WizardState["optimizationResult"]>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([
    "genetic",
  ]);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [cuttingLists, setCuttingLists] = useState<WizardState["cuttingLists"]>(
    [],
  );
  const [loadingCuttingLists, setLoadingCuttingLists] = useState(false);
  const [selectedCuttingList, setSelectedCuttingList] =
    useState<WizardState["selectedCuttingList"]>(null);
  const [showDetailedSelection, setShowDetailedSelection] = useState(false);
  const [conversionResult, setConversionResult] =
    useState<WizardState["conversionResult"]>(null);

  // State update handlers
  const updateState = useCallback((updates: Partial<WizardState>) => {
    Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case "activeStep":
          setActiveStep(value as number);
          break;
        case "cuttingList":
          setCuttingList(value as WizardState["cuttingList"]);
          break;
        case "params":
          setParams(value as OptimizationParams);
          break;
        case "isOptimizing":
          setIsOptimizing(value as boolean);
          break;
        case "optimizationResult":
          setOptimizationResult(value as WizardState["optimizationResult"]);
          break;
        case "compareMode":
          setCompareMode(value as boolean);
          break;
        case "selectedAlgorithms":
          setSelectedAlgorithms(value as string[]);
          break;
        case "showInfoDialog":
          setShowInfoDialog(value as boolean);
          break;
        case "cuttingLists":
          setCuttingLists(value as WizardState["cuttingLists"]);
          break;
        case "loadingCuttingLists":
          setLoadingCuttingLists(value as boolean);
          break;
        case "selectedCuttingList":
          setSelectedCuttingList(value as WizardState["selectedCuttingList"]);
          break;
        case "showDetailedSelection":
          setShowDetailedSelection(value as boolean);
          break;
        case "conversionResult":
          setConversionResult(value as WizardState["conversionResult"]);
          break;
      }
    });
  }, []);

  // Navigation handlers
  const goToNextStep = useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setActiveStep(Math.max(0, Math.min(step, 3)));
  }, []);

  // Cutting list management
  const addCuttingItem = useCallback(() => {
    const newItem = {
      id: generateUniqueId(),
      workOrderId: `WO-${Math.floor(Math.random() * 10000)}`,
      color: "Eloksal",
      version: "V1.0",
      size: "40x40",
      profileType: "AL-6063",
      length: 2500,
      quantity: 10,
      cuttingPattern: "Düz",
    };
    setCuttingList((prev) => [
      ...prev,
      {
        ...newItem,
        date: new Date().toISOString().split("T")[0] as string | undefined,
        orderQuantity: newItem.quantity,
        profiles: [
          {
            id: `${newItem.id}-profile`,
            profile: newItem.profileType,
            measurement: `${newItem.length}mm`,
            quantity: newItem.quantity,
          },
        ],
      },
    ]);
  }, []);

  const updateCuttingItem = useCallback(
    (id: string, field: string, value: string | number) => {
      setCuttingList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
    },
    [],
  );

  const deleteCuttingItem = useCallback((id: string) => {
    setCuttingList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCuttingList = useCallback(() => {
    setCuttingList([]);
  }, []);

  // Parameters management
  const updateParams = useCallback((updates: Partial<OptimizationParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateConstraints = useCallback(
    (constraintUpdates: Partial<OptimizationParams["constraints"]>) => {
      setParams((prev) => ({
        ...prev,
        constraints: { ...prev.constraints, ...constraintUpdates },
      }));
    },
    [],
  );

  const updateObjectives = useCallback(
    (objectiveUpdates: OptimizationParams["objectives"]) => {
      setParams((prev) => ({
        ...prev,
        objectives: objectiveUpdates,
      }));
    },
    [],
  );

  // Reset wizard
  const resetWizard = useCallback(() => {
    setActiveStep(0);
    setCuttingList([]);
    setParams(DEFAULT_PARAMS);
    setIsOptimizing(false);
    setOptimizationResult(null);
    setCompareMode(false);
    setSelectedAlgorithms(["genetic"]);
    setShowInfoDialog(false);
    setSelectedCuttingList(null);
    setShowDetailedSelection(false);
    setConversionResult(null);
  }, []);

  // Current state
  const currentState: WizardState = {
    currentStep: activeStep,
    totalSteps: 3,
    cuttingList,
    optimizationParams: params,
    results: optimizationResult ? [optimizationResult] : [],
    isLoading: isOptimizing,
    error: null,
    selectedAlgorithms,
    cuttingLists,
    selectedCuttingList,
    conversionResult,
    // Legacy properties for compatibility
    activeStep,
    optimizationResult,
    params,
  };

  return {
    // State
    state: currentState,

    // State management
    updateState,

    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Cutting list management
    addCuttingItem,
    updateCuttingItem,
    deleteCuttingItem,
    clearCuttingList,

    // Parameters management
    updateParams,
    updateConstraints,
    updateObjectives,

    // Reset
    resetWizard,
  };
};
