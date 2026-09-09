"use client";

import { useEffect, useState } from "react";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: easeOutExpo } },
};

export const staggerContainer = (stagger = 0.12, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
};

// A positive bottom margin extends the trigger zone *below* the visible
// viewport, so reveals start animating before they're actually on screen
// and are finished settling by the time they scroll into view — the
// previous negative margin required content to already be 80px inside the
// viewport before it would even begin, which read as sluggish/late on a
// normal scroll.
export const viewportOnce = { once: true, margin: "0px 0px 150px 0px" };

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}
