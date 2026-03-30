interface TopographicLinesProps {
  className?: string;
  opacity?: number;
}

/**
 * Large SVG with organic contour-line curves that evoke a real topographic map.
 * Closer (lower-altitude) lines are thicker and more opaque; distant ones are
 * thinner and more transparent.
 */
export default function TopographicLines({
  className = "",
  opacity = 0.08,
}: TopographicLinesProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* ── Outer / distant contours (thin, low opacity) ── */}
      <path
        d="M-20 560 Q100 530, 200 545 T400 535 T600 550 T820 525"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <path
        d="M-20 40 Q80 25, 180 35 T360 28 T540 42 T720 30 T820 45"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <path
        d="M-20 90 Q120 60, 250 80 T480 65 T680 85 T820 70"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.35"
      />
      <path
        d="M-20 510 Q150 480, 300 500 T550 485 T750 505 T820 490"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.35"
      />

      {/* ── Mid-altitude contours ── */}
      <path
        d="M-20 150 Q100 120, 220 140 T420 125 T620 145 T820 130"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.45"
      />
      <path
        d="M-20 450 Q130 420, 280 440 T500 425 T700 448 T820 430"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.45"
      />
      <path
        d="M-20 200 Q90 175, 200 190 T380 178 T560 195 T740 180 T820 195"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />
      <path
        d="M-20 400 Q110 375, 240 390 T460 375 T660 395 T820 380"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />

      {/* ── Inner / close contours (thick, higher opacity) ── */}
      <path
        d="M-20 260 Q120 235, 260 255 T480 240 T680 258 T820 245"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />
      <path
        d="M-20 340 Q140 315, 300 332 T520 318 T720 338 T820 322"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* ── Peak contours (concentric group) ── */}
      <path
        d="M200 300 Q280 275, 380 290 T520 280 T620 295"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />
      <path
        d="M250 310 Q310 295, 390 305 T500 298 T580 308"
        stroke="white"
        strokeWidth="1.3"
        strokeOpacity="0.65"
      />
      <path
        d="M300 305 Q350 295, 420 302 T500 296"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.55"
      />

      {/* ── Secondary concentric group (right side) ── */}
      <path
        d="M520 180 Q580 160, 660 175 T760 165"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />
      <path
        d="M560 175 Q610 165, 670 172 T730 168"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.45"
      />
    </svg>
  );
}
