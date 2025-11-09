/**
 * @fileoverview TypeScript Interfaces for Enterprise Optimization Wizard
 * @module EnterpriseOptimizationTypes
 * @version 1.0.0
 *
 * Tüm any type'ları kaldırmak için detaylı interface'ler
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface ProfileItem {
  id: string;
  profile: string; // Profil Adı
  measurement: string; // Ölçü (mm)
  quantity: number; // Adet
}

export interface OptimizationItem {
  id: string;
  workOrderId: string;
  profileType: string;
  length: number;
  quantity: number;
  cuttingPattern?: string;
  color: string;
  version: string;
  size: string;
  totalLength?: number;
}

export interface CuttingListItem {
  id: string;
  workOrderId: string; // İş Emri
  date: string; // Tarih
  version: string; // Versiyon
  color: string; // Renk
  orderQuantity: number; // Sipariş Miktarı
  size: string; // Ebat
  profiles: ProfileItem[]; // Profil Listesi
  notes?: string; // Notlar
  priority?: "low" | "medium" | "high"; // Öncelik
  status?: "pending" | "in-progress" | "completed"; // Durum
  // Additional fields for compatibility
  profileType: string;
  length: number;
  quantity: number;
  cuttingPattern?: string;
}

export interface CuttingList {
  id: string;
  name: string;
  description?: string;
  items: CuttingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversionResult {
  success: boolean;
  data?: CuttingListItem[];
  items?: CuttingListItem[];
  error?: string;
}

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  cuttingList: CuttingListItem[];
  optimizationParams: OptimizationParams;
  results: OptimizationResult[];
  isLoading: boolean;
  error: string | null;
  // Additional fields for compatibility
  activeStep: number;
  optimizationResult: OptimizationResult | null;
  cuttingLists: CuttingListData[];
  selectedCuttingList: CuttingListData | null;
  conversionResult: ConversionResult | null;
  selectedAlgorithms: string[];
  params: OptimizationParams;
  isOptimizing?: boolean;
}

export interface CutSegment {
  id: string;
  workOrderId: string;
  profileType: string;
  length: number;
  quantity: number;
  color: string;
  version: string;
  size: string;
  // Additional fields for compatibility
  position?: number;
  endPosition?: number;
}

export interface OptimizationParams {
  algorithm: AlgorithmType;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraints;
  stockLengths: number[];
  unit: "mm" | "cm" | "m";
  maxIterations?: number;
  populationSize?: number;
  mutationRate?: number;
  crossoverRate?: number;
  timeout?: number;
  items?: Array<{
    // Common required fields
    workOrderId: string;
    quantity: number;

    // From DetailedSelectionDialog (optional)
    productId?: string;
    productName?: string;
    workOrderItem?: WorkOrderItem;
    profileId?: string;
    profile?: string; // Profil tipi (DetailedSelectionDialog'dan)
    measurement?: string; // Ölçü (DetailedSelectionDialog'dan)

    // Backward compatibility (optional)
    profileType?: string;
    length?: number;
  }>;
}

export interface OptimizationRequest {
  items: OptimizationItem[];
  stockLengths: number[];
  algorithm: AlgorithmType;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraints;
  unit: "mm" | "cm" | "m";
  maxIterations?: number;
  populationSize?: number;
  mutationRate?: number;
  crossoverRate?: number;
  timeout?: number;
}

export interface OptimizationObjective {
  type:
    | "minimize-waste"
    | "maximize-efficiency"
    | "minimize-cost"
    | "minimize-time"
    | "maximize-quality";
  weight: number; // 0-1 arası ağırlık
  priority: "low" | "medium" | "high";
  target?: number; // Hedef değer
  tolerance?: number; // Tolerans
}

export interface OptimizationConstraints {
  kerfWidth: number; // Kesim genişliği
  startSafety: number; // Başlangıç güvenlik mesafesi
  endSafety: number; // Bitiş güvenlik mesafesi
  minScrapLength: number; // Minimum artık uzunluk
  maxWastePercentage: number; // Maksimum fire yüzdesi
  maxCutsPerStock: number; // Stok başına maksimum kesim sayısı
  maxProcessingTime?: number; // Maksimum işlem süresi (dakika)
  minQualityScore?: number; // Minimum kalite skoru
}

export interface OptimizationResult {
  success: boolean;
  message: string;
  cuts?: Cut[];
  data?: {
    cuttingPlan: CuttingPlan[];
    metrics: OptimizationMetrics;
    statistics: OptimizationStatistics;
    recommendations: OptimizationRecommendation[];
    // Backend response structure
    optimizationResult?: {
      cuts?: Cut[];
      totalLength?: number;
      totalWaste?: number;
      stockCount?: number;
      efficiency?: number;
      wastePercentage?: number;
      totalCost?: number;
      processingTime?: number;
      qualityScore?: number;
      stockUtilization?: number;
      cuttingAccuracy?: number;
      totalSegments?: number;
    };
    performanceMetrics?: Record<string, unknown>;
    costAnalysis?: Record<string, unknown>;
    // ✅ FIX: Add work order information
    workOrders?: {
      ids: string[];
      count: number;
      breakdown: Array<{ workOrderId: string; pieceCount: number }>;
    };
  };
  error?: string;
  executionTime?: number;
  algorithm?: string;
  iterations?: number;
  // Additional properties for compatibility
  efficiency?: number;
  wastePercentage?: number;
  totalCost?: number;
  processingTime?: number;
  qualityScore?: number;
  stockUtilization?: number;
  cuttingAccuracy?: number;
  comparison?: OptimizationComparison[];
  // Additional properties for full compatibility
  totalWaste?: number;
  stockCount?: number;
  confidence?: number;
  executionTimeMs?: number;
  // Backend response structure
  optimizationResult?: {
    cuts?: Cut[];
    totalLength?: number;
    totalWaste?: number;
    stockCount?: number;
    efficiency?: number;
    wastePercentage?: number;
    totalCost?: number;
    processingTime?: number;
    qualityScore?: number;
    stockUtilization?: number;
    cuttingAccuracy?: number;
  };
  performanceMetrics?: Record<string, unknown>;
  costAnalysis?: Record<string, unknown>;
  recommendations?: Record<string, unknown>[];
  // Profile management metadata
  metadata?: {
    profile?: {
      profileId: string;
      profileCode: string;
      profileName: string;
      source: "mapping" | "fallback";
      stockLengths: number[];
    };
    [key: string]: unknown;
  };
}

export interface OptimizationComparison {
  algorithm: string;
  efficiency: number;
  wastePercentage: number;
  totalCost: number;
  processingTime: number;
  qualityScore: number;
}

export interface CuttingPlan {
  stockIndex: number;
  stockLength: number;
  cuts: Cut[];
  waste: number;
  efficiency: number;
  cost: number;
  quality: number;
}

export interface Cut {
  id: string;
  itemId: string;
  length: number;
  position: number;
  workOrderId: string;
  profileType: string;
  color: string;
  version: string;
  size: string;
  cuttingPattern: string;
  quantity: number;
  notes?: string;
  // BackendCut compatibility
  stockLength: number;
  usedLength: number;
  remainingLength: number;
  segmentCount: number;
  segments: CutSegment[];
}

export interface OptimizationMetrics {
  totalWaste: number;
  wastePercentage: number;
  efficiency: number;
  totalCost: number;
  processingTime: number;
  qualityScore: number;
  stockUtilization: number;
  cuttingAccuracy: number;
}

export interface OptimizationStatistics {
  totalItems: number;
  totalLength: number;
  totalPieces: number;
  stockPieces: number;
  cutsCount: number;
  averageCutLength: number;
  longestCut: number;
  shortestCut: number;
  materialSavings: number;
  timeSavings: number;
}

export interface OptimizationRecommendation {
  type: "efficiency" | "cost" | "quality" | "waste" | "time";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  suggestions: string[];
  estimatedSavings?: {
    cost?: number;
    time?: number;
    waste?: number;
    efficiency?: number;
  };
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

// ============================================================================
// SELECTION SYSTEM TYPES
// ============================================================================

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  note?: string;
  orderQuantity: number;
  size: string;
  profiles: ProfileItem[];
}

export interface ProductSection {
  id: string;
  productName: string;
  items: WorkOrderItem[];
}

// Selection state interfaces
export interface ProfileSelection {
  profileId: string;
  profile: string;
  measurement: string;
  quantity: number;
  selected: boolean;
}

export interface WorkOrderSelection {
  workOrderId: string;
  workOrderItem: WorkOrderItem;
  profiles: ProfileSelection[];
  selected: boolean;
  expanded: boolean;
}

export interface ProductSelection {
  productId: string;
  productName: string;
  workOrders: WorkOrderSelection[];
  selected: boolean;
  expanded: boolean;
}

export interface SelectionState {
  products: Record<string, ProductSelection>;
  totalSelectedProfiles: number;
  totalSelectedQuantity: number;
}

export interface CuttingListStepProps {
  cuttingLists: CuttingListData[];
  selectedCuttingList: CuttingListData | null;
  onCuttingListSelect: (list: CuttingListData) => void;
  onAddNewList?: () => void;
  loading?: boolean;
  error?: string;
}

// Import from algorithm entity
import type { AlgorithmMode } from "@/entities/algorithm";

export interface ParametersStepProps {
  params: OptimizationParams;
  onParamsChange: (params: OptimizationParams) => void;
  loading?: boolean;
  algorithmMode?: AlgorithmMode;
  onAlgorithmModeChange?: (mode: AlgorithmMode) => void;
  itemCount?: number;
}

// Re-export for convenience
export type { AlgorithmMode };

export interface PreviewStepProps {
  cuttingList: CuttingListData | null;
  params: OptimizationParams;
  onOptimize: () => void;
  onEditList: () => void;
  onEditParams: () => void;
  loading?: boolean;
  metrics?: PreviewMetrics;
}

export interface ResultsStepProps {
  result: OptimizationResult | null;
  onNewOptimization: () => void;
  onExport: (format: "excel" | "pdf" | "json") => void;
  loading?: boolean;
}

export interface WizardHeaderProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onInfoClick?: () => void;
  onClose?: () => void;
}

export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: StepData[];
  onStepClick?: (step: number) => void;
}

// ============================================================================
// DATA TYPES
// ============================================================================

export interface CuttingListData {
  id: string;
  title: string;
  subtitle: string;
  name?: string; // Backward compatibility
  itemCount: number;
  items?: CuttingListItem[]; // Cutting list items
  workOrderCount: number;
  totalLength: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "completed" | "archived";
  description?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
  weekNumber?: number; // Week number for cutting lists
  sections?: CuttingListSection[]; // Sections within the cutting list
}

export interface CuttingListSection {
  id: string;
  name: string;
  productName?: string; // Backward compatibility
  items: CuttingListItem[];
  totalLength: number;
  itemCount: number;
}

export interface PreviewMetrics {
  totalItems: number;
  totalLength: number;
  totalPieces: number;
  avgLength: number;
  estimatedStock: number;
  stockNeeded: number;
  estimatedWaste: number;
  estimatedTime: number;
  estimatedCost: number;
  algorithmComplexity: "low" | "medium" | "high";
  expectedEfficiency: number;
}

export interface StepData {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  disabled: boolean;
  optional?: boolean;
}

// ============================================================================
// DIALOG TYPES
// ============================================================================

export interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  variant?: "info" | "warning" | "error" | "success";
  actions?: React.ReactNode;
}

export interface SelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: CuttingListItem[]) => void;
  title: string;
  items: CuttingListItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  allowMultiple?: boolean;
  showFilters?: boolean;
  filters?: SelectionFilters;
}

export interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  data: OptimizationResult | null;
  title: string;
  onExport?: (format: "excel" | "pdf") => void;
  onOptimize?: () => void;
  loading?: boolean;
}

export interface ResultsDialogProps {
  open: boolean;
  onClose: () => void;
  result: OptimizationResult;
  title: string;
  onExport: (format: "excel" | "pdf" | "json") => void;
  onNewOptimization: () => void;
  onShare?: () => void;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface SelectionFilters {
  profileTypes: string[];
  colors: string[];
  sizes: string[];
  versions: string[];
  workOrders: string[];
  lengthRange: {
    min: number;
    max: number;
  };
  quantityRange: {
    min: number;
    max: number;
  };
  priority: ("low" | "medium" | "high")[];
  status: ("pending" | "in-progress" | "completed")[];
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CuttingItemFormData {
  workOrderId: string;
  color: string;
  version: string;
  size: string;
  profileType: string;
  length: number;
  quantity: number;
  cuttingPattern: string;
  material?: string;
  finish?: string;
  notes?: string;
  priority: "low" | "medium" | "high";
}

export interface ParameterFormData {
  algorithm: string;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraints;
  stockLengths: number[];
  unit: "mm" | "cm" | "m";
  maxIterations: number;
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  timeout: number;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type CuttingListSelectHandler = (list: CuttingListData) => void;
export type CuttingItemUpdateHandler = (
  id: string,
  field: string,
  value: string | number,
) => void;
export type CuttingItemDeleteHandler = (id: string) => void;
export type ParameterChangeHandler = (params: OptimizationParams) => void;
export type OptimizationStartHandler = () => void;
export type OptimizationCompleteHandler = (result: OptimizationResult) => void;
export type ExportHandler = (format: "excel" | "pdf" | "json") => void;
export type StepChangeHandler = (step: number) => void;
export type DialogCloseHandler = () => void;
export type DialogConfirmHandler = (data?: unknown) => void;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LengthUnit = "mm" | "cm" | "m";
// ALIGNED WITH BACKEND: 5 algorithms available
export type AlgorithmType =
  | "ffd"
  | "bfd"
  | "genetic"
  | "pooling"
  | "pattern-exact";
export type ObjectiveType =
  | "minimize-waste"
  | "maximize-efficiency"
  | "minimize-cost"
  | "minimize-time"
  | "maximize-quality";
export type PriorityLevel = "low" | "medium" | "high";
export type ItemStatus = "pending" | "in-progress" | "completed";
export type ListStatus = "active" | "completed" | "archived";
export type DialogVariant = "info" | "warning" | "error" | "success";
export type ExportFormat = "excel" | "pdf" | "json";
export type ComplexityLevel = "low" | "medium" | "high";
export type ImpactLevel = "low" | "medium" | "high";

export interface AlgorithmInfo {
  readonly value: AlgorithmType;
  readonly label: string;
  readonly description: string;
  readonly speed: number;
  readonly accuracy: number;
}

export interface ObjectiveInfo {
  readonly type: ObjectiveType;
  readonly label: string;
  readonly icon: React.ComponentType;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

export interface CuttingListApiResponse
  extends ApiResponse<CuttingListData[]> {}
export interface OptimizationApiResponse
  extends ApiResponse<OptimizationResult> {}
export interface ExportApiResponse
  extends ApiResponse<{ downloadUrl: string; filename: string }> {}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface FormValidationRules {
  required?: string[];
  minLength?: Record<string, number>;
  maxLength?: Record<string, number>;
  min?: Record<string, number>;
  max?: Record<string, number>;
  pattern?: Record<string, RegExp>;
  custom?: Record<string, (value: unknown) => boolean | string>;
}
// ============================================================================
// PROFILE SELECTION TYPES
// ============================================================================

export interface ProfileSelectionMap {
  readonly [profileType: string]: {
    readonly profileId: string;
    readonly profileCode: string;
    readonly profileName: string;
    readonly stockLengths: readonly number[];
  } | null;
}

// Types file updated
