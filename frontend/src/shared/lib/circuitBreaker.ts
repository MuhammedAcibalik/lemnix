/**
 * @fileoverview Circuit Breaker Pattern
 * @module shared/lib
 * @version 1.0.0
 * 
 * ✅ P2-9: Prevents cascade failures when backend is down
 * ✅ STATES: CLOSED → OPEN → HALF_OPEN → CLOSED
 * ✅ RESILIENCE: Fail fast, auto-recovery
 */

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED',       // Normal operation
  OPEN = 'OPEN',           // Failing, reject immediately
  HALF_OPEN = 'HALF_OPEN', // Testing if backend recovered
}

/**
 * Circuit breaker options
 */
export interface CircuitBreakerOptions {
  readonly failureThreshold: number; // Number of failures to open circuit
  readonly successThreshold: number; // Number of successes to close circuit (from HALF_OPEN)
  readonly timeout: number; // Time to wait before HALF_OPEN (ms)
  readonly name?: string; // Circuit name for logging
}

/**
 * Circuit breaker statistics
 */
export interface CircuitStats {
  readonly state: CircuitState;
  readonly failures: number;
  readonly successes: number;
  readonly lastFailureTime: number | null;
  readonly lastSuccessTime: number | null;
  readonly nextAttemptTime: number | null;
}

/**
 * Circuit Breaker Implementation
 * 
 * Prevents repeated requests to failing backends
 * 
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   successThreshold: 2,
 *   timeout: 30000,
 *   name: 'api-backend',
 * });
 * 
 * async function callAPI() {
 *   return breaker.execute(async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   });
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private nextAttemptTime: number | null = null;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      failureThreshold: options.failureThreshold,
      successThreshold: options.successThreshold,
      timeout: options.timeout,
      name: options.name || 'circuit-breaker',
    };
  }

  /**
   * Execute function with circuit breaker protection
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    // ✅ OPEN state: Reject immediately
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < (this.nextAttemptTime || 0)) {
        const waitTime = Math.ceil(((this.nextAttemptTime || 0) - Date.now()) / 1000);
        throw new Error(
          `[${this.options.name}] Circuit OPEN. Service temporarily unavailable. Retry in ${waitTime}s.`
        );
      }
      
      // Timeout expired, transition to HALF_OPEN
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
      console.info(`[${this.options.name}] Circuit → HALF_OPEN (testing recovery)`);
    }

    try {
      // Execute function
      const result = await fn();
      
      // ✅ Success handling
      this.onSuccess();
      
      return result;
    } catch (error) {
      // ✅ Failure handling
      this.onFailure();
      
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      // ✅ Enough successes to close circuit
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.info(`[${this.options.name}] Circuit → CLOSED (service recovered)`);
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    this.successCount = 0;

    // ✅ CLOSED → OPEN transition
    if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.options.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.timeout;
      
      console.warn(
        `[${this.options.name}] Circuit → OPEN (${this.failureCount} consecutive failures). ` +
        `Will retry in ${Math.ceil(this.options.timeout / 1000)}s.`
      );
    }

    // ✅ HALF_OPEN → OPEN transition
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.options.timeout;
      
      console.warn(
        `[${this.options.name}] Circuit → OPEN (recovery test failed). ` +
        `Will retry in ${Math.ceil(this.options.timeout / 1000)}s.`
      );
    }
  }

  /**
   * Get current circuit stats
   */
  public getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /**
   * Manually reset circuit
   */
  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttemptTime = null;
    console.info(`[${this.options.name}] Circuit manually reset → CLOSED`);
  }

  /**
   * Check if circuit is open
   */
  public isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  /**
   * Check if circuit is closed (normal operation)
   */
  public isClosed(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Check if circuit is half-open (recovery testing)
   */
  public isHalfOpen(): boolean {
    return this.state === CircuitState.HALF_OPEN;
  }
}

/**
 * Default circuit breaker instance for API calls
 */
export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,     // Open after 5 failures
  successThreshold: 2,     // Close after 2 successes
  timeout: 30000,          // 30 seconds
  name: 'api-backend',
});

/**
 * Circuit breaker for optimization calls (more tolerant)
 */
export const optimizationCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,     // Open after 3 failures
  successThreshold: 1,     // Close after 1 success
  timeout: 60000,          // 60 seconds (optimization takes time)
  name: 'optimization-service',
});

