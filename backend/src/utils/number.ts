/**
 * @fileoverview Güvenli sayı biçimlendirme yardımcıları
 * @module NumberUtils
 * @version 1.0.0
 * 
 * NSGA-II ve diğer algoritmalarda undefined/null/NaN değerlerin
 * güvenli biçimlendirilmesi için yardımcı fonksiyonlar
 */

/**
 * Değeri güvenli bir şekilde sayıya dönüştürür
 * @param value - Dönüştürülecek değer
 * @returns Sayı veya null (geçersiz değerler için)
 */
export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  
  const num = typeof value === 'string' ? Number(value) : (value as number);
  
  return Number.isFinite(num) ? num : null;
}

/**
 * Değeri güvenli bir şekilde finite sayıya dönüştürür
 * @param value - Dönüştürülecek değer
 * @returns Finite sayı veya null (geçersiz değerler için)
 */
export function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : (typeof value === 'string' ? Number(value) : NaN);
  return Number.isFinite(n) ? n : null;
}

/**
 * .toFixed() çağırmadan önce null/NaN koruması; çıktı number (string değil)
 * @param value - Dönüştürülecek değer
 * @param digits - Ondalık basamak sayısı (varsayılan: 3)
 * @returns Yuvarlanmış sayı veya null (geçersiz değerler için)
 */
export function fmt(value: unknown, digits = 3): number | null {
  const n = toFiniteNumber(value);
  return n === null ? null : Number(n.toFixed(digits));
}

/**
 * Çıktıyı number isterseniz
 * @param value - Dönüştürülecek değer
 * @param digits - Ondalık basamak sayısı (varsayılan: 3)
 * @returns Yuvarlanmış sayı veya null (geçersiz değerler için)
 */
export function fmtNum(value: unknown, digits = 3): number | null {
  const n = toFiniteNumber(value);
  return n === null ? null : Number(n.toFixed(digits));
}

/**
 * Çıktıyı string isterseniz (API kontratı string ise bunu kullanın)
 * @param value - Dönüştürülecek değer
 * @param digits - Ondalık basamak sayısı (varsayılan: 3)
 * @returns Biçimlendirilmiş string veya null (geçersiz değerler için)
 */
export function fmtStr(value: unknown, digits = 3): string | null {
  const n = toFiniteNumber(value);
  return n === null ? null : n.toFixed(digits);
}

/**
 * Değeri güvenli bir şekilde yuvarlanmış sayıya dönüştürür
 * @param value - Dönüştürülecek değer
 * @param digits - Ondalık basamak sayısı (varsayılan: 3)
 * @returns Yuvarlanmış sayı veya null (geçersiz değerler için)
 */
export function toRoundedOrNull(value: unknown, digits = 3): number | null {
  const num = toNumberOrNull(value);
  return num === null ? null : Number(num.toFixed(digits));
}

/**
 * Değeri güvenli bir şekilde string'e dönüştürür (toFixed için)
 * @param value - Dönüştürülecek değer
 * @param digits - Ondalık basamak sayısı (varsayılan: 3)
 * @returns Biçimlendirilmiş string veya 'N/A' (geçersiz değerler için)
 */
export function toFixedOrNA(value: unknown, digits = 3): string {
  const num = toNumberOrNull(value);
  return num === null ? 'N/A' : num.toFixed(digits);
}

/**
 * Güvenli bölme işlemi (division by zero koruması)
 * @param numerator - Pay
 * @param denominator - Payda
 * @returns Bölüm sonucu veya NaN (geçersiz işlem için)
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return NaN;
  }
  return numerator / denominator;
}

/**
 * Güvenli bölme işlemi (unknown değerler için)
 * @param a - Pay
 * @param b - Payda
 * @returns Bölüm sonucu veya null (geçersiz işlem için)
 */
export function safeDiv(a: unknown, b: unknown): number | null {
  const A = toFiniteNumber(a);
  const B = toFiniteNumber(b);
  if (A === null || B === null || B === 0) return null;
  return A / B;
}

/**
 * Değer dizisinin ortalamasını güvenli bir şekilde hesaplar
 * @param values - Hesaplanacak değerler
 * @returns Ortalama veya null (geçersiz değerler için)
 */
export function safeAverage(values: number[]): number | null {
  if (!Array.isArray(values) || values.length === 0) return null;
  
  const validValues = values.filter(v => Number.isFinite(v));
  if (validValues.length === 0) return null;
  
  const sum = validValues.reduce((a, b) => a + b, 0);
  return sum / validValues.length;
}

/**
 * Objective değerlerinin geçerliliğini kontrol eder
 * @param objectives - Kontrol edilecek objective değerleri
 * @returns Geçerli mi?
 */
export function isValidObjectives(objectives: Record<string, unknown>): boolean {
  return Object.values(objectives).every(value => 
    value !== null && 
    value !== undefined && 
    Number.isFinite(value as number)
  );
}
