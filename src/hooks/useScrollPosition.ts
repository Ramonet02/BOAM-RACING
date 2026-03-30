"use client";

import { useEffect, useState } from "react";

/**
 * Returns the current `window.scrollY` value, throttled via
 * `requestAnimationFrame` for smooth performance.
 */
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Capture initial position
    setScrollY(window.scrollY);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return scrollY;
}
