/**
 * @fileoverview Type definitions for Optimization Info Dialog
 * @module OptimizationInfoDialogTypes
 * @version 1.0.0
 */

import React from 'react';

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

export interface OptimizationInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// TRAINING MODULE TYPES
// ============================================================================

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: TrainingStep[];
  points: number;
  prerequisites?: string[];
  certification?: boolean;
  skills?: string[];
}

export interface TrainingStep {
  id: string;
  title: string;
  description: string;
  type: 'instruction' | 'interactive' | 'assessment';
  interactive?: boolean;
  validation?: string;
  points: number;
  duration?: number;
  hints?: string[];
  instructions?: string[];
}

// ============================================================================
// ALGORITHM TYPES
// ============================================================================

export interface Algorithm {
  id: string;
  name: string;
  turkishName: string;
  description: string;
  complexity: string;
  efficiency: string;
  speed: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  icon: React.ReactNode;
}

// ============================================================================
// FEATURE AND PARAMETER TYPES
// ============================================================================

export interface Feature {
  title: string;
  description: string;
  default: string;
  impact: string;
}

export interface OptimizationStep {
  label: string;
  description: string;
}

export interface Metric {
  name: string;
  formula: string;
  unit: string;
}

// ============================================================================
// TRAINING SIMULATION TYPES
// ============================================================================

export type TrainingMode = 'beginner' | 'intermediate' | 'advanced';

export type TrainingTab = 'overview' | 'safety' | 'machine' | 'cutting' | 'assessment';

export interface OperatorProfile {
  name: string;
  experience: number;
  certifications: string[];
  performance: {
    speed: number;
    accuracy: number;
    safety: number;
    efficiency: number;
  };
}

export interface WorkshopState {
  machineOn: boolean;
  safetyGearOn: boolean;
  materialLoaded: boolean;
  cuttingInProgress: boolean;
  currentMaterial: string | null;
  machineSettings: {
    bladeSpeed: number;
    cuttingDepth: number;
    feedRate: number;
    coolantFlow: number;
  };
}

export interface TrainingData {
  module: TrainingModule | null;
  currentModule: number;
  currentStep: number;
  progress: number;
  score: number;
  safetyViolations: number;
  instruction: string;
  showHint: boolean;
}

// ============================================================================
// TAB PANEL TYPES
// ============================================================================

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface OverviewTabProps {
  algorithms: Algorithm[];
  features: Feature[];
  metrics: Metric[];
  optimizationSteps: OptimizationStep[];
}

export interface AlgorithmsTabProps {
  algorithms: Algorithm[];
  expandedAlgorithm: string | false;
  onAlgorithmExpand: (algorithm: string | false) => void;
}

export interface ParametersTabProps {
  features: Feature[];
}

export interface StepsTabProps {
  optimizationSteps: OptimizationStep[];
}

export interface MetricsTabProps {
  metrics: Metric[];
}

export interface SimulationTabProps {
  trainingMode: TrainingMode;
  onTrainingModeChange: (mode: TrainingMode) => void;
  isTrainingActive: boolean;
  onStartTraining: () => void;
  onStopTraining: () => void;
  onResetTraining: () => void;
  operatorProfile: OperatorProfile;
  trainingModules: Record<TrainingMode, TrainingModule[]>;
  currentModule: number;
  onStartModule: (module: TrainingModule) => void;
  activeTab: TrainingTab;
  onActiveTabChange: (tab: TrainingTab) => void;
}

export interface TrainingOverviewProps {
  trainingMode: TrainingMode;
  onTrainingModeChange: (mode: TrainingMode) => void;
  isTrainingActive: boolean;
  onStartTraining: () => void;
  onStopTraining: () => void;
  onResetTraining: () => void;
  operatorProfile: OperatorProfile;
  trainingModules: Record<TrainingMode, TrainingModule[]>;
  currentModule: number;
  onStartModule: (module: TrainingModule) => void;
}

export interface SafetyTabProps {
  workshopState: WorkshopState;
  onWorkshopStateChange: (state: Partial<WorkshopState>) => void;
}

export interface MachineTabProps {
  workshopState: WorkshopState;
  onWorkshopStateChange: (state: Partial<WorkshopState>) => void;
}

