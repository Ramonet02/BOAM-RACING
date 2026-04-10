interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  light?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  className = "",
  light = false,
}: SectionHeadingProps) {
  const titleColor = light ? "text-[var(--color-text-light)]" : "text-[var(--color-text-primary)]";
  const subtitleColor = light ? "text-[var(--color-text-light)]/70" : "text-[var(--color-text-secondary)]";
  const strokeColor = light ? "#F7F4EB" : "#2A2522";

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <h2
        className={`font-heading text-3xl uppercase tracking-wide md:text-4xl lg:text-5xl ${titleColor}`}
      >
        {title}
      </h2>

      {/* Decorative topographic contour line */}
      <svg
        width="200"
        height="20"
        viewBox="0 0 200 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="my-4"
        aria-hidden="true"
      >
        <path
          d="M0 14 Q20 4, 50 10 T100 8 T150 12 T200 6"
          stroke={strokeColor}
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />
        <path
          d="M0 10 Q30 2, 60 8 T120 6 T170 10 T200 4"
          stroke={strokeColor}
          strokeWidth="0.6"
          strokeOpacity="0.15"
          strokeLinecap="round"
        />
      </svg>

      {subtitle && (
        <p
          className={`max-w-xl font-body text-base leading-relaxed md:text-lg ${subtitleColor}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
