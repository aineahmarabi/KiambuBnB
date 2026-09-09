"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { easeOutExpo, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
}

export function Reveal({ children, className, delay = 0, y = 28, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: easeOutExpo, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
