"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function ExpeditionPath() {
  const { scrollYProgress } = useScroll();

  // Snappier spring for a faster, more responsive "chase" effect
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  // Map path length to "lead" the viewport aggressively (finishes at 70% scroll)
  const pathLength = useTransform(smoothProgress, [0, 0.70], [0, 1]);

  // OFFICIAL VECTOR FROM USER (Vector 1.svg)
  const officialPath = "M0.41626 149.371C58.0829 62.7039 231.716 -77.5294 464.916 54.8706C698.116 187.271 901.75 173.037 974.416 149.371C1151.92 117.204 1532.02 110.471 1632.42 340.871C1757.92 628.871 1666.42 930.371 1434.92 1084.37C1203.42 1238.37 1195.92 1143.37 1236.42 1396.87C1276.92 1650.37 975.416 1727.37 747.416 1664.87C519.416 1602.37 273.416 1481.37 273.416 1775.37C273.416 2069.37 387.416 2017.37 368.916 2208.87C350.416 2400.37 243.416 2385.37 467.916 2506.87C692.416 2628.37 809.916 2374.37 1100.42 2506.87C1390.92 2639.37 1699.42 2510.87 1633.42 2940.87C1567.42 3370.87 1243.42 3613.37 956.916 3705.37C670.416 3797.37 269.916 3991.87 368.916 4105.87C467.916 4219.87 611.416 4256.37 537.916 4458.87C464.416 4661.37 449.416 4771.37 636.916 4852.37C824.416 4933.37 1184.42 4661.37 1397.92 4756.87C1568.72 4833.27 1819.75 4813.04 1923.92 4793.37";

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <svg
        viewBox="0 0 1924 4869"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full opacity-40 px-0 md:px-20"
      >
        {/* Guide Path (Extremely Faint Sand) */}
        <path
          d={officialPath}
          fill="none"
          stroke="var(--color-sand)"
          strokeWidth="1"
          className="opacity-10"
        />

        {/* The Animated Trail (Organic Viewport-Aware Chase) */}
        <motion.path
          d={officialPath}
          fill="none"
          stroke="var(--color-sand)"
          strokeWidth="6"
          strokeLinecap="round"
          style={{
            pathLength,
            filter: "drop-shadow(0 0 12px var(--color-sand))"
          }}
          className="opacity-80"
        />
      </svg>
    </div>
  );
}
