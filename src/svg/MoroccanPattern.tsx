interface MoroccanPatternProps {
  className?: string;
  opacity?: number;
}

/**
 * Seamlessly tiling Islamic zellige-inspired geometric pattern.
 * Uses an 8-pointed star-and-cross motif inside a repeating pattern tile.
 */
export default function MoroccanPattern({
  className = "",
  opacity = 0.06,
}: MoroccanPatternProps) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id="zellige"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* 8-pointed star */}
          <polygon
            points="30,4 34.5,17 48,17 37,26 41,39 30,31 19,39 23,26 12,17 25.5,17"
            fill="none"
            stroke="white"
            strokeWidth="0.6"
          />

          {/* Inner star ring */}
          <polygon
            points="30,12 33,20 41,20 35,25 37,33 30,28 23,33 25,25 19,20 27,20"
            fill="none"
            stroke="white"
            strokeWidth="0.4"
          />

          {/* Cross / kite connectors linking tiles */}
          {/* Top-left */}
          <path d="M0,0 L10,10 M0,10 L10,0" stroke="white" strokeWidth="0.4" />
          {/* Top-right */}
          <path d="M50,0 L60,10 M50,10 L60,0" stroke="white" strokeWidth="0.4" />
          {/* Bottom-left */}
          <path d="M0,50 L10,60 M0,60 L10,50" stroke="white" strokeWidth="0.4" />
          {/* Bottom-right */}
          <path d="M50,50 L60,60 M50,60 L60,50" stroke="white" strokeWidth="0.4" />

          {/* Hexagonal outlines connecting stars */}
          <path
            d="M30,0 L48,10 L48,38 L30,48 L12,38 L12,10 Z"
            fill="none"
            stroke="white"
            strokeWidth="0.35"
            transform="translate(0,6)"
          />

          {/* Small diamond accents at midpoints */}
          <rect
            x="28"
            y="-2"
            width="4"
            height="4"
            transform="rotate(45,30,0)"
            fill="none"
            stroke="white"
            strokeWidth="0.3"
          />
          <rect
            x="28"
            y="58"
            width="4"
            height="4"
            transform="rotate(45,30,60)"
            fill="none"
            stroke="white"
            strokeWidth="0.3"
          />
          <rect
            x="-2"
            y="28"
            width="4"
            height="4"
            transform="rotate(45,0,30)"
            fill="none"
            stroke="white"
            strokeWidth="0.3"
          />
          <rect
            x="58"
            y="28"
            width="4"
            height="4"
            transform="rotate(45,60,30)"
            fill="none"
            stroke="white"
            strokeWidth="0.3"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#zellige)" />
    </svg>
  );
}
