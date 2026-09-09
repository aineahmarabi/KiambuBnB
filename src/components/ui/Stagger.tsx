"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface StaggerProps extends HTMLMotionProps<"div"> {
  stagger?: number;
  delay?: number;
}

export function StaggerGroup({ children, className, stagger = 0.12, delay = 0, ...props }: StaggerProps) {
  return (
    <motion.div
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}
