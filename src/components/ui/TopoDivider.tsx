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
  reverse = false,
}: TopoDividerProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Each type = different contour character
  const getContours = () => {
    if (type === "atlas") {
      // Mountain range — tight packed curves with peaks
      return [
        { d: "M-50,160 C60,155 130,145 210,148 C290,151 340,160 420,155 C490,150 530,140 610,138 C690,136 740,148 820,145 C900,142 950,132 1030,130 C1110,128 1170,142 1260,138 C1340,135 1400,128 1480,130", elev: "", w: 0.4, o: 0.06, delay: 0 },
        { d: "M-50,152 C55,146 128,134 208,138 C288,142 342,153 422,147 C494,142 534,130 614,127 C696,124 744,137 826,133 C906,129 956,118 1036,116 C1116,114 1176,130 1268,126 C1350,122 1410,114 1480,116", elev: "2100m", w: 0.5, o: 0.10, delay: 0.08 },
        { d: "M-50,143 C52,136 126,122 206,127 C286,132 344,145 424,138 C496,132 537,119 618,115 C700,111 748,125 830,121 C910,116 961,104 1042,101 C1124,98 1182,116 1274,112 C1356,108 1416,99 1480,101", elev: "", w: 0.6, o: 0.14, delay: 0.15 },
        { d: "M-50,134 C49,126 122,110 204,116 C284,121 346,136 426,129 C498,122 539,107 620,103 C702,98 750,113 834,108 C914,103 965,89 1048,86 C1130,82 1188,102 1280,97 C1362,92 1420,83 1480,86", elev: "2200m", w: 0.7, o: 0.20, delay: 0.22 },
        { d: "M-50,124 C46,115 118,97 202,104 C282,111 348,127 428,119 C500,112 541,95 624,90 C706,85 754,101 838,96 C918,90 969,74 1054,70 C1136,66 1194,88 1286,82 C1368,77 1424,67 1480,70", elev: "", w: 0.6, o: 0.16, delay: 0.29 },
        { d: "M-50,113 C42,103 114,83 200,91 C280,98 350,117 430,108 C502,100 544,81 627,76 C710,71 758,88 844,82 C924,76 975,58 1060,54 C1144,49 1200,73 1292,67 C1374,61 1428,50 1480,53", elev: "2300m", w: 0.85, o: 0.26, delay: 0.36 },
        { d: "M-50,101 C38,90 109,68 197,77 C278,85 351,106 432,96 C504,87 546,66 630,61 C714,56 762,74 848,68 C929,61 980,41 1067,37 C1152,32 1207,58 1300,51 C1382,45 1434,33 1480,36", elev: "", w: 0.7, o: 0.19, delay: 0.43 },
        { d: "M-50,90 C35,78 105,54 195,64 C276,73 352,95 434,85 C506,75 548,52 633,46 C718,40 766,60 852,53 C934,46 985,24 1073,20 C1159,14 1213,42 1308,35 C1390,28 1438,15 1480,18", elev: "2400m", w: 1.0, o: 0.32, delay: 0.50 },
        { d: "M-50,78 C30,64 100,39 191,50 C272,60 354,84 436,73 C508,62 551,37 636,30 C722,23 770,45 857,37 C940,29 991,6 1080,1 C1166,-5 1220,25 1316,18 C1398,10 1443,-3 1480,0", elev: "", w: 0.7, o: 0.15, delay: 0.57 },
        { d: "M-50,65 C25,50 94,23 186,35 C267,46 355,72 438,60 C510,49 554,21 639,13 C726,5 774,29 862,20 C946,11 997,-13 1086,-18 C1174,-24 1228,8 1324,0 C1406,-7 1448,-22 1480,-18", elev: "2500m", w: 0.85, o: 0.22, delay: 0.64 },
        { d: "M-50,52 C18,35 86,6 180,19 C262,31 356,60 440,47 C512,35 556,4 642,-5 C730,-14 779,12 867,3 C952,-6 1003,-32 1094,-38 C1182,-44 1235,-9 1332,-18 C1414,-26 1452,-42 1480,-38", elev: "", w: 0.6, o: 0.12, delay: 0.71 },
        { d: "M-50,38 C10,19 77,-11 173,3 C256,16 358,47 442,33 C514,20 558,-13 644,-23 C733,-33 782,-5 872,-14 C958,-23 1009,-51 1102,-57 C1192,-64 1244,-27 1340,-37 C1422,-46 1456,-63 1480,-58", elev: "2600m", w: 0.9, o: 0.28, delay: 0.78 },
      ];
    } else if (type === "dunes") {
      // Sand dunes — smoother, more sinusoidal, wider spacing
      return [
        { d: "M-50,160 C120,152 280,145 440,155 C580,163 680,160 840,152 C1000,144 1160,150 1320,155 C1400,157 1450,153 1480,155", elev: "", w: 0.4, o: 0.06, delay: 0 },
        { d: "M-50,148 C100,138 260,128 430,140 C570,150 680,148 840,138 C1000,128 1160,136 1320,141 C1400,143 1452,140 1480,141", elev: "1040m", w: 0.5, o: 0.10, delay: 0.1 },
        { d: "M-50,135 C80,122 240,110 416,124 C560,136 676,135 840,123 C1002,111 1162,120 1322,126 C1402,129 1454,126 1480,126", elev: "", w: 0.6, o: 0.15, delay: 0.18 },
        { d: "M-50,122 C60,107 218,92 402,108 C548,122 672,122 840,108 C1004,94 1164,104 1322,110 C1404,113 1456,110 1480,111", elev: "1060m", w: 0.75, o: 0.22, delay: 0.26 },
        { d: "M-50,108 C40,91 196,73 386,91 C534,107 668,108 840,92 C1006,76 1166,88 1322,94 C1404,97 1456,94 1480,95", elev: "", w: 0.65, o: 0.18, delay: 0.34 },
        { d: "M-50,93 C20,74 172,53 370,73 C520,90 664,92 840,75 C1008,57 1168,71 1322,77 C1404,80 1456,77 1480,78", elev: "1080m", w: 0.85, o: 0.28, delay: 0.42 },
        { d: "M-50,78 C0,57 148,33 355,55 C506,73 660,76 840,58 C1010,39 1170,54 1322,60 C1404,63 1456,60 1480,61", elev: "", w: 0.7, o: 0.20, delay: 0.50 },
        { d: "M-50,63 C-18,40 122,12 340,37 C492,56 656,60 840,41 C1012,21 1172,37 1322,43 C1404,46 1456,43 1480,44", elev: "1100m", w: 0.95, o: 0.32, delay: 0.58 },
        { d: "M-50,47 C-36,21 95,-9 324,18 C477,38 651,43 840,23 C1013,2 1173,19 1322,25 C1404,28 1456,25 1480,26", elev: "", w: 0.75, o: 0.22, delay: 0.66 },
        { d: "M-50,30 C-53,1 68,-32 307,-2 C462,20 646,25 840,4 C1014,-17 1175,0 1322,6 C1404,10 1457,6 1480,7", elev: "1120m", w: 0.85, o: 0.28, delay: 0.74 },
        { d: "M-50,13 C-70,-19 40,-55 291,-22 C446,2 641,7 840,-15 C1016,-38 1176,-19 1322,-12 C1404,-9 1457,-13 1480,-12", elev: "", w: 0.6, o: 0.15, delay: 0.82 },
      ];
    }
    // Default — plateau (flat with gorge cuts)
    return [
      { d: "M-50,120 C200,118 450,120 600,100 C700,85 750,85 850,100 C1000,120 1250,118 1480,120", elev: "1800m", w: 0.7, o: 0.2, delay: 0 },
      { d: "M-50,100 C200,98 450,100 600,80 C700,65 750,65 850,80 C1000,100 1250,98 1480,100", elev: "", w: 0.5, o: 0.14, delay: 0.15 },
    ];
  };

  const contours = getContours();

  return (
    <div className={`relative w-full overflow-hidden ${reverse ? "rotate-180" : ""}`}
         style={{ height: 160, background: "var(--color-bg-sand)" }}>
      <svg
        ref={ref}
        viewBox="0 0 1440 180"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fine coordinate grid */}
          <pattern id={`grid-${type}`} x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M 72 0 L 0 0 0 72" fill="none" stroke="var(--color-text-primary)" strokeWidth="0.25" strokeOpacity="0.08" />
          </pattern>
          {/* Index contour pattern (thicker every ~4) */}
        </defs>

        {/* Coordinate grid */}
        <rect x="0" y="0" width="1440" height="180" fill={`url(#grid-${type})`} />

        {/* Grid coordinate labels — vertical edges */}
        {[72, 144, 216, 288, 360, 432, 504, 576, 648, 720, 792, 864, 936, 1008, 1080, 1152, 1224, 1296, 1368].map((x, i) => (
          <text key={i} x={x + 2} y="175"
            fontFamily="'IBM Plex Mono',monospace" fontSize="6" letterSpacing="0.3"
            fill="var(--color-text-primary)" fillOpacity={isVisible ? 0.12 : 0}
            style={{ transition: `fill-opacity 0.6s ease ${0.8 + i * 0.03}s` }}>
            {480 + i * 4}E
          </text>
        ))}
        {[36, 108].map((y, i) => (
          <text key={i} x="6" y={y}
            fontFamily="'IBM Plex Mono',monospace" fontSize="6" letterSpacing="0.3"
            fill="var(--color-text-primary)" fillOpacity={isVisible ? 0.12 : 0}
            style={{ transition: `fill-opacity 0.6s ease ${1.0 + i * 0.1}s` }}>
            {32 - i}N
          </text>
        ))}

        {/* All contour lines */}
        {contours.map((c, i) => (
          <g key={i}>
            {/* Index contours (every 4th) are slightly thicker */}
            <path
              d={c.d}
              fill="none"
              stroke="var(--color-text-primary)"
              strokeWidth={i % 4 === 0 ? (c.w as number) * 1.8 : c.w as number}
              strokeOpacity={i % 4 === 0 ? (c.o as number) * 1.5 : c.o as number}
              strokeLinecap="round"
              style={{
                strokeDasharray: 3000,
                strokeDashoffset: isVisible ? 0 : 3000,
                transition: `stroke-dashoffset 3s cubic-bezier(0.4,0,0.2,1) ${(c.delay as number)}s`,
              }}
            />
            {/* Elevation label on index contours */}
            {(c.elev as string) && (
              <text
                x={100 + i * 5}
                y={170 - i * 13}
                fontFamily="'IBM Plex Mono',monospace"
                fontSize="7"
                fill="var(--color-text-primary)"
                fillOpacity={isVisible ? (c.o as number) * 1.2 : 0}
                letterSpacing="0.8"
                style={{ transition: `fill-opacity 1s ease ${(c.delay as number) + 0.8}s` }}
              >
                {c.elev as string}
              </text>
            )}
          </g>
        ))}

        {/* Hachure marks — short downslope ticks on steep areas */}
        {isVisible && Array.from({ length: 28 }, (_, i) => ({
          x: 60 + i * 50 + (i % 3) * 8,
          y: 155 - (i % 6) * 10,
          angle: -15 + (i % 4) * 8,
        })).map((h, i) => (
          <line key={i}
            x1={h.x} y1={h.y}
            x2={h.x + Math.cos(h.angle * Math.PI / 180) * 6}
            y2={h.y + Math.sin(h.angle * Math.PI / 180) * 6}
            stroke="var(--color-text-primary)" strokeWidth="0.4" strokeOpacity="0.08"
          />
        ))}

        {/* Waypoint diamond marker */}
        <g transform="translate(720, 90)"
           opacity={isVisible ? 1 : 0}
           style={{ transition: "opacity 0.8s ease 1.4s" }}>
          <polygon points="0,-10 6,0 0,10 -6,0"
            fill="none" stroke="var(--color-rust)" strokeWidth="0.8" strokeOpacity="0.5" />
          <circle cx="0" cy="0" r="2" fill="var(--color-rust)" fillOpacity="0.4" />
          <line x1="0" y1="10" x2="0" y2="30" stroke="var(--color-rust)" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>

        {/* Location label — left side */}
        {location && (
          <text
            x="32" y="85"
            fontFamily="'Anton',sans-serif"
            fontSize="11"
            fill="var(--color-text-primary)"
            fillOpacity={isVisible ? 0.18 : 0}
            letterSpacing="4"
            style={{ transition: "fill-opacity 1s ease 1.2s" }}
          >
            {location.toUpperCase()}
          </text>
        )}

        {/* Coords — left side below location */}
        {coords && (
          <text
            x="32" y="96"
            fontFamily="'IBM Plex Mono',monospace"
            fontSize="7"
            fill="var(--color-rust)"
            fillOpacity={isVisible ? 0.45 : 0}
            letterSpacing="1.5"
            style={{ transition: "fill-opacity 1s ease 1.4s" }}
          >
            {coords}
          </text>
        )}

        {/* Altitude — left side */}
        {altitude && (
          <text
            x="32" y="106"
            fontFamily="'IBM Plex Mono',monospace"
            fontSize="7"
            fill="var(--color-text-primary)"
            fillOpacity={isVisible ? 0.28 : 0}
            letterSpacing="1.2"
            style={{ transition: "fill-opacity 1s ease 1.6s" }}
          >
            ALT: {altitude}
          </text>
        )}

        {/* Scale bar — right side */}
        <g transform="translate(1320, 155)"
           opacity={isVisible ? 0.3 : 0}
           style={{ transition: "opacity 1s ease 1.8s" }}>
          <line x1="0" y1="0" x2="80" y2="0" stroke="var(--color-text-primary)" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="var(--color-text-primary)" strokeWidth="0.8" />
          <line x1="40" y1="0" x2="40" y2="4" stroke="var(--color-text-primary)" strokeWidth="0.6" />
          <line x1="80" y1="0" x2="80" y2="5" stroke="var(--color-text-primary)" strokeWidth="0.8" />
          <text x="0" y="-3" fontFamily="'IBM Plex Mono',monospace" fontSize="5.5"
            fill="var(--color-text-primary)" letterSpacing="0.3">0</text>
          <text x="30" y="-3" fontFamily="'IBM Plex Mono',monospace" fontSize="5.5"
            fill="var(--color-text-primary)" letterSpacing="0.3">50km</text>
          <text x="66" y="-3" fontFamily="'IBM Plex Mono',monospace" fontSize="5.5"
            fill="var(--color-text-primary)" letterSpacing="0.3">100km</text>
        </g>

        {/* Contour interval note — bottom right */}
        <text x="1408" y="175"
          fontFamily="'IBM Plex Mono',monospace" fontSize="5.5"
          fill="var(--color-text-primary)" fillOpacity={isVisible ? 0.2 : 0}
          textAnchor="end" letterSpacing="0.5"
          style={{ transition: "fill-opacity 1s ease 2s" }}>
          ÉQUIDISTANCE 20m · CARTE TOPOGRAPHIQUE
        </text>

        {/* North arrow — far right */}
        <g transform="translate(1410, 60)"
           opacity={isVisible ? 0.25 : 0}
           style={{ transition: "opacity 1s ease 1.6s" }}>
          <line x1="0" y1="20" x2="0" y2="-20" stroke="var(--color-text-primary)" strokeWidth="0.7" />
          <polygon points="0,-20 -4,-8 0,-12 4,-8"
            fill="var(--color-text-primary)" fillOpacity="0.6" />
          <text x="0" y="30" textAnchor="middle"
            fontFamily="'IBM Plex Mono',monospace" fontSize="7"
            fill="var(--color-text-primary)" letterSpacing="1">N</text>
        </g>
      </svg>
    </div>
  );
}
