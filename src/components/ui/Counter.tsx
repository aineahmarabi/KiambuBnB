"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function Counter({ value, decimals = 0, suffix = "", className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: easeOutExpo,
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className={cn(className)}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
