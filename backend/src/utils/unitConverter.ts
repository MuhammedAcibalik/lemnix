/**
 * @fileoverview Unit Conversion Utility for Aluminum Profile Cutting
 * @module UnitConverter
 * @version 1.0.0
 */

export enum LengthUnit {
  MILLIMETER = 'mm',
  CENTIMETER = 'cm',
  METER = 'm'
}

export class UnitConverter {
  /**
   * Convert length from one unit to another
   */
  static convert(value: number, from: LengthUnit, to: LengthUnit): number {
    // First convert to mm (base unit)
    let mmValue: number;
    
    switch (from) {
      case LengthUnit.MILLIMETER:
        mmValue = value;
        break;
      case LengthUnit.CENTIMETER:
        mmValue = value * 10;
        break;
      case LengthUnit.METER:
        mmValue = value * 1000;
        break;
      default:
        throw new Error(`Unknown unit: ${from}`);
    }
    
    // Then convert from mm to target unit
    switch (to) {
      case LengthUnit.MILLIMETER:
        return mmValue;
      case LengthUnit.CENTIMETER:
        return mmValue / 10;
      case LengthUnit.METER:
        return mmValue / 1000;
      default:
        throw new Error(`Unknown unit: ${to}`);
    }
  }
  
  /**
   * Convert to millimeters (base unit)
   */
  static toMillimeters(value: number, from: LengthUnit): number {
    return this.convert(value, from, LengthUnit.MILLIMETER);
  }
  
  /**
   * Convert from millimeters to target unit
   */
  static fromMillimeters(value: number, to: LengthUnit): number {
    return this.convert(value, LengthUnit.MILLIMETER, to);
  }
  
  /**
   * Format value with unit
   */
  static format(value: number, unit: LengthUnit, decimals: number = 2): string {
    const formatted = value.toFixed(decimals);
    return `${formatted} ${unit}`;
  }
  
  /**
   * Parse string with unit to value
   */
  static parse(input: string): { value: number; unit: LengthUnit } {
    const match = input.match(/^([\d.]+)\s*(mm|cm|m)$/i);
    if (!match) {
      throw new Error(`Invalid format: ${input}`);
    }
    
    const value = parseFloat(match[1]!);
    const unit = match[2]!.toLowerCase() as LengthUnit;
    
    return { value, unit };
  }
  
  /**
   * Convert array of items with length property
   */
  static convertItems<T extends { length: number }>(
    items: T[],
    from: LengthUnit,
    to: LengthUnit
  ): T[] {
    return items.map(item => ({
      ...item,
      length: this.convert(item.length, from, to)
    }));
  }
}
