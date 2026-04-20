interface Props {
  size?: number; // pixel height
  className?: string;
}

// Modern horizontal wordmark: "Trip" in thin italic + a flowing arrow +
// a big gradient "B". Uses Playfair Display (loaded via next/font) for
// the italic letterforms and Inter for the small supporting text.
export default function TripBLogo({ size = 32, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 140 44"
      height={size}
      aria-label="TRIP-B"
      role="img"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="tripb-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="tripb-arrow" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* "Trip" — thin italic display serif */}
      <text
        x="4"
        y="30"
        fontFamily="var(--font-playfair), 'Playfair Display', 'Didot', Georgia, serif"
        fontStyle="italic"
        fontSize="26"
        fontWeight={500}
        fill="#f1f5f9"
        letterSpacing="0.5"
      >
        Trip
      </text>

      {/* Flowing connector — a soft arrow suggesting the journey from
          any starting point to "B" (Plan B, destination B). */}
      <path
        d="M70 22 Q 80 12, 94 22"
        stroke="url(#tripb-arrow)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M89 18 L95 22 L89 26"
        stroke="url(#tripb-arrow)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Big italic serif B, gradient filled */}
      <text
        x="100"
        y="34"
        fontFamily="var(--font-playfair), 'Playfair Display', 'Didot', Georgia, serif"
        fontStyle="italic"
        fontSize="38"
        fontWeight={900}
        fill="url(#tripb-b)"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(15,23,42,0.55))' }}
      >
        B
      </text>
    </svg>
  );
}
