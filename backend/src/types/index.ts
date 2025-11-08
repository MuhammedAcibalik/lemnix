/**
 * Enterprise Grade Type Definitions for Aluminum Profile Cutting Optimization
 * Version: 2.0.0
 * Last Updated: 2025
 */

// ========== DOMAIN ENUMS ==========

export enum WorkOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  OPTIMIZING = 'optimizing',
  READY_FOR_CUTTING = 'ready_for_cutting',
  IN_PRODUCTION = 'in_production',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

// Dinamik profil tipi - Excel'den gelen string değerler
export type ProfileType = string;

export enum OptimizationAlgorithm {
  FIRST_FIT_DECREASING = 'ffd',
  BEST_FIT_DECREASING = 'bfd',
  GENETIC_ALGORITHM = 'genetic',
  NSGA_II = 'nsga-ii',
  PROFILE_POOLING = 'pooling',
  PATTERN_EXACT = 'pattern-exact'
}

// Alias for backward compatibility
export type AlgorithmType = OptimizationAlgorithm;

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum WasteCategory {
  MINIMAL = 'minimal', // < 50mm
  SMALL = 'small',     // 50-150mm
  MEDIUM = 'medium',   // 150-300mm
  LARGE = 'large',     // 300-500mm
  EXCESSIVE = 'excessive' // > 500mm
}

// ========== CORE DOMAIN MODELS ==========

export interface WorkOrder {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly customerCode?: string;
  readonly orderDate: Date;
  readonly dueDate: Date;
  readonly status: WorkOrderStatus;
  readonly priority: Priority;
  
  // Business Metrics
  readonly totalWaste: number;
  readonly totalWasteValue: number;
  readonly efficiency: number;
  readonly estimatedCost: number;
  readonly actualCost?: number;
  readonly materialCost: number;
  readonly laborCost: number;
  
  // Operational Data
  readonly totalLength: number;
  readonly stockCount: number;
  readonly uniqueProfileTypes: number;
  readonly estimatedProcessingTime: number; // minutes
  readonly actualProcessingTime?: number;
  
  // Metadata
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
  readonly updatedBy?: string;
  readonly version: number;
  readonly notes?: string;
  
  // Relations
  readonly items: WorkOrderItem[];
  readonly cuttingPlans?: CuttingPlan[];
}

export interface WorkOrderItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly itemNumber: number; // Sequential item number within order
  readonly profileType: ProfileType;
  readonly profileDescription?: string;
  readonly length: number; // mm
  readonly quantity: number;
  readonly totalLength: number; // calculated: length * quantity
  readonly unitWeight?: number; // kg per unit
  readonly totalWeight?: number; // calculated: unitWeight * quantity
  readonly unitCost?: number; // cost per unit
  readonly totalCost?: number; // calculated: unitCost * quantity
  readonly materialGrade?: string;
  readonly surfaceFinish?: string;
  readonly tolerance?: number; // +/- mm
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CuttingPlan {
  readonly id: string;
  readonly workOrderId: string;
  readonly planNumber: string; // Human readable plan number
  readonly stockLength: number; // Standard: 6100mm
  readonly algorithm: OptimizationAlgorithm;
  readonly optimizationConstraints: OptimizationConstraints;
  
  // Cutting Data
  readonly cuts: Cut[];
  readonly totalStocksUsed: number;
  readonly totalCutsCount: number;
  readonly averageCutsPerStock: number;
  
  // Waste Analysis
  readonly totalWaste: number;
  readonly wastePercentage: number;
  readonly wasteByCategory: WasteDistribution;
  readonly reclaimableWaste: number;
  
  // Performance Metrics
  readonly efficiency: number;
  readonly materialUtilization: number;
  readonly cuttingComplexity: number;
  readonly estimatedSetupTime: number; // minutes
  readonly estimatedCuttingTime: number; // minutes
  
  // Cost Analysis
  readonly materialCost: number;
  readonly wasteCost: number;
  readonly setupCost: number;
  readonly totalCost: number;
  
  // Quality & Validation
  readonly isValidated: boolean;
  readonly validationErrors: ValidationIssue[];
  readonly qualityScore: number; // 0-100
  
  // Multi-Material Support
  readonly materialResults?: MaterialOptimizationResult[];
  readonly materialTypes: ProfileType[];
  
  // Metadata
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly approvedAt?: Date;
  readonly approvedBy?: string;
  readonly version: number;
  readonly executionTimeMs: number;
}

