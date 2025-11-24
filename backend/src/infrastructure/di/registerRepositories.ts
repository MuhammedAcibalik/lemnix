/**
 * Repository Registration
 *
 * Registers all repositories with DI container
 *
 * @module infrastructure/di/registerRepositories
 * @version 1.0.0
 */

import { DIContainer } from "./DIContainer";
import { RepositoryFactory } from "../persistence/RepositoryFactory";

/**
 * Register all repositories
 */
export function registerRepositories(container: DIContainer): void {
  const factory = new RepositoryFactory();

  // Repositories are already registered in DIContainer constructor
  // This function can be extended for additional registrations
}
