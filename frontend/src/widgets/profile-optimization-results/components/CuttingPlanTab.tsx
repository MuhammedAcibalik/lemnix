/**
 * @fileoverview Cutting Plan Tab Component for Profile Optimization Results
 * @module CuttingPlanTab
 * @version 1.0.0
 */

import React from "react";
import { Alert, AlertTitle } from "@mui/material";
import { messages } from "../constants";

/**
 * Cutting Plan Tab Component
 */
export const CuttingPlanTab: React.FC = () => {
  return (
    <Alert severity="info">
      <AlertTitle>{messages.cuttingPlan.title}</AlertTitle>
      {messages.cuttingPlan.description}
    </Alert>
  );
};