export interface Cut {
  readonly id: string;
  readonly cuttingPlanId: string;
  readonly stockIndex: number;
  readonly stockId?: string; // Physical stock identifier
  readonly stockLength: number;
  readonly materialType: ProfileType;
  readonly profileType?: ProfileType; // ✅ Frontend uyumluluğu için profileType ekle
  
  // Cutting Segments
  readonly segments: CuttingSegment[];
  readonly segmentCount: number;
  
  // Dimensions & Waste
  readonly usedLength: number;
  readonly remainingLength: number;
  readonly wasteCategory: WasteCategory;
  readonly isReclaimable: boolean;
  
  // Manufacturing Data
  readonly estimatedCuttingTime: number; // minutes
  readonly setupTime: number; // minutes
  readonly kerfLoss: number; // Total kerf width loss
  readonly safetyMargin: number; // Total safety margins
  
  // Quality Control
  readonly toleranceCheck: boolean;
  readonly qualityNotes?: string;
  
  // Operational
  readonly sequence: number; // Order of cutting
  readonly machineId?: string;
  
  // Pooling-specific fields
  readonly workOrderBreakdown?: Array<{ workOrderId: string | number; count: number }>;
  readonly isMixed?: boolean;
  readonly poolKey?: string;
  readonly operatorId?: string;
  readonly actualCuttingTime?: number;
  readonly completedAt?: Date;
  
  // ✅ Cutting Plan Data (additive fields)
  readonly plan?: Array<{ length: number; count: number; profile?: string; itemId?: string }>;
  readonly planLabel?: string; // e.g., "7 × 992 mm" or "4 × 992 mm + 3 × 687 mm"
}

export interface CuttingSegment {
  readonly id: string;
  readonly cutId: string;
  readonly sequenceNumber: number; // Order within the cut
  readonly profileType: ProfileType;
  readonly length: number;
  readonly quantity: number;
  readonly position: number; // Position from stock start
  readonly endPosition: number; // Calculated end position
  
  // Manufacturing Specifications
  readonly tolerance: number; // +/- mm
  readonly surfaceFinish?: string;
  readonly specialInstructions?: string;
  
  // Traceability
  readonly workOrderItemId: string;
  readonly originalLength: number; // Original requested length
  readonly actualLength?: number; // Measured after cutting
  readonly qualityCheck: boolean;
  
  // Cost Allocation
  readonly unitCost: number;
  readonly totalCost: number;
  
  // Direct fields for cutting list integration
  readonly workOrderId?: string;
  readonly productName?: string;
  readonly color?: string;
  readonly size?: string;
  readonly note?: string;
  readonly version?: string;
  readonly date?: string;
  
  // Excel Metadata
  readonly metadata?: {
    readonly color?: string;
    readonly note?: string;
    readonly size?: string;
    readonly date?: string;
    readonly version?: string;
    readonly sipQuantity?: number;
    readonly workOrderId?: string;
  };
}

// ========== OPTIMIZATION INTERFACES ==========

export interface OptimizationItem {
  readonly profileType: ProfileType;
  readonly length: number;
  readonly quantity: number;
  readonly totalLength: number;
  readonly originalIndex?: number; // Benzersiz index
  readonly priority?: Priority;
  readonly tolerance?: number;
  readonly minLength?: number; // After tolerance consideration
  readonly maxLength?: number; // After tolerance consideration
  readonly weight?: number; // For handling considerations
  readonly materialGrade?: string;
  // Direct fields for cutting list integration
  readonly workOrderId?: string;
  readonly productName?: string;
  readonly color?: string;
  readonly size?: string;
  readonly note?: string;
  readonly version?: string;
  readonly date?: string;
  // Excel Metadata
  readonly metadata?: {
    readonly color?: string;
    readonly note?: string;
    readonly size?: string;
    readonly date?: string;
    readonly version?: string;
    readonly sipQuantity?: number;
    readonly workOrderId?: string;
  };
}

export interface OptimizationConstraints {
  readonly maxCutsPerStock?: number; // Default: 50
  readonly minScrapLength?: number; // Default: 75mm
  readonly kerfWidth?: number; // Default: 3.5mm
  readonly safetyMargin?: number; // Default: 2mm
  readonly allowPartialStocks?: boolean;
  readonly prioritizeSmallWaste?: boolean;
  readonly maxWastePercentage?: number;
  readonly reclaimWasteOnly?: boolean;
  readonly balanceComplexity?: boolean; // Balance cuts across stocks
  readonly respectMaterialGrades?: boolean;
  readonly optimizeSetupTime?: boolean;
}

