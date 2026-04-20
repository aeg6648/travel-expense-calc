interface Props {
  size?: number; // pixel height
  className?: string;
}

// TRIP-B wordmark. Uses Playfair Display (loaded globally via next/font
// so it renders identically everywhere) for the italic B base, and Inter
// for the tracked "TRIP" sitting atop it.
export default function TripBLogo({ size = 36, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 92 54"
      height={size}
      aria-label="TRIP-B"
      role="img"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="tripb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="tripb-line" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <filter id="tripb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* TRIP, tracked wide on top */}
      <text
        x="46"
        y="14"
        textAnchor="middle"
        fontFamily="var(--font-inter), 'Inter', 'Helvetica Neue', system-ui, sans-serif"
        fontSize="10"
        fontWeight={700}
        letterSpacing="4"
        fill="#e2e8f0"
      >
        TRIP
      </text>

      {/* Hairline platform */}
      <path
        d="M10 19.5 Q 46 22 82 19.5"
        stroke="url(#tripb-line)"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />

      {/* B — Playfair Display italic 900, gradient, soft shadow */}
      <text
        x="46"
        y="49"
        textAnchor="middle"
        fontFamily="var(--font-playfair), 'Playfair Display', 'Didot', 'Bodoni 72', Georgia, serif"
        fontStyle="italic"
        fontSize="44"
        fontWeight={900}
        fill="url(#tripb-grad)"
        filter="url(#tripb-shadow)"
      >
        B
      </text>
    </svg>
  );
}
