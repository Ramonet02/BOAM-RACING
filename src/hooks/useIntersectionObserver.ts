"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Observes when a target element enters the viewport.
 * Uses a "once" pattern — after the element becomes visible the observer
 * disconnects so the element stays visible permanently.
 */
export function useIntersectionObserver(
  ref: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit,
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, ...options },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options, isVisible]);

  return isVisible;
}
