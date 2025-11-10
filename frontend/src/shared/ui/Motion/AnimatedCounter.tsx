/**
 * AnimatedCounter Component
 * Count up animation from 0 to target value
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export interface AnimatedCounterProps {
  readonly value: number;
  readonly duration?: number;
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
}) => {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
    });

    const unsubscribe = motionValue.on("change", (latest) => {
      const formatted = latest.toFixed(decimals);
      setDisplayValue(formatted);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, decimals, motionValue]);

  return (
    <motion.span>
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
};
