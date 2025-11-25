"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function StaggerContainer({
  children,
  className = "",
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
}

