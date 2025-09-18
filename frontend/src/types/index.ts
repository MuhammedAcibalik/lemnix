// Backend'den gelen yeni veri tipleri
export interface ProfileItem {
  readonly profileType: string;      // Profil tipi (KAPALI ALT, AÇIK ALT, vs.)
  readonly measurement: string;      // Ölçü
  readonly quantity: number;         // Parça miktarı
  readonly rowIndex: number;
  readonly confidence: number;
}

export interface WorkOrderMetadata {
  readonly date?: string;
  readonly version?: string;
  readonly color?: string;
  readonly note?: string;
  readonly sipQuantity?: number;
  readonly size?: string;
}

export interface WorkOrderItem {
  readonly workOrderId: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly totalQuantity: number;
  readonly metadata: WorkOrderMetadata;
  readonly confidence: number;
  readonly rowIndex: number;
}

export interface ProductGroup {
  readonly productName: string;
  readonly workOrders: ReadonlyArray<WorkOrderItem>;
  readonly totalProfiles: number;
  readonly totalQuantity: number;
  readonly profileTypes: ReadonlyArray<string>;
  readonly confidence: number;
  readonly startRow: number;
  readonly endRow: number;
}

export interface ExcelParseResult {
  readonly productGroups: ReadonlyArray<ProductGroup>;
  readonly summary: {
    readonly totalProducts: number;
    readonly totalWorkOrders: number;
    readonly totalProfiles: number;
    readonly totalQuantity: number;
    readonly parseTimeMs: number;
    readonly memoryUsedMb: number;
    readonly confidence: number;
    readonly skippedRows: number;
    readonly processedRows: number;
  };
}

// Eski WorkOrder interface (compatibility için)
export interface WorkOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: Date;
  dueDate: Date;
  status: 'pending' | 'processing' | 'completed';
  totalWaste: number;
  efficiency: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuttingPlan {
  id: string;
  workOrderId: string;
  stockLength: number;
  cuts: Cut[];
  waste: number;
  efficiency: number;
  createdAt: Date;
}

export interface Cut {
  id: string;
  cuttingPlanId: string;
  stockIndex: number;
  stockLength: number;
  materialType: string;
  segments: CuttingSegment[];
  segmentCount: number;
  usedLength: number;
  remainingLength: number;
  wasteCategory: string;
  isReclaimable: boolean;
  estimatedCuttingTime: number;
  setupTime: number;
  kerfLoss: number;
  safetyMargin: number;
  toleranceCheck: boolean;
  sequence: number;
}

export interface CuttingSegment {
  id: string;
  cutId: string;
  profileType: string;
  length: number;
  quantity: number;
  position: number;
  endPosition: number;
  sequenceNumber: number;
  qualityCheck: boolean;
  tolerance: number;
  workOrderItemId: string;
  originalLength: number;
  unitCost: number;
  totalCost: number;
  // OptimizationItem bilgileri
  workOrderId?: string;
  productName?: string;
  color?: string;
  size?: string;
  note?: string;
  version?: string;
  date?: string;
}

// Malzeme bazlı optimizasyon için yeni types
export interface MaterialStockLength {
  profileType: string;
  stockLength: number;
}

export interface MaterialOptimizationResult {
  profileType: string;
  stockLength: number;
  cuts: Cut[];
  totalWaste: number;
  efficiency: number;
  stockCount: number;
  wasteValue?: number;
  utilization?: number;
  materialCost?: number;
  averageComplexity?: number;
  setupTime?: number;
  cuttingTime?: number;
  qualityScore?: number;
  recommendations?: string[];
}

export interface OptimizationResult {
  cuts: Cut[];
  totalWaste: number;
  efficiency: number;
  stockCount: number;
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
  algorithm: string;
  executionTimeMs: number;
  wasteDistribution: {
    minimal: number;
    small: number;
    medium: number;
    large: number;
    excessive: number;
    reclaimable: number;
    totalPieces: number;
  };
  constraints: {
    maxCutsPerStock: number;
    allowPartialStocks: boolean;
    prioritizeSmallWaste: boolean;
  };
  recommendations: OptimizationRecommendation[];
  materialResults?: MaterialOptimizationResult[];
  // New fields based on real-world analysis
  optimizationScore?: number;
  efficiencyCategory?: 'excellent' | 'good' | 'average' | 'poor';
  detailedWasteAnalysis?: {
    minimal: number;    // < 50mm
    small: number;      // 50-150mm
    medium: number;     // 150-300mm
    large: number;      // 300-500mm
    excessive: number;  // > 500mm
    totalPieces: number;
    averageWaste: number;
  };
}

export interface OptimizationRecommendation {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  impact: string;
  suggestion: string;
  potentialSavings: number;
  implementationEffort: 'low' | 'medium' | 'high';
}

// Form tipleri
export interface OptimizationFormData {
  items: OptimizationItem[];
  algorithm: 'ffd' | 'branch-and-bound' | 'genetic';
  stockLength: number;
  materialStockLengths?: MaterialStockLength[]; // Malzeme bazlı boy profil uzunlukları
}

export interface OptimizationItem {
  readonly id?: string;
  readonly workOrderId?: string;
  readonly productName?: string;
  readonly profileType: string;
  readonly length?: number;
  readonly measurement?: string;
  readonly quantity: number;
  readonly totalLength?: number;
  readonly originalIndex?: number; // Benzersiz index
  readonly priority?: string;
  readonly tolerance?: number;
  readonly minLength?: number; // After tolerance consideration
  readonly maxLength?: number; // After tolerance consideration
  readonly weight?: number; // For handling considerations
  readonly materialGrade?: string;
  readonly size?: string;
  readonly color?: string;
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

// API Response tipleri
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  message?: string;
}


export interface WorkOrderFormState {
  orderNumber: string;
  customerName: string;
  dueDate: string;
  items: WorkOrderItemForm[];
}

export interface WorkOrderItemForm {
  profileType: string;
  length: number;
  quantity: number;
}

// Chart tipleri
export interface WasteAnalysisData {
  algorithm: string;
  waste: number;
  efficiency: number;
  stockCount: number;
  executionTime: number;
}

// Component Props tipleri
export interface OptimizationFormProps {
  onSubmit: (data: OptimizationFormData) => void;
  isLoading?: boolean;
}

export interface CuttingPlanVisualizationProps {
  cuts: Cut[];
  stockLength: number;
  materialResults?: MaterialOptimizationResult[]; // Malzeme bazlı sonuçlar
}

export interface WasteAnalysisChartProps {
  data: WasteAnalysisData[];
}
