/**
 * Pulse Animation Component
 * Pulse/heartbeat animation for badges, status indicators
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface PulseProps {
  readonly children: React.ReactNode;
  readonly intensity?: "low" | "medium" | "high";
  readonly speed?: "slow" | "normal" | "fast";
  readonly glow?: boolean;
}

const intensityScale = {
  low: 1.02,
  medium: 1.05,
  high: 1.1,
};

const speedDuration = {
  slow: 2,
  normal: 1.5,
  fast: 1,
};

export const Pulse: React.FC<PulseProps> = ({
  children,
  intensity = "medium",
  speed = "normal",
  glow = false,
}) => {
  const scale = intensityScale[intensity];
  const duration = speedDuration[speed];

  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
        boxShadow: glow
          ? [
              "0 0 0px rgba(59, 130, 246, 0)",
              `0 0 20px rgba(59, 130, 246, 0.4)`,
              "0 0 0px rgba(59, 130, 246, 0)",
            ]
          : undefined,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};
