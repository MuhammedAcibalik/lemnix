/**
 * @fileoverview CardV2 compatibility wrapper
 * @description Thin alias around the v3 `Card` component so that existing
 * imports from `@/shared/ui/Card/Card.v2` continue to work without runtime 404s.
 */

export { Card as CardV2 } from "./Card";
export type { CardProps as CardV2Props } from "./Card";
