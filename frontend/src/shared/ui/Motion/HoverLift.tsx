/**
 * HoverLift Component
 * Lift effect (translateY + shadow) for cards
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface HoverLiftProps {
  readonly children: React.ReactNode;
  readonly liftAmount?: number;
  readonly duration?: number;
}

export const HoverLift: React.FC<HoverLiftProps> = ({
  children,
  liftAmount = -8,
  duration = 0.2,
}) => {
  return (
    <motion.div
      whileHover={{
        y: liftAmount,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration,
      }}
    >
      {children}
    </motion.div>
  );
};
