/**
 * @fileoverview Card Component - Barrel Export
 * @module shared/ui/Card
 */

// Export v3 as primary
export {
  CardV3 as Card,
  CardV3,
  MetricCard,
  DashboardCard,
  FeatureCard,
  GlassCard,
} from "./Card.v3";
export type { CardV3Props as CardProps } from "./Card.v3";

// Legacy exports for backward compatibility
export { Card as CardLegacy } from "./Card";

