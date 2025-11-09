/**
 * @fileoverview Custom hook for managing dialog state
 * @module useDialogState
 * @version 1.0.0
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  DialogState,
  DialogHandlers,
  OptimizationInfoDialogProps,
  TrainingMode,
  TrainingTab,
  OperatorProfile,
  WorkshopState,
  TrainingModule,
  TrainingStep,
  UserAction,
  ValidationResult,
} from "../types";

/**
 * Custom hook for managing dialog state
 */
export const useDialogState = ({ onClose }: OptimizationInfoDialogProps) => {
  // Animation ref
  const animationRef = useRef<number | null>(null);

  // Dialog state
  const [tabValue, setTabValue] = useState(0);
  const [expandedAlgorithm, setExpandedAlgorithm] = useState<string | false>(
    false,
  );

  // Training simulation state
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("beginner");
  const [currentModule, setCurrentModule] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [operatorScore, setOperatorScore] = useState(0);
  const [safetyViolations, setSafetyViolations] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [trainingData, setTrainingData] = useState<TrainingModule | null>(null);
  const [activeTab, setActiveTab] = useState<TrainingTab>("overview");

  // Operator profile state
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile>({
    name: "Operatör",
    experience: 0,
    certifications: [],
    performance: {
      speed: 0,
      accuracy: 0,
      safety: 100,
      efficiency: 0,
    },
  });

  // Workshop state
  const [workshopState, setWorkshopState] = useState<WorkshopState>({
    machineOn: false,
    safetyGearOn: false,
    materialLoaded: false,
    cuttingInProgress: false,
    currentMaterial: null,
    machineSettings: {
      bladeSpeed: 0,
      cuttingDepth: 0,
      feedRate: 0,
      coolantFlow: 0,
    },
  });

  // Handlers
  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    [],
  );

  const handleAlgorithmExpand = useCallback((algorithm: string | false) => {
    setExpandedAlgorithm(algorithm);
  }, []);

  const handleTrainingModeChange = useCallback((mode: TrainingMode) => {
    setTrainingMode(mode);
  }, []);

  const handleWorkshopStateChange = useCallback(
    (state: Partial<WorkshopState>) => {
      setWorkshopState((prev) => ({ ...prev, ...state }));
    },
    [],
  );

  const handleActiveTabChange = useCallback((tab: TrainingTab) => {
    setActiveTab(tab);
  }, []);

  // Training functions
  const startTraining = useCallback(() => {
    setIsTrainingActive(true);
    setCurrentModule(0);
    setCurrentStep(0);
    setTrainingProgress(0);
    setOperatorScore(0);
    setSafetyViolations(0);
    setCurrentInstruction("");
    setShowHint(false);
    setActiveTab("overview");
    setTrainingData(null);
  }, []);

  const stopTraining = useCallback(() => {
    setIsTrainingActive(false);
    if (animationRef.current) {
      window.clearTimeout(animationRef.current);
    }
    setCurrentInstruction("Eğitim durduruldu");
  }, []);

  const resetTraining = useCallback(() => {
    stopTraining();
    setCurrentModule(0);
    setCurrentStep(0);
    setTrainingProgress(0);
    setOperatorScore(0);
    setSafetyViolations(0);
    setCurrentInstruction("");
    setShowHint(false);
    setTrainingData(null);
    setActiveTab("overview");
    setWorkshopState({
      machineOn: false,
      safetyGearOn: false,
      materialLoaded: false,
      cuttingInProgress: false,
      currentMaterial: null,
      machineSettings: {
        bladeSpeed: 0,
        cuttingDepth: 0,
        feedRate: 0,
        coolantFlow: 0,
      },
    });
  }, [stopTraining]);

  const startModule = useCallback((module: TrainingModule) => {
    setCurrentInstruction(module.description);
    setTrainingData(module);
    setCurrentStep(0);
    setActiveTab("safety");
  }, []);

  const startStep = useCallback((step: TrainingStep) => {
    setCurrentInstruction(step.description);
    setShowHint(false);

    if (step.interactive) {
      setActiveTab("machine");
    } else {
      setActiveTab("assessment");
    }
  }, []);

  const validateStep = useCallback(
    (step: TrainingStep, userAction: UserAction): ValidationResult => {
      let isValid = false;
      let points = 0;

      switch (step.validation) {
        case "safety-gear-check":
          isValid = Boolean(userAction.safetyGearOn && userAction.ppeComplete);
          points = isValid ? step.points : 0;
          break;
        case "workspace-inspection":
          isValid = Boolean(
            userAction.workspaceClean && userAction.emergencyClear,
          );
          points = isValid ? step.points : 0;
          break;
        case "component-identification":
          isValid = Number(userAction.componentsIdentified) >= 0.8;
          points = isValid
            ? step.points
            : Math.floor(step.points * Number(userAction.componentsIdentified));
          break;
        case "control-operation":
          isValid = Number(userAction.controlsCorrect) >= 0.9;
          points = isValid
            ? step.points
            : Math.floor(step.points * Number(userAction.controlsCorrect));
          break;
        default:
          isValid = false;
          points = 0;
      }

      if (isValid) {
        setOperatorScore((prev) => prev + points);
        setTrainingProgress((prev) => prev + 100 / getTotalSteps());
        setCurrentInstruction(
          `✅ ${step.title} başarıyla tamamlandı! +${points} puan`,
        );
      } else {
        setSafetyViolations((prev) => prev + 1);
        setCurrentInstruction(
          `❌ ${step.title} tekrar edilmeli. Güvenlik kurallarına dikkat edin.`,
        );
      }

      return { isValid, points };
    },
    [],
  );

  const getTotalSteps = useCallback(() => {
    // This would need access to training modules data
    // For now, return a default value
    return 10;
  }, []);

  const completeModule = useCallback(
    (module: TrainingModule) => {
      setOperatorScore((prev) => prev + module.points);
      setCurrentInstruction(
        `🎉 ${module.title} modülü tamamlandı! +${module.points} puan`,
      );

      // Sertifika kontrolü
      if (module.points >= module.points * 0.8) {
        setOperatorProfile((prev) => ({
          ...prev,
          certifications: [
            ...prev.certifications,
            `${module.title} Sertifikası`,
          ],
        }));
      }

      setTimeout(() => {
        // Module completion logic would go here
        setCurrentInstruction(
          `🏆 ${trainingMode} seviye eğitimi tamamlandı! Toplam puan: ${operatorScore + module.points}`,
        );
        setActiveTab("assessment");
      }, 3000);
    },
    [trainingMode, operatorScore],
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        window.clearTimeout(animationRef.current);
      }
    };
  }, []);

  // State object
  const state: DialogState = {
    tabValue,
    expandedAlgorithm,
    trainingMode,
    currentModule,
    currentStep,
    isTrainingActive,
    trainingProgress,
    operatorScore,
    safetyViolations,
    currentInstruction,
    showHint,
    trainingData,
    activeTab,
    operatorProfile,
    workshopState,
  };

  // Handlers object
  const handlers: DialogHandlers = {
    onClose,
    onTabChange: handleTabChange,
    onAlgorithmExpand: handleAlgorithmExpand,
    onTrainingModeChange: handleTrainingModeChange,
    onStartTraining: startTraining,
    onStopTraining: stopTraining,
    onResetTraining: resetTraining,
    onStartModule: startModule,
    onStartStep: startStep,
    onValidateStep: validateStep,
    onCompleteModule: completeModule,
    onWorkshopStateChange: handleWorkshopStateChange,
    onActiveTabChange: handleActiveTabChange,
  };

  return {
    // State
    ...state,

    // Setters
    setTabValue,
    setExpandedAlgorithm,
    setTrainingMode,
    setCurrentModule,
    setCurrentStep,
    setIsTrainingActive,
    setTrainingProgress,
    setOperatorScore,
    setSafetyViolations,
    setCurrentInstruction,
    setShowHint,
    setTrainingData,
    setActiveTab,
    setOperatorProfile,
    setWorkshopState,

    // Handlers
    ...handlers,

    // Animation ref
    animationRef,
  };
};
