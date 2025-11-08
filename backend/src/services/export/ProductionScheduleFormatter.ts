/**
 * Production Schedule Formatter
 * Generate production timeline from optimization results
 * 
 * @module services/export
 * @version 1.0.0
 */

import type { ProductionScheduleData } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TimelineEvent {
  readonly type: 'setup' | 'cutting' | 'break';
  readonly stockNumber?: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly duration: number;
  readonly description: string;
  readonly segmentCount?: number;
  readonly segments?: readonly SegmentDetail[];
}

interface SegmentDetail {
  readonly segmentNumber: number;
  readonly profileType: string;
  readonly length: number;
  readonly workOrderId: string;
}

/**
 * Generate production schedule
 * Creates timeline view of production sequence
 */
export class ProductionScheduleFormatter {
  /**
   * Format production schedule
   */
  public format(data: ProductionScheduleData): Buffer {
    const { result, startDate, setupTimePerStock = 5, cuttingTimePerSegment = 2 } = data;

    let currentTime = new Date(startDate);
    const timeline: TimelineEvent[] = [];

    result.cuts.forEach((cut, stockIndex) => {
      // Setup time
      const setupStart = new Date(currentTime);
      currentTime = new Date(currentTime.getTime() + setupTimePerStock * 60 * 1000);
      const setupEnd = new Date(currentTime);

      timeline.push({
        type: 'setup',
        stockNumber: stockIndex + 1,
        startTime: setupStart.toISOString(),
        endTime: setupEnd.toISOString(),
        duration: setupTimePerStock,
        description: `Stok ${stockIndex + 1} kurulum`,
      });

      // Cutting time
      const segmentCount = cut.segments.length;
      const cuttingStart = new Date(currentTime);
      currentTime = new Date(currentTime.getTime() + segmentCount * cuttingTimePerSegment * 60 * 1000);
      const cuttingEnd = new Date(currentTime);

      timeline.push({
        type: 'cutting',
        stockNumber: stockIndex + 1,
        segmentCount,
        startTime: cuttingStart.toISOString(),
        endTime: cuttingEnd.toISOString(),
        duration: segmentCount * cuttingTimePerSegment,
        description: `Stok ${stockIndex + 1} kesim (${segmentCount} segment)`,
        segments: cut.segments.map((seg, segIndex) => ({
          segmentNumber: segIndex + 1,
          profileType: seg.profileType,
          length: seg.length,
          workOrderId: seg.workOrderId || 'N/A',
        })),
      });
    });

    const schedule = {
      projectStart: startDate.toISOString(),
      projectEnd: currentTime.toISOString(),
      totalDuration: Math.ceil((currentTime.getTime() - startDate.getTime()) / (60 * 1000)), // minutes
      timeline,
      summary: {
        totalStocks: result.cuts.length,
        totalSetupTime: result.cuts.length * setupTimePerStock,
        totalCuttingTime: result.cuts.reduce((sum, c) => sum + c.segments.length * cuttingTimePerSegment, 0),
      },
    };

    return Buffer.from(JSON.stringify(schedule, null, 2), 'utf-8');
  }
}

