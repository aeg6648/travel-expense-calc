interface Props {
  size?: number; // pixel height
  className?: string;
}

// Calligraphic TRIP-B wordmark: a large script "B" serves as the base,
// with a small uppercase "TRIP" resting on top.
export default function TripBLogo({ size = 34, className = '' }: Props) {
  const scriptFont =
    "'Brush Script MT','Snell Roundhand','Lucida Handwriting','Apple Chancery','Segoe Script',cursive";

  return (
    <svg
      viewBox="0 0 78 48"
      height={size}
      aria-label="TRIP-B"
      role="img"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="tripb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="45%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <filter id="tripb-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* TRIP — uppercase tracking, sitting atop the B */}
      <text
        x="39"
        y="14"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontSize="11"
        fontWeight={800}
        letterSpacing="3"
        fill="#e2e8f0"
      >
        TRIP
      </text>

      {/* Swoosh underline connecting TRIP to B */}
      <path
        d="M10 19 Q 39 23, 68 19"
        stroke="url(#tripb-grad)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Script B base */}
      <text
        x="39"
        y="45"
        textAnchor="middle"
        fontFamily={scriptFont}
        fontStyle="italic"
        fontSize="36"
        fontWeight={900}
        fill="url(#tripb-grad)"
        filter="url(#tripb-glow)"
      >
        B
      </text>
    </svg>
  );
}
