"use client";

import { useEffect, useRef, useState } from "react";

interface TopoDividerProps {
  location?: string;
  coords?: string;
  altitude?: string;
  type?: "atlas" | "dunes" | "plateau" | "gorges";
  extreme?: boolean;
  reverse?: boolean;
}

export default function TopoDivider({ 
  location, 
  coords, 
  altitude, 
  type = "atlas", 
  extreme = false,
  reverse = false 
}: TopoDividerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  const renderPaths = () => {
    if (type === "atlas") {
      // High Atlas Peaks - Sharp but curved (Organic)
      return extreme ? (
        <>
          <path d="M0,80 C50,0 100,160 150,40 C200,-20 250,140 300,60 C350,10 400,120 450,30 C500,-40 550,150 600,50 C650,20 700,160 750,40 C800,-10 850,130 900,50 C950,20 1000,150 1050,40 C1100,0 1150,120 1200,80" className="topo-line-main" />
          <path d="M0,100 C60,20 110,180 160,60 C210,0 260,160 310,80 C360,30 410,140 460,50 C510,-20 560,170 610,70 C660,40 710,180 760,60 C810,10 860,150 910,70 C960,40 1010,170 1060,60 C1110,20 1160,140 1200,100" className="topo-line-sub" />
        </>
      ) : (
        <>
          <path d="M0,50 Q100,10 200,60 T400,20 T600,70 T800,30 T1000,80 T1200,50" className="topo-line-main" />
          <path d="M0,70 Q120,30 250,80 T450,40 T650,90 T850,50 T1050,100 T1200,70" className="topo-line-sub" />
        </>
      );
    } else if (type === "dunes") {
      // High Dunes / Erg Chebbi style - Wide Flowing curves
      return extreme ? (
        <>
          <path d="M0,120 C150,-50 300,200 450,30 C600,250 850,-50 1200,120" className="topo-line-main" />
          <path d="M0,140 C150,-30 300,220 450,50 C600,270 850,-30 1200,140" className="topo-line-sub" />
        </>
      ) : (
        <>
          <path d="M0,50 C200,20 400,90 600,50 C800,10 1000,90 1200,50" className="topo-line-main" />
          <path d="M0,70 C200,40 400,110 600,70 C800,30 1000,110 1200,70" className="topo-line-sub" />
        </>
      );
    } else if (type === "gorges") {
      // Todra Gorges - Steep verticality but rounded edges
      return (
        <>
          <path d="M0,30 C150,30 250,30 280,30 C300,30 300,130 320,130 C350,130 550,130 580,130 C600,130 600,40 620,40 C650,40 850,40 880,40 C900,40 900,110 920,110 C950,110 1150,110 1200,110" className="topo-line-main" />
          <path d="M0,50 C140,50 240,50 270,50 C290,50 290,120 310,120 C340,120 560,120 590,120 C610,120 610,60 630,60 C660,60 840,60 870,60 C890,60 890,100 910,100 C940,100 1160,100 1200,100" className="topo-line-sub" />
        </>
      );
    } else {
      // Plateau style - Slight ripples
      return (
        <>
          <path d="M0,60 Q300,50 600,60 T1200,60" className="topo-line-main" />
          <path d="M0,80 Q300,70 600,80 T1200,80" className="topo-line-sub" />
        </>
      );
    }
  };

  return (
    <div className={`relative w-full overflow-hidden py-12 ${reverse ? "rotate-180" : ""}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 1200 150"
        className={`w-full h-auto fill-none stroke-[var(--color-sand)] transition-all duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        style={{ strokeWidth: 0.5 }}
      >
        <g 
          className={isVisible ? "animate-topo-draw" : ""}
          style={{ strokeDasharray: 1000, strokeDashoffset: isVisible ? 0 : 1000, transition: "stroke-dashoffset 2s ease-out" }}
        >
          {renderPaths()}
        </g>
      </svg>

      {/* Technical Labels */}
      {(location || coords || altitude) && (
        <div className={`absolute inset-0 flex flex-col justify-center px-12 pointer-events-none ${reverse ? "rotate-180" : ""}`}>
          <div className="flex flex-col gap-1 items-start">
            {location && (
              <span className="font-display text-lg text-[var(--color-sand)] opacity-60 tracking-widest uppercase">
                {location}
              </span>
            )}
            <div className="flex gap-4">
              {coords && (
                <span className="font-body text-[10px] text-[var(--color-terracotta)] opacity-50 tracking-[0.3em] font-bold">
                  {coords}
                </span>
              )}
              {altitude && (
                <span className="font-body text-[10px] text-[var(--color-sand)] opacity-40 tracking-[0.3em]">
                  ALT: {altitude}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .topo-line-main { stroke-opacity: 0.4; stroke-width: 1; }
        .topo-line-sub { stroke-opacity: 0.2; stroke-width: 0.5; }
        .topo-line-detail { stroke-opacity: 0.1; stroke-width: 0.3; }
        .animate-topo-draw {
          animation: topo-draw 3s ease-out forwards;
        }
        @keyframes topo-draw {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
