/**
 * Date utility functions
 * ISO 8601 week number calculation and date helpers
 */

/**
 * Calculate ISO 8601 week number and year
 * @param date - Date to calculate week for
 * @returns Object with week number and year
 */
export function getISOWeek(date: Date): { week: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = target.getFullYear();
  return { week, year };
}

/**
 * Get current ISO week and year
 * @returns Object with current week number and year
 */
export function getCurrentISOWeek(): { week: number; year: number } {
  return getISOWeek(new Date());
}
