"use client";

import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  label: string;
  className?: string;
}

export default function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
  label,
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Exponential ease-out
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * target);

      setDisplayValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration]);

  const formatted = displayValue.toLocaleString("es-ES");

  return (
    <div ref={ref} className={`text-center ${className}`}>
      <span className="font-display text-5xl font-bold text-sand md:text-6xl lg:text-7xl">
        {formatted}
        {suffix}
      </span>
      <p className="mt-2 font-body text-sm uppercase tracking-widest text-cream/70">
        {label}
      </p>
    </div>
  );
}
