/**
 * LEMNİX Algorithm Factory
 * Factory pattern for creating optimization algorithm instances
 *
 * @module optimization/core
 * @version 1.0.0
 * @architecture Factory Pattern + Registry Pattern (OCP)
 */

import { OptimizationAlgorithm } from "../../../types";
import { ILogger } from "../../logger";
import {
  IOptimizationAlgorithm,
  AlgorithmMetadata,
} from "./IOptimizationAlgorithm";

/**
 * Algorithm constructor type
 */
type AlgorithmConstructor = new (logger: ILogger) => IOptimizationAlgorithm;

/**
 * Algorithm factory with registry pattern
 * Allows adding new algorithms without modifying existing code (OCP)
 */
export class AlgorithmFactory {
  private readonly registry = new Map<
    OptimizationAlgorithm,
    AlgorithmConstructor
  >();
  private readonly metadata = new Map<
    OptimizationAlgorithm,
    AlgorithmMetadata
  >();

  constructor(private readonly logger: ILogger) {}

  /**
   * Register an algorithm with the factory
   * @param algorithmClass - Algorithm class constructor
   * @param metadata - Algorithm metadata
   */
  public register(
    algorithmClass: AlgorithmConstructor,
    metadata: AlgorithmMetadata,
  ): void {
    if (this.registry.has(metadata.name)) {
      this.logger.warn("Algorithm already registered, overwriting", {
        algorithm: metadata.name,
      });
    }

    this.registry.set(metadata.name, algorithmClass);
    this.metadata.set(metadata.name, metadata);

    this.logger.debug("Algorithm registered", {
      algorithm: metadata.name,
      displayName: metadata.displayName,
    });
  }

  /**
   * Create algorithm instance
   * @param algorithm - Algorithm identifier
   * @returns Algorithm instance
   * @throws Error if algorithm not registered
   */
  public create(algorithm: OptimizationAlgorithm): IOptimizationAlgorithm {
    const AlgorithmClass = this.registry.get(algorithm);

    if (!AlgorithmClass) {
      const available = Array.from(this.registry.keys());
      throw new Error(
        `Algorithm '${algorithm}' not registered. Available: ${available.join(", ")}`,
      );
    }

    return new AlgorithmClass(this.logger);
  }

  /**
   * Get algorithm metadata
   * @param algorithm - Algorithm identifier
   * @returns Algorithm metadata or undefined
   */
  public getMetadata(
    algorithm: OptimizationAlgorithm,
  ): AlgorithmMetadata | undefined {
    return this.metadata.get(algorithm);
  }

  /**
   * Get all registered algorithms
   * @returns Array of registered algorithm names
   */
  public getRegisteredAlgorithms(): OptimizationAlgorithm[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Check if algorithm is registered
   * @param algorithm - Algorithm identifier
   * @returns True if registered
   */
  public isRegistered(algorithm: OptimizationAlgorithm): boolean {
    return this.registry.has(algorithm);
  }

  /**
   * Get all algorithm metadata
   * @returns Array of all metadata
   */
  public getAllMetadata(): AlgorithmMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Get recommended algorithm for item count
   * @param itemCount - Number of items to optimize
   * @returns Recommended algorithm or undefined
   */
  public getRecommendedAlgorithm(
    itemCount: number,
  ): OptimizationAlgorithm | undefined {
    const metadataList = this.getAllMetadata();

    // Sort by scalability descending
    const sorted = metadataList.sort((a, b) => b.scalability - a.scalability);

    // Find first algorithm that can handle the load
    for (const meta of sorted) {
      if (itemCount < 100) {
        // Small workload: prefer quality over speed
        if (meta.scalability >= 7) {
          return meta.name;
        }
      } else if (itemCount < 500) {
        // Medium workload: balance quality and speed
        if (meta.scalability >= 6) {
          return meta.name;
        }
      } else {
        // Large workload: prefer speed
        if (meta.scalability >= 8) {
          return meta.name;
        }
      }
    }

    // Fallback to first algorithm
    return sorted[0]?.name;
  }
}
