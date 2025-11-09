/**
 * @fileoverview TabPanel Component for Optimization Info Dialog
 * @module TabPanel
 * @version 1.0.0
 */

import React from "react";
import { Box } from "@mui/material";
import { TabPanelProps } from "../types";

/**
 * TabPanel Component
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`info-tabpanel-${index}`}
      aria-labelledby={`info-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};