export interface CuttingTabProps {
  workshopState: WorkshopState;
  onWorkshopStateChange: (state: Partial<WorkshopState>) => void;
}

export interface AssessmentTabProps {
  operatorScore: number;
  safetyViolations: number;
  trainingProgress: number;
  operatorProfile: OperatorProfile;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface DialogState {
  tabValue: number;
  expandedAlgorithm: string | false;
  trainingMode: TrainingMode;
  currentModule: number;
  currentStep: number;
  isTrainingActive: boolean;
  trainingProgress: number;
  operatorScore: number;
  safetyViolations: number;
  currentInstruction: string;
  showHint: boolean;
  trainingData: TrainingModule | null;
  activeTab: TrainingTab;
  operatorProfile: OperatorProfile;
  workshopState: WorkshopState;
}

export interface DialogHandlers {
  onClose: () => void;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onAlgorithmExpand: (algorithm: string | false) => void;
  onTrainingModeChange: (mode: TrainingMode) => void;
  onStartTraining: () => void;
  onStopTraining: () => void;
  onResetTraining: () => void;
  onStartModule: (module: TrainingModule) => void;
  onStartStep: (step: TrainingStep) => void;
  onValidateStep: (step: TrainingStep, userAction: Record<string, unknown>) => void;
  onCompleteModule: (module: TrainingModule) => void;
  onWorkshopStateChange: (state: Partial<WorkshopState>) => void;
  onActiveTabChange: (tab: TrainingTab) => void;
}

// ============================================================================
// TRAINING MODULE DATA TYPES
// ============================================================================

export interface TrainingModulesData {
  beginner: TrainingModule[];
  intermediate: TrainingModule[];
  advanced: TrainingModule[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  points: number;
}

export interface UserAction {
  safetyGearOn?: boolean;
  ppeComplete?: boolean;
  workspaceClean?: boolean;
  emergencyClear?: boolean;
  componentsIdentified?: number;
  controlsCorrect?: number;
  [key: string]: unknown;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export interface AnimationState {
  ref: React.MutableRefObject<number | null>;
  isActive: boolean;
  duration: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface TrainingLevelInfo {
  title: string;
  description: string;
  color: string;
  icon: string;
}

export interface TrainingLevelInfoMap {
  [key: string]: TrainingLevelInfo;
}

// ============================================================================
// DIALOG CONFIGURATION TYPES
// ============================================================================

export interface DialogConfig {
  maxWidth: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth: boolean;
  zIndex: number;
  minHeight: string;
  borderRadius: number;
}

// ============================================================================
// STYLING TYPES
// ============================================================================

export interface DialogStyles {
  paper: Record<string, unknown>;
  title: Record<string, unknown>;
  content: Record<string, unknown>;
  actions: Record<string, unknown>;
  tabs: Record<string, unknown>;
  tabPanel: Record<string, unknown>;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type TabChangeHandler = (event: React.SyntheticEvent, newValue: number) => void;

export type AlgorithmExpandHandler = (algorithm: string | false) => void;

export type TrainingModeChangeHandler = (mode: TrainingMode) => void;

export type TrainingActionHandler = () => void;

export type ModuleStartHandler = (module: TrainingModule) => void;

export type StepStartHandler = (step: TrainingStep) => void;

export type StepValidateHandler = (step: TrainingStep, userAction: UserAction) => ValidationResult;

export type ModuleCompleteHandler = (module: TrainingModule) => void;

export type WorkshopStateChangeHandler = (state: Partial<WorkshopState>) => void;

export type ActiveTabChangeHandler = (tab: TrainingTab) => void;

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  speed: number;
  accuracy: number;
  safety: number;
  efficiency: number;
}

export interface TrainingProgress {
  current: number;
  total: number;
  percentage: number;
  completed: boolean;
}

// ============================================================================
// CERTIFICATION TYPES
// ============================================================================

export interface Certification {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  validity: number; // days
  issued: Date;
  expires: Date;
}

// ============================================================================
// ACHIEVEMENT TYPES
// ============================================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  condition: (profile: OperatorProfile, metrics: PerformanceMetrics) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
}

// ============================================================================
// SIMULATION TYPES
// ============================================================================

export interface SimulationState {
  isRunning: boolean;
  speed: number;
  paused: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface SimulationConfig {
  defaultSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  autoAdvance: boolean;
  showHints: boolean;
}
