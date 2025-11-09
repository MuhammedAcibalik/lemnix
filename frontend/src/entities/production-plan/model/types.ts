/**
 * @fileoverview Production Plan Types
 * @module entities/production-plan/model
 * @version 1.0.0
 */

export interface ProductionPlan {
  readonly id: string;
  readonly weekNumber: number;
  readonly year: number;
  readonly status: "active" | "archived";
  readonly uploadedAt: string;
  readonly uploadedBy?: string;
  readonly metadata?: Record<string, unknown>;
  readonly items: ProductionPlanItem[];
}

export interface ProductionPlanItem {
  readonly id: string;
  readonly planId: string;
  readonly ad: string;
  readonly siparisVeren: string;
  readonly musteriNo: string;
  readonly musteriKalemi: string;
  readonly siparis: string; // workOrderId ile eşleşir
  readonly malzemeNo: string;
  readonly malzemeKisaMetni: string;
  readonly miktar: number;
  readonly planlananBitisTarihi: string; // ISO date string
  readonly bolum: string;
  readonly oncelik: "yuksek" | "orta" | "dusuk";
  readonly linkedCuttingListId?: string; // Yeni alan eklendi
}

export interface BackorderItem extends ProductionPlanItem {
  readonly daysOverdue: number;
  readonly riskLevel: "high" | "medium" | "low";
}

export interface ProductionPlanStatistics {
  readonly overview: {
    readonly totalPlans: number;
    readonly totalItems: number;
    readonly completedItems: number;
    readonly completionRate: number;
    readonly backorderCount: number;
  };
  readonly departmentDistribution: Array<{
    readonly department: string;
    readonly total: number;
    readonly completed: number;
  }>;
  readonly priorityDistribution: Array<{
    readonly priority: string;
    readonly count: number;
  }>;
  readonly weeklyTrends: Array<{
    readonly week: number;
    readonly year: number;
    readonly itemCount: number;
    readonly completionRate: number;
  }>;
  readonly topBackorders: BackorderItem[];
}

export interface ProductionPlanFilters {
  readonly weekNumber?: number;
  readonly year?: number;
  readonly status?: "active" | "archived";
  readonly bolum?: string;
  readonly oncelik?: "yuksek" | "orta" | "dusuk";
  readonly page?: number;
  readonly limit?: number;
}

export interface ProductionPlanMetrics {
  readonly totalPlans: number;
  readonly totalItems: number;
  readonly departments: string[];
  readonly priorityDistribution: Record<string, number>;
  readonly upcomingDeadlines: number;
}

export interface UploadProductionPlanRequest {
  readonly file: File;
}

export interface UploadProductionPlanResponse {
  readonly success: boolean;
  readonly data?: ProductionPlan;
  readonly errors?: string[];
  readonly message?: string;
}

export interface ProductionPlanListResponse {
  readonly success: boolean;
  readonly data: ProductionPlan[];
  readonly pagination?: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
  };
}

export interface ProductionPlanMetricsResponse {
  readonly success: boolean;
  readonly data: ProductionPlanMetrics;
}

export interface ProductionPlanError {
  readonly success: false;
  readonly error: string;
  readonly errors?: string[];
}

// Type guards
export const isProductionPlan = (value: unknown): value is ProductionPlan => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ProductionPlan).id === "string" &&
    typeof (value as ProductionPlan).weekNumber === "number" &&
    typeof (value as ProductionPlan).year === "number" &&
    Array.isArray((value as ProductionPlan).items)
  );
};

export const isProductionPlanItem = (
  value: unknown,
): value is ProductionPlanItem => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ProductionPlanItem).id === "string" &&
    typeof (value as ProductionPlanItem).planId === "string" &&
    typeof (value as ProductionPlanItem).ad === "string" &&
    typeof (value as ProductionPlanItem).siparis === "string"
  );
};

// Priority mapping
export const PRIORITY_LABELS: Record<string, string> = {
  yuksek: "Yüksek",
  orta: "Orta",
  dusuk: "Düşük",
  // Türkçe değerler için de mapping ekle
  Yüksek: "Yüksek",
  Orta: "Orta",
  Düşük: "Düşük",
  YUKSEK: "Yüksek",
  ORTA: "Orta",
  DUSUK: "Düşük",
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
  yuksek: "error",
  orta: "warning",
  dusuk: "success",
  // Türkçe değerler için de mapping ekle
  Yüksek: "error",
  Orta: "warning",
  Düşük: "success",
  YUKSEK: "error",
  ORTA: "warning",
  DUSUK: "success",
} as const;

// Department options (will be populated from API)
export const DEPARTMENT_OPTIONS = [
  "MONTAJ",
  "HELEZON",
  "ABOARD",
  "UYUP",
] as const;

// Department mapping (number to name)
export const DEPARTMENT_MAPPING: Record<string, string> = {
  "1 MONTAJ": "MONTAJ",
  "3 HELEZON": "HELEZON",
  "4 ABOARD": "ABOARD",
  "6 UYUP": "UYUP",
  // Sadece rakamlar için de mapping ekle
  "1": "MONTAJ",
  "3": "HELEZON",
  "4": "ABOARD",
  "6": "UYUP",
} as const;

// Week number options (1-53)
export const WEEK_OPTIONS = Array.from({ length: 53 }, (_, i) => i + 1);

// Year options (current year ± 2)
export const getYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
};
