/**
 * Shimmer Effect Component
 * Shimmer/shine effect overlay for buttons, cards, skeletons
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

export interface ShimmerProps {
  readonly children: React.ReactNode;
  readonly duration?: number;
  readonly direction?: "horizontal" | "vertical";
}

const shimmerAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const shimmerAnimationVertical = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

export const Shimmer: React.FC<ShimmerProps> = ({
  children,
  duration = 2,
  direction = "horizontal",
}) => {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: direction === "horizontal" ? "-100%" : 0,
          right: 0,
          bottom: direction === "vertical" ? "-100%" : 0,
          width: direction === "horizontal" ? "100%" : "100%",
          height: direction === "vertical" ? "100%" : "100%",
          background:
            direction === "horizontal"
              ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
              : "linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent)",
          animation: `${direction === "horizontal" ? shimmerAnimation : shimmerAnimationVertical} ${duration}s infinite`,
        },
      }}
    >
      {children}
    </Box>
  );
};