export interface OptimizationResult {
  cuts: Cut[];
  totalWaste: number;
  efficiency: number;
  stockCount: number;
  totalSegments: number; // ✅ Contract fix: totalSegments field added
  wastePercentage: number;
  averageCutsPerStock: number;
  totalLength: number;
  setupTime: number;
  materialUtilization: number;
  cuttingComplexity: number;
  cuttingTime: number;
  totalTime: number;
  materialCost: number;
  wasteCost: number;
  laborCost: number;
  totalCost: number;
  costPerMeter: number;
  qualityScore: number;
  reclaimableWastePercentage: number;
  algorithm: OptimizationAlgorithm;
  executionTimeMs: number;
  wasteDistribution: WasteDistribution;
  constraints: OptimizationConstraints;
  recommendations: OptimizationRecommendation[];
  // New fields based on real-world analysis
  efficiencyCategory: 'excellent' | 'good' | 'average' | 'poor';
  detailedWasteAnalysis: {
    minimal: number;    // < 50mm
    small: number;      // 50-150mm
    medium: number;     // 150-300mm
    large: number;      // 300-500mm
    excessive: number;  // > 500mm
    totalPieces: number;
    averageWaste: number;
  };
  optimizationScore: number; // 0-100 score based on efficiency and waste
  // Multi-Material Results
  materialResults?: MaterialOptimizationResult[];
  crossMaterialOptimization?: boolean;
}

export interface MaterialOptimizationResult {
  readonly profileType: ProfileType;
  readonly stockLength: number;
  readonly cuts: Cut[];
  readonly stockCount: number;
  
  // Material-Specific Metrics
  readonly totalWaste: number;
  readonly wasteValue: number;
  readonly efficiency: number;
  readonly utilization: number;
  readonly materialCost: number;
  
  // Quality & Performance
  readonly averageComplexity: number;
  readonly setupTime: number;
  readonly cuttingTime: number;
  readonly qualityScore: number;
  
  // Recommendations
  readonly recommendations: string[];
  readonly alternativeStockLengths?: number[];
}

export interface MaterialStockLength {
  readonly profileType: ProfileType;
  readonly stockLength: number;
  readonly availability: number; // Available stock count
  readonly costPerMm: number;
  readonly costPerStock: number;
  readonly leadTime?: number; // Days
  readonly supplier?: string;
  readonly materialGrade: string;
  readonly weight: number; // kg per stock
  readonly maxHandlingLength?: number; // For safety
}

// ========== ANALYSIS & REPORTING ==========

export interface WasteDistribution {
  readonly minimal: number; // < 50mm
  readonly small: number;   // 50-150mm
  readonly medium: number;  // 150-300mm
  readonly large: number;   // 300-500mm
  readonly excessive: number; // > 500mm
  readonly reclaimable: number;
  readonly totalPieces: number;
}

export interface DetailedWasteAnalysis {
  readonly minimal: number;
  readonly small: number;
  readonly medium: number;
  readonly large: number;
  readonly excessive: number;
  readonly totalPieces: number;
  readonly averageWaste: number;
}

export interface OptimizationRecommendation {
  readonly type: 'efficiency' | 'cost' | 'quality' | 'setup' | 'waste';
  readonly severity: 'info' | 'warning' | 'critical';
  readonly message: string;
  readonly impact: string;
  readonly suggestion: string;
  readonly potentialSavings?: number; // Cost savings
  readonly implementationEffort: 'low' | 'medium' | 'high';
}

export interface ValidationIssue {
  readonly type: 'error' | 'warning' | 'info';
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly value?: unknown;
  readonly suggestion?: string;
  readonly severity: number; // 1-10
}

export interface OptimizationMetrics {
  readonly stockCount: number;
  readonly totalLength: number;
  readonly usedLength: number;
  readonly wasteLength: number;
  readonly averageWastePerStock: number;
  readonly efficiency: number;
  readonly materialUtilization: number;
  readonly algorithm: OptimizationAlgorithm;
  readonly processingTimeMs: number;
  readonly memoryUsageMB?: number;
  readonly iterationsCount?: number;
  readonly convergenceRate?: number;
}

// ========== API INTERFACES ==========

export interface CreateWorkOrderRequest {
  readonly orderNumber: string;
  readonly customerName: string;
  readonly customerCode?: string;
  readonly dueDate: string; // ISO date string
  readonly priority: Priority;
  readonly notes?: string;
  readonly items: CreateWorkOrderItemRequest[];
}

