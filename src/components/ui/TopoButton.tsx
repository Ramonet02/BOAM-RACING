"use client";

import { ReactNode, useRef, useState } from "react";
import { topoState } from "./topoState";

interface TopoButtonProps {
  children: ReactNode;
  className?: string;
}

// Vista cenital: anillos concéntricos alrededor del botón (rx:ry ≈ 2.5:1)
const RINGS = [
  { rx: 72,  ry: 28, opacity: 0.55, sw: 1.4,  delay: 0     },
  { rx: 110, ry: 44, opacity: 0.40, sw: 1.1,  delay: 0.05  },
  { rx: 152, ry: 60, opacity: 0.27, sw: 0.85, delay: 0.10  },
  { rx: 196, ry: 78, opacity: 0.16, sw: 0.65, delay: 0.15  },
  { rx: 242, ry: 96, opacity: 0.08, sw: 0.45, delay: 0.20  },
];

export default function TopoButton({ children, className = "" }: TopoButtonProps) {
  const [on, setOn] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    setOn(true);
    if (wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      topoState.target = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
  };

  const handleLeave = () => {
    setOn(false);
    topoState.target = null; // canvas lerps intensity back to 0 smoothly
  };

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Contour rings — vista cenital, centrados en el botón */}
      <svg
        aria-hidden="true"
        style={{
          position:      "absolute",
          top:           "50%",
          left:          "50%",
          transform:     "translate(-50%, -50%)",
          width:         0,
          height:        0,
          overflow:      "visible",
          pointerEvents: "none",
          zIndex:        0,
        }}
      >
        {RINGS.map((r, i) => (
          <ellipse
            key={i}
            cx={0}
            cy={0}
            rx={r.rx}
            ry={r.ry}
            stroke="#C65F3B"
            strokeWidth={r.sw}
            fill="none"
            style={{
              strokeOpacity: on ? r.opacity : 0,
              transform:     on ? "scale(1)" : "scale(0.05)",
              transformOrigin: "0 0",
              transition: on
                ? `stroke-opacity 0.4s ease ${r.delay}s,
                   transform      0.5s cubic-bezier(0.16,1,0.3,1) ${r.delay}s`
                : `stroke-opacity 0.18s ease,
                   transform      0.18s ease`,
            }}
          />
        ))}
      </svg>

      {/* Botón — se acerca al viewer con scale uniforme */}
      <div
        style={{
          position:   "relative",
          zIndex:     1,
          transform:  on ? "scale(1.08)" : "scale(1)",
          filter:     on
            ? "drop-shadow(0 8px 20px rgba(198,95,59,0.40))"
            : "none",
          transition: "transform 0.45s cubic-bezier(0.16,1,0.3,1), filter 0.4s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
