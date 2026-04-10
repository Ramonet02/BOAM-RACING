"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export default function TestPathPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 25,
    restDelta: 0.001
  });

  // EXACT PATH FROM VECTOR 1.SVG
  const pathData = "M174.396 0.340382C174.396 0.340382 408.895 248.84 174.396 323.84C-60.1037 398.84 -104.104 620.34 338.396 615.84C780.896 611.34 789.896 1376.84 1263.4 1314.84C1736.9 1252.84 1878.9 1376.84 2121.9 1531.84C2364.9 1686.84 2165.9 2155.84 2537.9 2288.84C2909.9 2421.84 2470.06 2827.17 2427.4 3085.34";

  return (
    <main ref={containerRef} className="relative bg-[#050505] w-full h-[600vh] overflow-x-hidden">
      {/* 1. Blank Start Hint */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 text-white/20 font-body text-[10px] tracking-[0.5em] uppercase"
        style={{ opacity: useTransform(smoothProgress, [0, 0.02], [1, 0]) }}
      >
        Utilizando el trazo del Vector 1.svg
      </motion.div>

      {/* 2. Path Overlay - DRAW ON SCROLL */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-0">
        <svg
          viewBox="0 0 2687 3086"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full p-20"
        >
          {/* Guide guide (extremely faint) */}
          <path
            d={pathData}
            fill="none"
            stroke="var(--color-sand)"
            strokeWidth="2"
            className="opacity-[0.05]"
          />
          
          {/* The Active Trail */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="var(--color-sand)"
            strokeWidth="8"
            strokeLinecap="round"
            style={{ 
              pathLength: smoothProgress,
              filter: "drop-shadow(0 0 15px var(--color-sand))"
            }}
            className="opacity-70"
          />
        </svg>
      </div>

      {/* 3. Floating Content - REVEALED BY PATH */}
      <div className="relative z-10 w-full h-full pointer-events-none">
         <OrganicSection milestone={0.15} title="El Plano" text="Siguiendo las coordenadas exactas de tu diseño." />
         <OrganicSection milestone={0.4} title="Fluidez Real" text="Curvas Bézier que dictan el ritmo del viaje." />
         <OrganicSection milestone={0.65} title="Territorio" text="Cada giro cuenta una parte de la historia." />
         <OrganicSection milestone={0.9} title="Destino Final" text="Donde el Vector se convierte en realidad." />
      </div>
    </main>
  );
}

function OrganicSection({ milestone, title, text }: { milestone: number, title: string, text: string }) {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, 
    [milestone - 0.08, milestone - 0.03, milestone + 0.03, milestone + 0.08], 
    [0, 1, 1, 0]
  );
  const scale = useTransform(scrollYProgress, [milestone - 0.1, milestone], [0.9, 1]);

  return (
    <motion.div 
      style={{ opacity, scale, top: `${milestone * 100}%` }}
      className="absolute left-1/2 -translate-x-1/2 text-center w-full max-w-xl px-12"
    >
      <h2 className="font-display text-4xl md:text-6xl text-white mb-6 uppercase">{title}</h2>
      <p className="font-body text-[var(--color-sand)]/50 text-lg md:text-xl italic max-w-md mx-auto">{text}</p>
    </motion.div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrganicMarker({ smoothProgress }: { smoothProgress: any }) {
  // approximation for the Car in the new 2687x3086 space
  // We need to follow the path points more closely
  const xPos = useTransform(smoothProgress, 
    [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], 
    [174, 174, 150, 400, 1200, 1500, 2100, 2500, 2800, 2600, 2427]
  );

  return (
    <motion.div
      style={{ 
        position: 'fixed',
        left: useTransform(xPos, x => `${(x / 2687) * 100}%`),
        top: '50%',
        translateY: '-50%',
        translateX: '-50%',
      }}
      className="z-50 pointer-events-none"
    >
       <div className="w-2 h-2 bg-[var(--color-sand)] rounded-full shadow-[0_0_20px_var(--color-sand)]"></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-[var(--color-sand)]/10 animate-ping"></div>

       {/* Dust Trail */}
       <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4 h-32 bg-gradient-to-t from-transparent via-[var(--color-sand)]/10 to-transparent opacity-30 blur-2xl"></div>
    </motion.div>
  );
}
