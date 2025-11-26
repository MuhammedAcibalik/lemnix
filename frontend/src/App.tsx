/**
 * @fileoverview App - Wrapper Component
 * @module App
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";
import { App as ModularApp } from "./app/index";

/**
 * App Wrapper Component
 *
 * This is a wrapper that imports and renders the modularized App component.
 * The original 651-line file has been refactored into a modular structure.
 */
export default function App() {
  return <ModularApp />;
}
