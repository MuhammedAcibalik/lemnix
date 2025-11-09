/**
 * Ölçü birimi dönüşümü için merkezi utility
 * Tüm measurement conversion'lar buradan yapılacak
 */

export interface ParseResult {
  success: boolean;
  value: number;
  unit?: string;
}

export class MeasurementConverter {
  /**
   * CM -> MM dönüşümü (DÜZELTME: 10 yerine 100)
   * 1 CM = 100 MM (DOĞRU)
   */
  static convertToMM(input: string): string {
    if (!input || typeof input !== "string") return input;

    const trimmedInput = input.trim().toUpperCase();

    // CM dönüşümü - DÜZELTME: 10 yerine 100
    if (trimmedInput.includes("CM")) {
      const cmValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
      const cmNumber = parseFloat(cmValue);
      if (!isNaN(cmNumber)) {
        const mmValue = Math.round(cmNumber * 100); // DÜZELTME: 10 -> 100
        return `${mmValue}`;
      }
    }

    // M dönüşümü
    if (trimmedInput.includes("M") && !trimmedInput.includes("MM")) {
      const mValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
      const mNumber = parseFloat(mValue);
      if (!isNaN(mNumber)) {
        const mmValue = Math.round(mNumber * 1000);
        return `${mmValue}`;
      }
    }

    // MM zaten doğru birim
    if (trimmedInput.includes("MM")) {
      const mmValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
      const mmNumber = parseFloat(mmValue);
      if (!isNaN(mmNumber)) {
        return `${Math.round(mmNumber)}`;
      }
    }

    // Sadece sayı - doğrudan döndür
    const numberValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
    const number = parseFloat(numberValue);
    if (!isNaN(number)) {
      return `${Math.round(number)}`;
    }

    return input; // Dönüştürülemezse orijinal değeri döndür
  }

  /**
   * Measurement parsing ve validation
   */
  static parse(input: string): ParseResult {
    if (!input || typeof input !== "string") {
      return { success: false, value: 0 };
    }

    const trimmedInput = input.trim().toUpperCase();

    // CM parsing
    if (trimmedInput.includes("CM")) {
      const cmValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
      const cmNumber = parseFloat(cmValue);
      if (!isNaN(cmNumber)) {
        const mmValue = Math.round(cmNumber * 100); // DÜZELTME: 10 -> 100
        return {
          success: true,
          value: mmValue,
          unit: "mm",
        };
      }
    }

    // M parsing
    if (trimmedInput.includes("M") && !trimmedInput.includes("MM")) {
      const mValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
      const mNumber = parseFloat(mValue);
      if (!isNaN(mNumber)) {
        const mmValue = Math.round(mNumber * 1000);
        return {
          success: true,
          value: mmValue,
          unit: "mm",
        };
      }
    }

    // MM parsing
    if (trimmedInput.includes("MM")) {
      const mmValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
      const mmNumber = parseFloat(mmValue);
      if (!isNaN(mmNumber)) {
        return {
          success: true,
          value: Math.round(mmNumber),
          unit: "mm",
        };
      }
    }

    // Sadece sayı parsing
    const numberValue = trimmedInput.replace(/[^\d,.]/g, "").replace(",", ".");
    const number = parseFloat(numberValue);
    if (!isNaN(number)) {
      // Reasonable bounds check (0.1mm - 50000mm)
      if (number >= 0.1 && number <= 50000) {
        return {
          success: true,
          value: Math.round(number),
          unit: "mm",
        };
      }
    }

    return { success: false, value: 0 };
  }
}