export interface CreateWorkOrderItemRequest {
  readonly profileType: ProfileType;
  readonly length: number;
  readonly quantity: number;
  readonly tolerance?: number;
  readonly materialGrade?: string;
  readonly surfaceFinish?: string;
  readonly notes?: string;
}

export interface OptimizeRequest {
  readonly workOrderId: string;
  readonly algorithm: string;
  readonly stockLength?: number;
  readonly materialStockLengths?: MaterialStockLength[];
  readonly constraints?: Partial<OptimizationConstraints>;
  readonly priority: Priority;
  readonly generateAlternatives?: boolean;
  readonly maxAlternatives?: number;
  readonly maxCuts?: number;
  readonly items?: OptimizationItem[]; // Frontend'den gelen OptimizationItem'lar
}

export interface OptimizeResponse {
  readonly success: boolean;
  readonly cuttingPlan: CuttingPlan;
  readonly metrics: OptimizationMetrics;
  readonly recommendations: OptimizationRecommendation[];
  readonly alternatives?: OptimizationResult[];
  readonly executionTimeMs: number;
  readonly warnings?: string[];
}

export interface OptimizationComparisonRequest {
  readonly workOrderId: string;
  readonly algorithms: string[];
  readonly constraints?: Partial<OptimizationConstraints>;
}

export interface OptimizationComparison {
  readonly workOrderId: string;
  readonly results: Array<{
    readonly algorithm: string;
    readonly result: OptimizationResult;
    readonly rank: number;
    readonly score: number;
  }>;
  readonly recommendation: string;
  readonly summary: string;
}

// ========== ERROR HANDLING ==========

export class OptimizationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details: Record<string, unknown> = {},
    public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    this.name = 'OptimizationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: ValidationIssue[] = [],
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class BusinessRuleError extends Error {
  constructor(
    message: string,
    public readonly rule: string,
    public readonly context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly statusCode: number;
  readonly details: Record<string, unknown>;
  readonly timestamp: Date;
  readonly requestId: string;
  readonly stack?: string;
}

// ========== UTILITY TYPES ==========

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder: 'asc' | 'desc';
  readonly filters?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrevious: boolean;
  };
  readonly metadata?: Record<string, unknown>;
}

export interface SearchParams {
  readonly query?: string;
  readonly filters: Record<string, unknown>;
  readonly dateRange?: {
    readonly from: Date;
    readonly to: Date;
  };
  readonly pagination: PaginationParams;
}

// ========== CONFIGURATION ==========

export interface OptimizationConfig {
  readonly defaultAlgorithm: OptimizationAlgorithm;
  readonly defaultStockLength: number;
  readonly defaultConstraints: OptimizationConstraints;
  readonly performanceThresholds: {
    readonly maxExecutionTimeMs: number;
    readonly minEfficiency: number;
    readonly maxWastePercentage: number;
  };
  readonly qualityThresholds: {
    readonly minQualityScore: number;
    readonly maxComplexity: number;
    readonly maxSetupTime: number;
  };
  readonly costParameters: {
    readonly laborCostPerMinute: number;
    readonly setupCostPerStock: number;
    readonly wasteCostMultiplier: number;
  };
}

export interface SystemHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly version: string;
  readonly uptime: number;
  readonly performance: {
    readonly averageOptimizationTime: number;
    readonly throughput: number; // optimizations per hour
    readonly errorRate: number; // percentage
  };
  readonly resources: {
    readonly cpuUsage: number;
    readonly memoryUsage: number;
    readonly diskUsage: number;
  };
  readonly lastCheck: Date;
}

// ========== TYPE GUARDS ==========

export const isWorkOrderStatus = (value: string): value is WorkOrderStatus => {
  return Object.values(WorkOrderStatus).includes(value as WorkOrderStatus);
};

export const isProfileType = (value: string): value is ProfileType => {
  // Dinamik profil tipi kontrolü - Excel'den gelen herhangi bir string geçerli
  // Kullanıcı Excel'de hangi profil adını kullanırsa o geçerli bir profil tipidir
  return typeof value === 'string' && value.trim().length > 0;
};

export const isOptimizationAlgorithm = (value: string): value is OptimizationAlgorithm => {
  return Object.values(OptimizationAlgorithm).includes(value as OptimizationAlgorithm);
};

export const isPriority = (value: string): value is Priority => {
  return Object.values(Priority).includes(value as Priority);
};

