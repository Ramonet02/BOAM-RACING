"use client";

import { useRef, type ReactNode } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

type Variant = "fade-up" | "slide-left" | "slide-right" | "scale-in" | "blur-in";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  variant = "fade-up",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  // Map variant prop to the CSS class name used in globals.css.
  // "fade-up" is the default animate-on-scroll behaviour (no extra class needed).
  const variantClass = variant === "fade-up" ? "" : variant;

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${variantClass} ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
