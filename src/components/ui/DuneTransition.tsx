"use client";

import { useEffect, useRef, useState } from "react";

interface DuneTransitionProps {
  toColor?: string;
  height?: number;
  /** Stroke color for contour lines (defaults to sand/light) */
  lineColor?: string;
}

export default function DuneTransition({
  toColor = "#F7F4EB",
  height = 300,
  lineColor = "#F7F4EB",
}: DuneTransitionProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Real dune silhouette: asymmetric humps, steep leeward, gentle windward
  // Viewbox: 1440 x 260. Bottom fill starts around y=180-220, peaks vary 60-130px high
  const duneFill =
    "M0,260 L0,198" +
    " C18,196 38,192 62,188" +            // gentle windward approach
    " C98,182 118,174 148,162" +          // rising to first small hump
    " C170,152 182,148 196,150" +         // crest, slightly asymmetric
    " C216,153 228,164 252,170" +         // steep leeward drop
    " C278,178 308,182 348,176" +         // trough between dunes
    " C382,170 402,158 430,136" +         // rising steeply to main dune
    " C452,118 466,102 488,94" +          // approaching the peak
    " C506,86 518,84 534,88" +            // peak (tallest dune ~y=84)
    " C556,95 572,110 596,126" +          // leeward descent
    " C626,146 652,162 684,170" +         // settling into trough
    " C714,177 740,178 768,172" +         // slight rise
    " C798,164 820,148 848,138" +         // secondary hump
    " C868,130 882,128 898,132" +         // secondary crest
    " C918,137 934,148 958,158" +         // leeward of secondary
    " C984,168 1008,174 1040,172" +       // another small trough
    " C1068,169 1088,160 1112,148" +      // third smaller hump
    " C1130,138 1142,134 1158,136" +      // crest
    " C1178,139 1194,150 1218,162" +      // descent
    " C1248,176 1278,184 1318,188" +      // broad gentle slope
    " C1356,192 1392,194 1440,196" +      // windward tail
    " L1440,260 Z";

  // Contour lines — each is an upward offset of the fill silhouette
  // Offset increments: 14px each, so ~10 lines before going off screen
  const contours: { d: string; elev: string; opacity: number; width: number; delay: number }[] = [
    {
      d: "M0,184 C18,182 38,178 62,174 C98,168 118,160 148,148 C170,138 182,134 196,136 C216,139 228,150 252,156 C278,164 308,168 348,162 C382,156 402,144 430,122 C452,104 466,88 488,80 C506,72 518,70 534,74 C556,81 572,96 596,112 C626,132 652,148 684,156 C714,163 740,164 768,158 C798,150 820,134 848,124 C868,116 882,114 898,118 C918,123 934,134 958,144 C984,154 1008,160 1040,158 C1068,155 1088,146 1112,134 C1130,124 1142,120 1158,122 C1178,125 1194,136 1218,148 C1248,162 1278,170 1318,174 C1356,178 1392,180 1440,182",
      elev: "1140m", opacity: 0.55, width: 0.8, delay: 0.05,
    },
    {
      d: "M0,170 C18,168 38,164 62,160 C98,154 118,146 148,134 C170,124 182,120 196,122 C216,125 228,136 252,142 C278,150 308,154 348,148 C382,142 402,130 430,108 C452,90 466,74 488,66 C506,58 518,56 534,60 C556,67 572,82 596,98 C626,118 652,134 684,142 C714,149 740,150 768,144 C798,136 820,120 848,110 C868,102 882,100 898,104 C918,109 934,120 958,130 C984,140 1008,146 1040,144 C1068,141 1088,132 1112,120 C1130,110 1142,106 1158,108 C1178,111 1194,122 1218,134 C1248,148 1278,156 1318,160 C1356,164 1392,166 1440,168",
      elev: "", opacity: 0.32, width: 0.55, delay: 0.14,
    },
    {
      d: "M0,156 C18,154 38,150 62,146 C98,140 118,132 148,120 C170,110 182,106 196,108 C216,111 228,122 252,128 C278,136 308,140 348,134 C382,128 402,116 430,94 C452,76 466,60 488,52 C506,44 518,42 534,46 C556,53 572,68 596,84 C626,104 652,120 684,128 C714,135 740,136 768,130 C798,122 820,106 848,96 C868,88 882,86 898,90 C918,95 934,106 958,116 C984,126 1008,132 1040,130 C1068,127 1088,118 1112,106 C1130,96 1142,92 1158,94 C1178,97 1194,108 1218,120 C1248,134 1278,142 1318,146 C1356,150 1392,152 1440,154",
      elev: "1160m", opacity: 0.45, width: 0.7, delay: 0.22,
    },
    {
      d: "M0,141 C18,139 38,135 62,131 C98,125 118,117 148,105 C170,95 182,91 196,93 C216,96 228,107 252,113 C278,121 308,125 348,119 C382,113 402,101 430,79 C452,61 466,45 488,37 C506,29 518,27 534,31 C556,38 572,53 596,69 C626,89 652,105 684,113 C714,120 740,121 768,115 C798,107 820,91 848,81 C868,73 882,71 898,75 C918,80 934,91 958,101 C984,111 1008,117 1040,115 C1068,112 1088,103 1112,91 C1130,81 1142,77 1158,79 C1178,82 1194,93 1218,105 C1248,119 1278,127 1318,131 C1356,135 1392,137 1440,139",
      elev: "", opacity: 0.25, width: 0.5, delay: 0.30,
    },
    {
      d: "M0,126 C18,124 38,120 62,116 C98,110 118,102 148,90 C170,80 182,76 196,78 C216,81 228,92 252,98 C278,106 308,110 348,104 C382,98 402,86 430,64 C452,46 466,30 488,22 C506,14 518,12 534,16 C556,23 572,38 596,54 C626,74 652,90 684,98 C714,105 740,106 768,100 C798,92 820,76 848,66 C868,58 882,56 898,60 C918,65 934,76 958,86 C984,96 1008,102 1040,100 C1068,97 1088,88 1112,76 C1130,66 1142,62 1158,64 C1178,67 1194,78 1218,90 C1248,104 1278,112 1318,116 C1356,120 1392,122 1440,124",
      elev: "1180m", opacity: 0.38, width: 0.65, delay: 0.38,
    },
    {
      d: "M0,110 C18,108 38,104 62,100 C98,94 118,86 148,74 C170,64 182,60 196,62 C216,65 228,76 252,82 C278,90 308,94 348,88 C382,82 402,70 430,48 C452,30 466,14 488,6 C506,-2 518,-4 534,0 C556,7 572,22 596,38 C626,58 652,74 684,82 C714,89 740,90 768,84 C798,76 820,60 848,50 C868,42 882,40 898,44 C918,49 934,60 958,70 C984,80 1008,86 1040,84 C1068,81 1088,72 1112,60 C1130,50 1142,46 1158,48 C1178,51 1194,62 1218,74 C1248,88 1278,96 1318,100 C1356,104 1392,106 1440,108",
      elev: "", opacity: 0.18, width: 0.42, delay: 0.46,
    },
    {
      d: "M0,93 C40,89 80,82 130,68 C162,58 178,50 196,48 C220,50 238,62 262,68 C290,76 318,78 350,72 C382,66 408,52 436,30 C458,12 474,-4 492,-10 C512,-16 528,-14 544,-8 C568,2 588,18 614,36 C642,56 668,72 696,78 C724,83 750,82 776,76 C806,68 828,52 852,40 C874,30 888,28 906,34 C926,40 944,52 966,62 C990,72 1014,76 1042,74 C1070,71 1090,62 1114,50 C1134,40 1146,36 1162,38 C1184,42 1200,54 1226,66 C1256,80 1286,88 1320,91 C1366,95 1408,93 1440,92",
      elev: "1200m", opacity: 0.28, width: 0.55, delay: 0.54,
    },
  ];

  return (
    <div
      className="relative w-full overflow-hidden pointer-events-none"
      style={{ height, background: "transparent", marginBottom: -2 }}
      aria-hidden="true"
    >
      <svg
        ref={ref}
        className="absolute bottom-0 left-0 w-full"
        viewBox={`0 0 1440 ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >

        {/* Contour lines — animate in from right to left */}
        {contours.map((c, i) => (
          <g key={i}>
            <path
              d={c.d}
              fill="none"
              stroke={lineColor}
              strokeWidth={i % 3 === 0 ? c.width * 1.6 : c.width}
              strokeOpacity={i % 3 === 0 ? c.opacity * 1.4 : c.opacity}
              strokeLinecap="round"
              style={{
                strokeDasharray: 3200,
                strokeDashoffset: isVisible ? 0 : 3200,
                transition: `stroke-dashoffset 3.2s cubic-bezier(0.4,0,0.2,1) ${c.delay}s`,
              }}
            />
            {c.elev && (
              <text
                x={52 + i * 6}
                y={Number(c.d.match(/C18,(\d+)/)?.[1] ?? 100) - 4}
                fontFamily="'IBM Plex Mono',monospace"
                fontSize="7.5"
                fill={lineColor}
                fillOpacity={isVisible ? c.opacity * 1.5 : 0}
                letterSpacing="1.5"
                style={{ transition: `fill-opacity 1s ease ${c.delay + 0.9}s` }}
              >
                {c.elev}
              </text>
            )}
          </g>
        ))}

        {/* Main dune fill — the organic silhouette */}
        <path
          d={duneFill}
          fill={toColor}
        />

        {/* Second layer — slightly lighter/narrower for depth illusion */}
        <path
          d={
            "M0,260 L0,210" +
            " C40,207 80,202 120,196" +
            " C160,190 196,182 230,175" +
            " C260,168 280,166 306,170" +
            " C336,175 362,186 400,190" +
            " C438,194 470,192 508,184" +
            " C548,174 578,156 612,140" +
            " C640,126 660,118 682,116" +
            " C706,114 724,120 746,130" +
            " C774,143 800,160 836,170" +
            " C868,178 900,180 936,174" +
            " C968,167 994,154 1022,144" +
            " C1046,136 1064,132 1086,136" +
            " C1112,141 1132,154 1160,164" +
            " C1194,176 1232,184 1280,188" +
            " C1328,192 1388,194 1440,196" +
            " L1440,260 Z"
          }
          fill={toColor}
          fillOpacity="0.55"
        />

        {/* Metadata — bottom corners */}
        <g opacity={isVisible ? 0.28 : 0} style={{ transition: "opacity 1.2s ease 1.6s" }}>
          <text x="24" y={height - 12}
            fontFamily="'IBM Plex Mono',monospace" fontSize="6"
            fill={lineColor} letterSpacing="0.8">
            0 ─── 50km ─── 100km
          </text>
          <text x="1416" y={height - 12}
            fontFamily="'IBM Plex Mono',monospace" fontSize="6"
            fill={lineColor} letterSpacing="0.5" textAnchor="end">
            ÉQUIDISTANCE 20m · CARTE DU MAROC
          </text>
        </g>
      </svg>
    </div>
  );
}
