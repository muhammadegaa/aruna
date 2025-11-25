"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type HoverScaleProps = {
  children: ReactNode;
  className?: string;
  scale?: number;
};

export default function HoverScale({
  children,
  className = "",
  scale = 1.05,
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

