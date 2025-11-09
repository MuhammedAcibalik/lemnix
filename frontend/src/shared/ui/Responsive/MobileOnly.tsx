/**
 * MobileOnly Component
 * Renders children only on mobile devices
 *
 * @module shared/ui/Responsive
 * @version 2.0.0
 */

import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";

export interface MobileOnlyProps {
  readonly children: React.ReactNode;
}

export const MobileOnly: React.FC<MobileOnlyProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!isMobile) return null;

  return <>{children}</>;
};