// ========== CONSTANTS ==========

export const MANUFACTURING_CONSTANTS = {
  DEFAULT_STOCK_LENGTH: 6100, // mm
  MIN_STOCK_LENGTH: 500, // mm
  MAX_STOCK_LENGTH: 20000, // mm
  DEFAULT_KERF_WIDTH: 3.5, // mm
  DEFAULT_SAFETY_MARGIN: 2, // mm
  MIN_SCRAP_LENGTH: 75, // mm
  MAX_CUTS_PER_STOCK: 50,
  MIN_CUT_LENGTH: 10, // mm
  QUALITY_SCORE_WEIGHTS: {
    efficiency: 0.35,
    wasteReduction: 0.25,
    complexity: 0.20,
    setupTime: 0.20
  }
} as const;

export const COST_PARAMETERS = {
  SETUP_COST_PER_STOCK: 5, // currency units
  LABOR_COST_PER_MINUTE: 0.5, // currency units
  WASTE_COST_MULTIPLIER: 1.2, // material cost * multiplier
  QUALITY_BONUS_MULTIPLIER: 0.95 // Cost reduction for high quality
} as const;

// Branch and Bound Node interface
export interface BnBNode {
  items: OptimizationItem[];
  cuts: Cut[];
  currentCut: Cut | null;
  depth: number;
  lowerBound: number;
  upperBound: number;
}

// ========== PROFILE MANAGEMENT TYPES ==========

/**
 * Profile definition with associated stock lengths
 */
export interface ProfileDefinition {
  readonly id: string;
  readonly profileCode: string;
  readonly profileName: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly stockLengths: ProfileStockLength[];
}

/**
 * Stock length configuration for a profile
 */
export interface ProfileStockLength {
  readonly id: string;
  readonly profileId: string;
  readonly stockLength: number; // mm
  readonly isDefault: boolean;
  readonly priority: number; // Lower number = higher priority
  readonly createdAt: Date;
}

/**
 * Mapping between work order, profile type, and profile definition
 */
export interface WorkOrderProfileMapping {
  readonly id: string;
  readonly workOrderId: string;
  readonly profileType: string; // e.g., "Kapalı alt", "Açık üst"
  readonly profileId: string;
  readonly weekNumber: number;
  readonly year: number;
  readonly uploadedBy?: string;
  readonly createdAt: Date;
  readonly profile?: ProfileDefinition; // Populated with relation
}

/**
 * Profile mapping for optimization context
 */
export interface ProfileMapping {
  readonly profileCode: string;
  readonly profileName: string;
  readonly stockLengths: readonly number[];
  readonly defaultStockLength: number;
}

/**
 * Excel row data for profile management upload
 */
export interface ProfileManagementExcelRow {
  readonly profileCode: string;
  readonly profileName: string;
  readonly workOrderId: string;
  readonly profileType: string;
  readonly stockLength1: number;
  readonly stockLength2?: number;
  readonly stockLength3?: number;
  readonly defaultStock?: number; // 1, 2, or 3
}

/**
 * Parse result for profile management Excel
 */
export interface ProfileManagementParseResult {
  readonly success: boolean;
  readonly data?: ProfileManagementData;
  readonly errors?: string[];
  readonly summary?: {
    readonly totalRows: number;
    readonly validRows: number;
    readonly invalidRows: number;
    readonly weekNumber: number;
    readonly year: number;
    readonly uniqueProfiles: number;
    readonly uniqueMappings: number;
  };
}

/**
 * Structured data from profile management Excel
 */
export interface ProfileManagementData {
  readonly profiles: Map<string, ProfileDefinitionInput>; // profileCode → definition
  readonly mappings: WorkOrderProfileMappingInput[];
  readonly weekNumber: number;
  readonly year: number;
}

/**
 * Input for creating profile definition
 */
export interface ProfileDefinitionInput {
  readonly profileCode: string;
  readonly profileName: string;
  readonly stockLengths: ProfileStockLengthInput[];
}

/**
 * Input for creating profile stock length
 */
export interface ProfileStockLengthInput {
  readonly stockLength: number;
  readonly isDefault: boolean;
  readonly priority: number;
}

/**
 * Input for creating work order profile mapping
 */
export interface WorkOrderProfileMappingInput {
  readonly workOrderId: string;
  readonly profileType: string;
  readonly profileCode: string; // Will be resolved to profileId
  readonly weekNumber: number;
  readonly year: number;
  readonly uploadedBy?: string;
}