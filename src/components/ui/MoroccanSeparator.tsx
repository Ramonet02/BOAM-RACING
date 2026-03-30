export default function MoroccanSeparator() {
  return (
    <div className="relative w-full" style={{ height: 60 }} aria-hidden="true">
      {/* Zellige geometric pattern at low opacity */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="sep-zellige"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star motif */}
            <polygon
              points="20,2 24,14 36,14 26,22 30,34 20,26 10,34 14,22 4,14 16,14"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
            {/* Cross connectors */}
            <line x1="0" y1="0" x2="8" y2="8" stroke="white" strokeWidth="0.4" />
            <line x1="40" y1="0" x2="32" y2="8" stroke="white" strokeWidth="0.4" />
            <line x1="0" y1="40" x2="8" y2="32" stroke="white" strokeWidth="0.4" />
            <line x1="40" y1="40" x2="32" y2="32" stroke="white" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sep-zellige)" opacity="0.06" />
      </svg>

      {/* Topographic horizontal line */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1200 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 30 Q150 18, 300 28 T600 26 T900 32 T1200 24"
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          strokeOpacity="0.1"
          strokeLinecap="round"
        />
      </svg>

      {/* Centred shimmer divider */}
      <div className="absolute inset-x-0 top-1/2 mx-auto max-w-md -translate-y-1/2">
        <div className="divider-shimmer" />
      </div>
    </div>
  );
}
