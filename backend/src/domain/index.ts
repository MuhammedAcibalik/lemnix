/**
 * Domain Layer Exports
 *
 * @module domain
 * @version 1.0.0
 */

// Entities
export * from "./entities/CuttingList";
export * from "./entities/CuttingListItem";
export * from "./entities/ProductionPlan";
export * from "./entities/ProductionPlanItem";

// Value Objects
export * from "./valueObjects/WeekNumber";
export * from "./valueObjects/Email";
export * from "./valueObjects/Quantity";

// Repository Interfaces
export * from "./repositories/IRepository";
export * from "./repositories/IUnitOfWork";
export * from "./repositories/ICuttingListRepository";
// Export PaginationOptions and PaginatedResult only from ICuttingListRepository to avoid duplicate
export type {
  PaginationOptions,
  PaginatedResult,
} from "./repositories/ICuttingListRepository";
export * from "./repositories/IProductionPlanRepository";
export * from "./repositories/IProductCategoryRepository";

// Specifications
export * from "./specifications/ISpecification";
export * from "./specifications/BaseSpecification";
export * from "./specifications/CuttingListSpecifications";
