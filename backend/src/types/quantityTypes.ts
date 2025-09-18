export interface QuantityCalculation {
  adet: number;
  confidence: number;
  method: string;
  rule: string;
  description: string;
}

export interface QuantityValidation {
  isValid: boolean;
  calculatedAdet: number;
  difference: number;
  percentageDiff: number;
  confidence: number;
  rule: string;
  message: string;
}

export interface QuantityRule {
  adet: number;
  confidence: number;
  method: string;
}
