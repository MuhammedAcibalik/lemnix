/**
 * LEMNİX React Query Provider
 * Centralized server state management
 * 
 * @module app/providers
 * @version 1.0.0 - FSD Compliant
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * Query client configuration interface
 * Following Interface Segregation Principle
 */
interface QueryConfig {
  readonly staleTime: number;
  readonly gcTime: number;
  readonly refetchOnWindowFocus: boolean;
  readonly maxRetries: number;
  readonly retryDelay: (attemptIndex: number) => number;
  readonly mutationRetries: number;
  readonly mutationRetryDelay: number;
}

/**
 * Error response interface for type safety
 */
interface ErrorResponse {
  readonly response?: {
    readonly status?: number;
  };
}

/**
 * Query retry strategy interface
 * Following Single Responsibility Principle
 */
interface RetryStrategy {
  shouldRetry(failureCount: number, error: unknown): boolean;
}

/**
 * Default retry strategy implementation
 * Following Open/Closed Principle - can be extended
 */
class DefaultRetryStrategy implements RetryStrategy {
  constructor(private readonly maxRetries: number) {}

  shouldRetry(failureCount: number, error: unknown): boolean {
    // Don't retry on 4xx errors
    if (this.isClientError(error)) {
      return false;
    }
    
    // Retry up to maxRetries for other errors
    return failureCount < this.maxRetries;
  }

  private isClientError(error: unknown): boolean {
    if (!error || typeof error !== 'object' || !('response' in error)) {
      return false;
    }
    
    const errorResponse = error as ErrorResponse;
    const status = errorResponse.response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }
}

/**
 * Query client factory
 * Following Single Responsibility Principle
 */
class QueryClientFactory {
  static create(config: QueryConfig, retryStrategy: RetryStrategy): QueryClient {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: config.staleTime,
          gcTime: config.gcTime,
          refetchOnWindowFocus: config.refetchOnWindowFocus,
          retry: (failureCount, error) => retryStrategy.shouldRetry(failureCount, error),
          retryDelay: config.retryDelay,
        },
        mutations: {
          retry: config.mutationRetries,
          retryDelay: config.mutationRetryDelay,
        },
      },
    });
  }
}

/**
 * Default configuration factory
 * Following Single Responsibility Principle
 */
class QueryConfigFactory {
  static createDefault(): QueryConfig {
    return {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Refetch on window focus (production behavior)
      refetchOnWindowFocus: import.meta.env.PROD,
      
      // Max retries for queries
      maxRetries: 2,
      
      // Retry delay: exponential backoff
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Mutation retries
      mutationRetries: 1,
      mutationRetryDelay: 1000,
    };
  }
}

/**
 * Development tools configuration
 */
interface DevToolsConfig {
  readonly enabled: boolean;
  readonly initialIsOpen: boolean;
  readonly position: 'top' | 'bottom' | 'left' | 'right' | undefined;
}

/**
 * Development tools factory
 * Following Single Responsibility Principle
 */
class DevToolsFactory {
  static createDefault(): DevToolsConfig {
    return {
      enabled: import.meta.env.DEV,
      initialIsOpen: false,
      position: 'bottom',
    };
  }

  static render(config: DevToolsConfig): React.ReactNode {
    if (!config.enabled) {
      return null;
    }

    return (
      <ReactQueryDevtools
        initialIsOpen={config.initialIsOpen}
        {...(config.position && { position: config.position })}
      />
    );
  }
}

/**
 * Provider props interface
 * Following Interface Segregation Principle
 */
interface QueryProviderProps {
  readonly children: React.ReactNode;
  readonly queryClient?: QueryClient;
  readonly devToolsConfig?: DevToolsConfig;
}

/**
 * React Query Provider Component
 * 
 * Following SOLID principles:
 * - Single Responsibility: Only handles provider rendering
 * - Open/Closed: Extensible through dependency injection
 * - Liskov Substitution: Can accept any QueryClient implementation
 * - Interface Segregation: Clean, focused interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ 
  children,
  queryClient,
  devToolsConfig,
}) => {
  // Use dependency injection or create default instances
  const client = queryClient ?? QueryClientFactory.create(
    QueryConfigFactory.createDefault(),
    new DefaultRetryStrategy(2)
  );
  
  const devTools = devToolsConfig ?? DevToolsFactory.createDefault();

  return (
    <QueryClientProvider client={client}>
      {children}
      {DevToolsFactory.render(devTools)}
    </QueryClientProvider>
  );
};

/**
 * Convenience factory for creating pre-configured provider
 * Following Factory Pattern
 */
export class QueryProviderFactory {
  static createWithCustomConfig(
    config: Partial<QueryConfig>,
    retryStrategy?: RetryStrategy
  ): React.FC<Pick<QueryProviderProps, 'children'>> {
    const fullConfig = { ...QueryConfigFactory.createDefault(), ...config };
    const strategy = retryStrategy ?? new DefaultRetryStrategy(fullConfig.maxRetries);
    const client = QueryClientFactory.create(fullConfig, strategy);

    return ({ children }) => (
      <QueryProvider queryClient={client}>
        {children}
      </QueryProvider>
    );
  }
}

// Export types for external use
export type { QueryConfig, RetryStrategy, DevToolsConfig, QueryProviderProps };

