/**
 * Profile Management Entity Types
 * Frontend types for profile definitions and work order mappings
 */

export interface ProfileDefinition {
  readonly id: string;
  readonly profileCode: string;
  readonly profileName: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly stockLengths: ProfileStockLength[];
}

export interface ProfileStockLength {
  readonly id: string;
  readonly profileId: string;
  readonly stockLength: number; // mm
  readonly isDefault: boolean;
  readonly priority: number; // Lower number = higher priority
  readonly createdAt: string;
}

export interface WorkOrderProfileMapping {
  readonly id: string;
  readonly workOrderId: string;
  readonly profileType: string; // e.g., "Kapalı alt", "Açık üst"
  readonly profileId: string;
  readonly weekNumber: number;
  readonly year: number;
  readonly uploadedBy?: string;
  readonly createdAt: string;
  readonly profile?: ProfileDefinition; // Populated with relation
}

export interface ProfileManagementSummary {
  readonly profilesCreated: number;
  readonly profilesUpdated: number;
  readonly mappingsCreated: number;
  readonly weekNumber?: number;
  readonly year?: number;
}

export interface ProfileManagementUploadResult {
  readonly success: boolean;
  readonly data?: ProfileManagementSummary;
  readonly warnings?: string[];
  readonly errors?: string[];
  readonly message?: string;
}

export interface ProfileDefinitionInput {
  readonly profileCode: string;
  readonly profileName: string;
  readonly stockLengths: ProfileStockLengthInput[];
}

export interface ProfileStockLengthInput {
  readonly stockLength: number;
  readonly isDefault: boolean;
  readonly priority: number;
}

export interface WorkOrderProfileMappingInput {
  readonly workOrderId: string;
  readonly profileType: string;
  readonly profileCode: string;
  readonly weekNumber: number;
  readonly year: number;
  readonly uploadedBy?: string;
}
