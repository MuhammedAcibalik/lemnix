/**
 * Stagger Animation Component
 * Animates children with stagger delay
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface StaggerProps {
  readonly children: React.ReactNode;
  readonly staggerDelay?: number;
  readonly duration?: number;
  readonly direction?: "forward" | "reverse";
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 0.1,
  duration = 0.5,
  direction = "forward",
}) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        staggerDirection: direction === "reverse" ? -1 : 1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
};
