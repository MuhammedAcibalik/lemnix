/**
 * @fileoverview Zoom-Aware Global Styles
 * @module shared/lib/zoom-aware/styles
 * @description Global CSS utilities for zoom/scale-aware UI elements
 */

import { fluid, safeMinWidth, safeMaxWidth, pxToRem } from "./fluid";

/**
 * Zoom-aware container styles
 * Prevents cards and containers from becoming too small or too large
 */
export const zoomAwareContainer = {
  width: "100%",
  minWidth: safeMinWidth(pxToRem(280)), // Minimum 280px, but never exceed 100%
  maxWidth: safeMaxWidth("100%"),
  overflow: "hidden",
  boxSizing: "border-box" as const,
} as const;

/**
 * Zoom-aware card styles
 * Cards adapt to zoom level without breaking layout
 */
export const zoomAwareCard = {
  ...zoomAwareContainer,
  minWidth: safeMinWidth(pxToRem(240)), // Minimum card width
  maxWidth: safeMaxWidth("100%"),
  width: "100%",
  overflow: "hidden",
  boxSizing: "border-box" as const,
} as const;

/**
 * Zoom-aware button styles
 * Buttons maintain proper size at any zoom level
 */
export const zoomAwareButton = {
  minWidth: safeMinWidth(pxToRem(80)), // Minimum button width
  maxWidth: safeMaxWidth("100%"),
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  boxSizing: "border-box" as const,
} as const;

/**
 * Zoom-aware text styles
 * Text truncates properly at any zoom level
 */
export const zoomAwareText = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
  wordBreak: "break-word" as const,
  overflowWrap: "break-word" as const,
} as const;

/**
 * Zoom-aware multi-line text styles
 * Multi-line text wraps properly
 */
export const zoomAwareTextMultiLine = {
  overflow: "hidden",
  wordBreak: "break-word" as const,
  overflowWrap: "break-word" as const,
  hyphens: "auto" as const,
} as const;

/**
 * Zoom-aware flex container
 * Flex containers adapt to zoom without breaking
 */
export const zoomAwareFlex = {
  display: "flex",
  flexWrap: "wrap" as const,
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box" as const,
} as const;

/**
 * Zoom-aware grid container
 * Grid containers adapt to zoom without breaking
 */
export const zoomAwareGrid = {
  display: "grid",
  width: "100%",
  minWidth: 0,
  overflow: "hidden",
  boxSizing: "border-box" as const,
} as const;

/**
 * Zoom-aware image styles
 * Images scale properly at any zoom level
 */
export const zoomAwareImage = {
  maxWidth: "100%",
  height: "auto",
  objectFit: "contain" as const,
  boxSizing: "border-box" as const,
} as const;

/**
 * Zoom-aware input styles
 * Inputs maintain proper size at any zoom level
 */
export const zoomAwareInput = {
  width: "100%",
  minWidth: safeMinWidth(pxToRem(120)),
  maxWidth: safeMaxWidth("100%"),
  boxSizing: "border-box" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;
