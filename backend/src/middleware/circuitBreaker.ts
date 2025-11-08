/**
 * @fileoverview Circuit Breaker Middleware for Database Resilience
 * @module CircuitBreaker
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

/**
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, reject immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerConfig {
  failureThreshold: number;  // Number of failures before opening
  successThreshold: number;  // Number of successes to close from half-open
  timeout: number;           // Time to wait before half-open (ms)
  monitoringPeriod: number;  // Time window to track failures (ms)
}

/**
 * Circuit Breaker for Database Operations
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private nextAttemptTime = 0;
  private readonly config: CircuitBreakerConfig;
  private readonly name: string;

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = {
      failureThreshold: config?.failureThreshold ?? 5,
      successThreshold: config?.successThreshold ?? 2,
      timeout: config?.timeout ?? 60000, // 1 minute
      monitoringPeriod: config?.monitoringPeriod ?? 120000, // 2 minutes
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      
      // Check if timeout elapsed
      if (now < this.nextAttemptTime) {
        const error = new Error('Circuit breaker is OPEN');
        logger.warn(`[CircuitBreaker:${this.name}] Request rejected - circuit is OPEN`, {
          nextAttempt: new Date(this.nextAttemptTime).toISOString(),
        });
        throw error;
      }
      
      // Move to half-open to test
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
      logger.info(`[CircuitBreaker:${this.name}] State: OPEN → HALF_OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        logger.info(`[CircuitBreaker:${this.name}] State: HALF_OPEN → CLOSED (recovered)`);
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.failureCount++;
    this.lastFailureTime = now;

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during test - reopen circuit
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = now + this.config.timeout;
      this.failureCount = 0;
      this.successCount = 0;
      
      logger.warn(`[CircuitBreaker:${this.name}] State: HALF_OPEN → OPEN (test failed)`);
    } else if (this.failureCount >= this.config.failureThreshold) {
      // Too many failures - open circuit
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = now + this.config.timeout;
      
      logger.error(`[CircuitBreaker:${this.name}] State: CLOSED → OPEN (threshold reached)`, {
        failures: this.failureCount,
        threshold: this.config.failureThreshold,
      });
    }

    // Reset failure count after monitoring period
    if (now - this.lastFailureTime > this.config.monitoringPeriod) {
      this.failureCount = 0;
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    nextAttemptTime: string | null;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttemptTime: this.nextAttemptTime > 0 
        ? new Date(this.nextAttemptTime).toISOString() 
        : null,
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
    
    logger.info(`[CircuitBreaker:${this.name}] Circuit manually reset`);
  }
}

/**
 * Create circuit breakers for different services
 */
export const circuitBreakers = {
  database: new CircuitBreaker('Database', {
    failureThreshold: 5,
    timeout: 30000, // 30 seconds
  }),
  
  optimization: new CircuitBreaker('Optimization', {
    failureThreshold: 3,
    timeout: 60000, // 1 minute
  }),
  
  export: new CircuitBreaker('Export', {
    failureThreshold: 10,
    timeout: 120000, // 2 minutes
  }),
} as const;

/**
 * Circuit breaker middleware for Express
 */
export function createCircuitBreakerMiddleware(breakerName: keyof typeof circuitBreakers) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const breaker = circuitBreakers[breakerName];
    
    try {
      await breaker.execute(async () => {
        // Continue to next middleware
        return Promise.resolve();
      });
      
      next();
    } catch (error) {
      res.status(503).json({
        success: false,
        error: {
          message: 'Service temporarily unavailable',
          code: 'CIRCUIT_BREAKER_OPEN',
          details: breaker.getStatus(),
        },
      });
    }
  };
}

