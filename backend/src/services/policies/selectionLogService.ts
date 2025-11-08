/**
 * LEMNİX Selection Log Service
 * Algorithm decision tracking and selection logging system
 */

import {
  AlgorithmSelection,
  SelectionPolicy,
  SelectionDistribution,
  SelectionTrend,
  CanaryData,
  WorkloadClass,
  AlgorithmType,
  SelectionReason,
  FallbackTrigger,
  AlgorithmCandidate,
  SelectionMetrics,
  DEFAULT_SELECTION_POLICIES,
  classifyWorkload,
  getSelectionPolicy,
  calculateWorkloadComplexity,
  estimateAlgorithmPerformance
} from '../../types/selectionLogTypes';
import { ILogger } from '../logger';
import { v4 as uuidv4 } from 'uuid';
import { OptimizationItem } from '../../types';

export class SelectionLogService {
  private logger: ILogger;
  private selectionHistory: Map<string, AlgorithmSelection> = new Map();
  private canaryData: Map<string, CanaryData> = new Map();
  private readonly maxSelectionHistory = 10000;
  private readonly maxCanaryData = 1000;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.startCleanupTimer();
  }

  /**
   * Create algorithm selection log entry
   */
  public async createSelectionLog(
    correlationId: string,
    items: OptimizationItem[],
    constraints: {
      maxDuration?: number;
      maxMemory?: number;
      minQuality?: number;
      preferQuality?: boolean;
      preferSpeed?: boolean;
      allowFallback?: boolean;
    } = {}
  ): Promise<AlgorithmSelection> {
    try {
      // Classify workload
      const workloadSize = items.length;
      const workloadClass = classifyWorkload(workloadSize);
      const workloadComplexity = calculateWorkloadComplexity(items.map(item => ({ profileType: item.profileType, stockLength: 6000 })));

      // Get selection policy
      const policy = getSelectionPolicy(workloadClass);

      // Generate candidates
      const candidates = await this.generateAlgorithmCandidates(
        workloadSize,
        workloadComplexity,
        constraints
      );

      // Select algorithm
      const selection = await this.selectAlgorithm(
        candidates,
        policy,
        constraints,
        workloadClass
      );

      // Create selection log entry
      const selectionLog: AlgorithmSelection = {
        id: uuidv4(),
        correlationId,
        timestamp: new Date().toISOString(),
        workloadClass,
        workloadSize,
        workloadComplexity,
        candidates,
        selectedAlgorithm: selection.algorithm,
        selectionReason: selection.reason,
        selectionConfidence: selection.confidence,
        fallbackTriggered: false,
        actualDuration: 0, // Will be updated after execution
        actualQuality: 0,  // Will be updated after execution
        actualMemory: 0,   // Will be updated after execution
        wastePercentage: 0, // Will be updated after execution
        metrics: {
          workloadSize,
          workloadComplexity,
          availableMemory: constraints.maxMemory || 500,
          timeConstraint: constraints.maxDuration || 60000,
          qualityRequirement: constraints.minQuality || 0.8,
          previousPerformance: await this.getHistoricalPerformance(workloadClass)
        },
        selectionContext: {
          availableAlgorithms: Object.values(AlgorithmType),
          constraints: {
            maxDuration: constraints.maxDuration || 60000,
            maxMemory: constraints.maxMemory || 500,
            minQuality: constraints.minQuality || 0.8
          },
          preferences: {
            preferQuality: constraints.preferQuality || false,
            preferSpeed: constraints.preferSpeed || false,
            allowFallback: constraints.allowFallback !== false
          }
        },
        reasoning: selection.reasoning,
        alternatives: selection.alternatives,
        tradeoffs: selection.tradeoffs
      };

      // Store selection log
      this.selectionHistory.set(selectionLog.id, selectionLog);

      // Log selection
      this.logger.info('Algorithm selected', {
        correlationId,
        selectionId: selectionLog.id,
        workloadClass,
        workloadSize,
        selectedAlgorithm: selectionLog.selectedAlgorithm,
        selectionReason: selectionLog.selectionReason,
        selectionConfidence: selectionLog.selectionConfidence,
        reasoning: selectionLog.reasoning
      });

      return selectionLog;
    } catch (error) {
      this.logger.error('Failed to create selection log', {
        correlationId,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Update selection log with execution results
   */
  public async updateSelectionLog(
    selectionId: string,
    results: {
      duration: number;
      quality: number;
      memory: number;
      wastePercentage: number;
      fallbackTriggered?: boolean;
      fallbackTrigger?: FallbackTrigger;
      fallbackAlgorithm?: AlgorithmType;
      fallbackReason?: string;
    }
  ): Promise<boolean> {
    const selection = this.selectionHistory.get(selectionId);
    if (!selection) {
      this.logger.warn('Selection log not found for update', { selectionId });
      return false;
    }

    // Update selection with results
    selection.actualDuration = results.duration;
    selection.actualQuality = results.quality;
    selection.actualMemory = results.memory;
    selection.wastePercentage = results.wastePercentage;

    if (results.fallbackTriggered) {
      selection.fallbackTriggered = true;
      selection.fallbackTrigger = results.fallbackTrigger;
      selection.fallbackAlgorithm = results.fallbackAlgorithm;
      selection.fallbackReason = results.fallbackReason;
    }

    // Store updated selection
    this.selectionHistory.set(selectionId, selection);

    // Log update
    this.logger.info('Selection log updated', {
      selectionId,
      correlationId: selection.correlationId,
      actualDuration: results.duration,
      actualQuality: results.quality,
      actualMemory: results.memory,
      wastePercentage: results.wastePercentage,
      fallbackTriggered: results.fallbackTriggered
    });

    return true;
  }

  /**
   * Record canary data for change safety
   */
  public async recordCanaryData(
    correlationId: string,
    algorithm: AlgorithmType,
    workloadClass: WorkloadClass,
    metrics: {
      duration: number;
      quality: number;
      memory: number;
      wastePercentage: number;
    },
    baseline: {
      algorithm: AlgorithmType;
      duration: number;
      quality: number;
    }
  ): Promise<CanaryData> {
    const canaryData: CanaryData = {
      correlationId,
      algorithm,
      workloadClass,
      metrics,
      canaryStatus: this.determineCanaryStatus(metrics, baseline),
      comparison: {
        baseline,
        deviation: {
          duration: ((metrics.duration - baseline.duration) / baseline.duration) * 100,
          quality: ((metrics.quality - baseline.quality) / baseline.quality) * 100
        }
      }
    };

    // Store canary data
    this.canaryData.set(correlationId, canaryData);

    // Log canary data
    this.logger.info('Canary data recorded', {
      correlationId,
      algorithm,
      workloadClass,
      canaryStatus: canaryData.canaryStatus,
      durationDeviation: canaryData.comparison.deviation.duration,
      qualityDeviation: canaryData.comparison.deviation.quality
    });

    return canaryData;
  }

  /**
   * Get selection distribution
   */
  public getSelectionDistribution(): SelectionDistribution {
    const selections = Array.from(this.selectionHistory.values());
    
    const distribution: SelectionDistribution = {
      totalSelections: selections.length,
      byWorkloadClass: {} as Record<WorkloadClass, { count: number; algorithmDistribution: Record<AlgorithmType, number>; averageQuality: number; averageDuration: number; fallbackRate: number }>,
      byAlgorithm: {} as Record<AlgorithmType, { count: number; workloadDistribution: Record<WorkloadClass, number>; averageQuality: number; averageDuration: number; successRate: number }>,
      byReason: {} as Record<SelectionReason, number>,
      byFallbackTrigger: {} as Record<FallbackTrigger, number>
    };

    // Initialize workload class distribution
    Object.values(WorkloadClass).forEach(workloadClass => {
      distribution.byWorkloadClass[workloadClass] = {
        count: 0,
        algorithmDistribution: {} as Record<string, number>,
        averageQuality: 0,
        averageDuration: 0,
        fallbackRate: 0
      };
      
      Object.values(AlgorithmType).forEach(algorithm => {
        distribution.byWorkloadClass[workloadClass].algorithmDistribution[algorithm] = 0;
      });
    });

    // Initialize algorithm distribution
    Object.values(AlgorithmType).forEach(algorithm => {
      distribution.byAlgorithm[algorithm] = {
        count: 0,
        workloadDistribution: {} as Record<string, number>,
        averageQuality: 0,
        averageDuration: 0,
        successRate: 0
      };
      
      Object.values(WorkloadClass).forEach(workloadClass => {
        distribution.byAlgorithm[algorithm].workloadDistribution[workloadClass] = 0;
      });
    });

    // Initialize reason and fallback trigger distributions
    Object.values(SelectionReason).forEach(reason => {
      distribution.byReason[reason] = 0;
    });

    Object.values(FallbackTrigger).forEach(trigger => {
      distribution.byFallbackTrigger[trigger] = 0;
    });

    // Calculate distributions
    selections.forEach(selection => {
      // By workload class
      const workloadStats = distribution.byWorkloadClass[selection.workloadClass];
      workloadStats.count++;
      workloadStats.algorithmDistribution[selection.selectedAlgorithm]++;
      workloadStats.averageQuality += selection.actualQuality;
      workloadStats.averageDuration += selection.actualDuration;
      if (selection.fallbackTriggered) workloadStats.fallbackRate++;

      // By algorithm
      const algorithmStats = distribution.byAlgorithm[selection.selectedAlgorithm];
      algorithmStats.count++;
      algorithmStats.workloadDistribution[selection.workloadClass]++;
      algorithmStats.averageQuality += selection.actualQuality;
      algorithmStats.averageDuration += selection.actualDuration;
      if (selection.actualQuality >= 0.8) algorithmStats.successRate++;

      // By reason
      distribution.byReason[selection.selectionReason]++;

      // By fallback trigger
      if (selection.fallbackTriggered && selection.fallbackTrigger) {
        distribution.byFallbackTrigger[selection.fallbackTrigger]++;
      }
    });

    // Calculate averages
    Object.values(WorkloadClass).forEach(workloadClass => {
      const stats = distribution.byWorkloadClass[workloadClass];
      if (stats.count > 0) {
        stats.averageQuality /= stats.count;
        stats.averageDuration /= stats.count;
        stats.fallbackRate /= stats.count;
      }
    });

    Object.values(AlgorithmType).forEach(algorithm => {
      const stats = distribution.byAlgorithm[algorithm];
      if (stats.count > 0) {
        stats.averageQuality /= stats.count;
        stats.averageDuration /= stats.count;
        stats.successRate /= stats.count;
      }
    });

    return distribution;
  }

  /**
   * Get selection trend
   */
  public getSelectionTrend(timeWindow: string = '24h'): SelectionTrend {
    const now = Date.now();
    const windowMs = this.parseTimeWindow(timeWindow);
    const startTime = now - windowMs;

    const selections = Array.from(this.selectionHistory.values())
      .filter(selection => new Date(selection.timestamp).getTime() > startTime);

    // Group by time intervals
    const intervalMs = Math.min(windowMs / 20, 3600000); // Max 20 data points, min 1 hour intervals
    const dataPoints: SelectionTrend['dataPoints'] = [];

    for (let time = startTime; time < now; time += intervalMs) {
      const intervalSelections = selections.filter(selection => {
        const selectionTime = new Date(selection.timestamp).getTime();
        return selectionTime >= time && selectionTime < time + intervalMs;
      });

      if (intervalSelections.length > 0) {
        const averageQuality = intervalSelections.reduce((sum, s) => sum + s.actualQuality, 0) / intervalSelections.length;
        const averageDuration = intervalSelections.reduce((sum, s) => sum + s.actualDuration, 0) / intervalSelections.length;
        const fallbackRate = intervalSelections.filter(s => s.fallbackTriggered).length / intervalSelections.length;

        // Find most common algorithm
        const algorithmCounts = new Map<AlgorithmType, number>();
        intervalSelections.forEach(s => {
          algorithmCounts.set(s.selectedAlgorithm, (algorithmCounts.get(s.selectedAlgorithm) || 0) + 1);
        });
        const topAlgorithm = Array.from(algorithmCounts.entries())
          .sort(([, a], [, b]) => b - a)[0]?.[0] || AlgorithmType.FFD;

        dataPoints.push({
          timestamp: new Date(time).toISOString(),
          selections: intervalSelections.length,
          averageQuality,
          averageDuration,
          fallbackRate,
          topAlgorithm
        });
      }
    }

    return {
      timeWindow,
      dataPoints
    };
  }

  /**
   * Get selection log by ID
   */
  public getSelectionLog(selectionId: string): AlgorithmSelection | null {
    return this.selectionHistory.get(selectionId) || null;
  }

  /**
   * Get canary data by correlation ID
   */
  public getCanaryData(correlationId: string): CanaryData | null {
    return this.canaryData.get(correlationId) || null;
  }

  /**
   * Generate algorithm candidates
   */
  private async generateAlgorithmCandidates(
    workloadSize: number,
    complexity: number,
    constraints: Record<string, unknown>
  ): Promise<AlgorithmCandidate[]> {
    const candidates: AlgorithmCandidate[] = [];

    // Generate candidates based on workload size and constraints
    const availableAlgorithms = Object.values(AlgorithmType);

    for (const algorithm of availableAlgorithms) {
      const performance = estimateAlgorithmPerformance(algorithm, workloadSize, complexity);
      
      // Check if algorithm meets constraints
      if (constraints.maxDuration && (performance.duration as number) > (constraints.maxDuration as number)) continue;
      if (constraints.maxMemory && (performance.memory as number) > (constraints.maxMemory as number)) continue;
      if (constraints.minQuality && (performance.quality as number) < (constraints.minQuality as number)) continue;

      const candidate: AlgorithmCandidate = {
        algorithm,
        estimatedDuration: performance.duration,
        estimatedQuality: performance.quality,
        estimatedMemory: performance.memory,
        confidence: this.calculateConfidence(algorithm, workloadSize, complexity),
        reasoning: this.generateReasoning(algorithm, workloadSize, complexity)
      };

      candidates.push(candidate);
    }

    return candidates.sort((a, b) => {
      // Sort by quality first, then by duration
      if (Math.abs(a.estimatedQuality - b.estimatedQuality) > 0.01) {
        return b.estimatedQuality - a.estimatedQuality;
      }
      return a.estimatedDuration - b.estimatedDuration;
    });
  }

  /**
   * Select algorithm from candidates
   */
  private async selectAlgorithm(
    candidates: AlgorithmCandidate[],
    policy: SelectionPolicy,
    constraints: Record<string, unknown>,
    workloadClass: WorkloadClass
  ): Promise<{
    algorithm: AlgorithmType;
    reason: SelectionReason;
    confidence: number;
    reasoning: string;
    alternatives: string[];
    tradeoffs: string[];
  }> {
    if (candidates.length === 0) {
      throw new Error('No suitable algorithms found for given constraints');
    }

    // Default selection
    let selectedAlgorithm = policy.primaryAlgorithm;
    let selectionReason = SelectionReason.DEFAULT;
    let confidence = 0.8;

    // Check if primary algorithm is available
    const primaryCandidate = candidates.find(c => c.algorithm === policy.primaryAlgorithm);
    if (!primaryCandidate) {
      selectedAlgorithm = candidates[0].algorithm;
      selectionReason = SelectionReason.FALLBACK;
      confidence = 0.6;
    } else {
      // Apply selection criteria
      if (constraints.preferQuality) {
        const qualityCandidate = candidates.reduce((best, current) => 
          current.estimatedQuality > best.estimatedQuality ? current : best
        );
        if (qualityCandidate.estimatedQuality > primaryCandidate.estimatedQuality + 0.05) {
          selectedAlgorithm = qualityCandidate.algorithm;
          selectionReason = SelectionReason.QUALITY_OPTIMIZED;
          confidence = 0.7;
        }
      }

      if (constraints.preferSpeed) {
        const speedCandidate = candidates.reduce((best, current) => 
          current.estimatedDuration < best.estimatedDuration ? current : best
        );
        if (speedCandidate.estimatedDuration < primaryCandidate.estimatedDuration * 0.8) {
          selectedAlgorithm = speedCandidate.algorithm;
          selectionReason = SelectionReason.PERFORMANCE_OPTIMIZED;
          confidence = 0.7;
        }
      }
    }

    const reasoning = this.generateDetailedReasoning(selectedAlgorithm, workloadClass, policy, constraints);
    const alternatives = candidates
      .filter(c => c.algorithm !== selectedAlgorithm)
      .slice(0, 3)
      .map(c => `${c.algorithm} (Quality: ${c.estimatedQuality.toFixed(2)}, Duration: ${c.estimatedDuration}ms)`);
    
    const tradeoffs = this.identifyTradeoffs(selectedAlgorithm, candidates, constraints);

    return {
      algorithm: selectedAlgorithm,
      reason: selectionReason,
      confidence,
      reasoning,
      alternatives,
      tradeoffs
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(algorithm: AlgorithmType, workloadSize: number, complexity: number): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on workload size
    if (workloadSize < 50) confidence += 0.1;
    else if (workloadSize > 1000) confidence -= 0.2;

    // Adjust based on complexity
    if (complexity < 0.3) confidence += 0.1;
    else if (complexity > 0.8) confidence -= 0.1;

    // Adjust based on algorithm type
    switch (algorithm) {
      case AlgorithmType.FFD:
      case AlgorithmType.BFD:
        confidence += 0.1; // Well-established algorithms
        break;
      case AlgorithmType.GENETIC:
      case AlgorithmType.SIMULATED_ANNEALING:
        confidence -= 0.1; // More variable performance
        break;
    }

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Generate reasoning for algorithm selection
   */
  private generateReasoning(algorithm: AlgorithmType, workloadSize: number, complexity: number): string {
    const reasons = {
      [AlgorithmType.FFD]: 'Fast and reliable for small to medium workloads',
      [AlgorithmType.BFD]: 'Good balance of speed and quality for medium workloads',
      [AlgorithmType.NFD]: 'Very fast but lower quality, suitable for simple workloads',
      [AlgorithmType.WFD]: 'Fast alternative with moderate quality',
      [AlgorithmType.GENETIC]: 'High quality results for complex workloads, slower execution',
      [AlgorithmType.SIMULATED_ANNEALING]: 'Excellent quality for large complex workloads',
      [AlgorithmType.BRANCH_AND_BOUND]: 'Optimal results but very slow, for critical applications',
      [AlgorithmType.PROFILE_POOLING]: 'Optimized for profile-based cutting scenarios'
    };

    return reasons[algorithm] || 'Algorithm selected based on workload characteristics';
  }

  /**
   * Generate detailed reasoning
   */
  private generateDetailedReasoning(
    algorithm: AlgorithmType,
    workloadClass: WorkloadClass,
    policy: SelectionPolicy,
    constraints: Record<string, unknown>
  ): string {
    let reasoning = `Selected ${algorithm} for ${workloadClass} workload class. `;
    
    if (algorithm === policy.primaryAlgorithm) {
      reasoning += 'This is the default algorithm for this workload class. ';
    }

    if (constraints.preferQuality) {
      reasoning += 'Quality optimization was prioritized. ';
    }

    if (constraints.preferSpeed) {
      reasoning += 'Speed optimization was prioritized. ';
    }

    reasoning += `Workload size: ${policy.workloadClass}, complexity: ${policy.qualityThreshold.toFixed(2)}. `;
    reasoning += `Quality threshold: ${policy.qualityThreshold}, duration threshold: ${policy.durationThreshold}ms.`;

    return reasoning;
  }

  /**
   * Identify tradeoffs made in selection
   */
  private identifyTradeoffs(
    selectedAlgorithm: AlgorithmType,
    candidates: AlgorithmCandidate[],
    constraints: Record<string, unknown>
  ): string[] {
    const tradeoffs: string[] = [];
    const selected = candidates.find(c => c.algorithm === selectedAlgorithm);
    
    if (!selected) return tradeoffs;

    // Find better alternatives for each metric
    const fasterAlternative = candidates.find(c => 
      c.algorithm !== selectedAlgorithm && c.estimatedDuration < selected.estimatedDuration * 0.8
    );
    
    const betterQualityAlternative = candidates.find(c => 
      c.algorithm !== selectedAlgorithm && c.estimatedQuality > selected.estimatedQuality + 0.05
    );

    const lowerMemoryAlternative = candidates.find(c => 
      c.algorithm !== selectedAlgorithm && c.estimatedMemory < selected.estimatedMemory * 0.8
    );

    if (fasterAlternative) {
      tradeoffs.push(`Sacrificed speed for quality: ${fasterAlternative.algorithm} would be ${Math.round((selected.estimatedDuration - fasterAlternative.estimatedDuration) / selected.estimatedDuration * 100)}% faster`);
    }

    if (betterQualityAlternative) {
      tradeoffs.push(`Sacrificed quality for speed: ${betterQualityAlternative.algorithm} would provide ${Math.round((betterQualityAlternative.estimatedQuality - selected.estimatedQuality) * 100)}% better quality`);
    }

    if (lowerMemoryAlternative) {
      tradeoffs.push(`Sacrificed memory efficiency: ${lowerMemoryAlternative.algorithm} would use ${Math.round((selected.estimatedMemory - lowerMemoryAlternative.estimatedMemory) / selected.estimatedMemory * 100)}% less memory`);
    }

    return tradeoffs;
  }

  /**
   * Get historical performance data
   */
  private async getHistoricalPerformance(workloadClass: WorkloadClass): Promise<Array<{
    algorithm: AlgorithmType;
    averageDuration: number;
    averageQuality: number;
    successRate: number;
  }>> {
    // Simplified historical performance - in real implementation, this would query a database
    const selections = Array.from(this.selectionHistory.values())
      .filter(s => s.workloadClass === workloadClass);

    const performanceMap = new Map<AlgorithmType, {
      totalDuration: number;
      totalQuality: number;
      count: number;
      successCount: number;
    }>();

    selections.forEach(selection => {
      const current = performanceMap.get(selection.selectedAlgorithm) || {
        totalDuration: 0,
        totalQuality: 0,
        count: 0,
        successCount: 0
      };

      current.totalDuration += selection.actualDuration;
      current.totalQuality += selection.actualQuality;
      current.count++;
      if (selection.actualQuality >= 0.8) current.successCount++;

      performanceMap.set(selection.selectedAlgorithm, current);
    });

    return Array.from(performanceMap.entries()).map(([algorithm, data]) => ({
      algorithm,
      averageDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      averageQuality: data.count > 0 ? data.totalQuality / data.count : 0,
      successRate: data.count > 0 ? data.successCount / data.count : 0
    }));
  }

  /**
   * Determine canary status
   */
  private determineCanaryStatus(
    metrics: { duration: number; quality: number; memory: number; wastePercentage: number },
    baseline: { algorithm: AlgorithmType; duration: number; quality: number }
  ): 'SUCCESS' | 'WARNING' | 'FAILURE' {
    const durationDeviation = Math.abs((metrics.duration - baseline.duration) / baseline.duration);
    const qualityDeviation = Math.abs((metrics.quality - baseline.quality) / baseline.quality);

    if (durationDeviation > 0.5 || qualityDeviation > 0.2 || metrics.quality < 0.7) {
      return 'FAILURE';
    }

    if (durationDeviation > 0.2 || qualityDeviation > 0.1 || metrics.quality < 0.8) {
      return 'WARNING';
    }

    return 'SUCCESS';
  }

  /**
   * Parse time window string
   */
  private parseTimeWindow(timeWindow: string): number {
    const match = timeWindow.match(/^(\d+)([hmd])$/);
    if (!match) return 86400000; // Default to 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 3600000;
      case 'm': return value * 60000;
      case 'd': return value * 86400000;
      default: return 86400000;
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Cleanup every hour
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days

    // Cleanup selection history
    let cleanedSelections = 0;
    for (const [id, selection] of this.selectionHistory.entries()) {
      if (new Date(selection.timestamp).getTime() < cutoffTime) {
        this.selectionHistory.delete(id);
        cleanedSelections++;
      }
    }

    // Cleanup canary data
    let cleanedCanary = 0;
    for (const [id, canary] of this.canaryData.entries()) {
      if (new Date(canary.correlationId).getTime() < cutoffTime) {
        this.canaryData.delete(id);
        cleanedCanary++;
      }
    }

    if (cleanedSelections > 0 || cleanedCanary > 0) {
      this.logger.info('Cleaned up old selection data', {
        selections: cleanedSelections,
        canaryData: cleanedCanary
      });
    }

    // Limit data size
    if (this.selectionHistory.size > this.maxSelectionHistory) {
      const selections = Array.from(this.selectionHistory.entries())
        .sort(([, a], [, b]) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.maxSelectionHistory);
      
      this.selectionHistory.clear();
      selections.forEach(([id, selection]) => this.selectionHistory.set(id, selection));
    }

    if (this.canaryData.size > this.maxCanaryData) {
      const canaryEntries = Array.from(this.canaryData.entries())
        .sort(([, a], [, b]) => new Date(b.correlationId).getTime() - new Date(a.correlationId).getTime())
        .slice(0, this.maxCanaryData);
      
      this.canaryData.clear();
      canaryEntries.forEach(([id, canary]) => this.canaryData.set(id, canary));
    }
  }
}

// Singleton instance
let selectionLogService: SelectionLogService | null = null;

export function getSelectionLogService(logger: ILogger): SelectionLogService {
  if (!selectionLogService) {
    selectionLogService = new SelectionLogService(logger);
  }
  return selectionLogService;
}
