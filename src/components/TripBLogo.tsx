interface Props {
  size?: number; // pixel height
  className?: string;
}

// TRIP-B wordmark — a hand-drawn italic serif B in pure SVG (no font
// dependency) acts as the base, with the uppercase "TRIP" tracked
// above it and a tiny paper plane grounding the two. Tuned for a
// sticky header at ~32–40px tall.
export default function TripBLogo({ size = 34, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 92 52"
      height={size}
      aria-label="TRIP-B"
      role="img"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="tripb-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="tripb-accent" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* TRIP — small, high contrast, tracked wide, resting on the hairline */}
      <text
        x="46"
        y="14"
        textAnchor="middle"
        fontFamily="'Inter','Helvetica Neue',system-ui,sans-serif"
        fontSize="10.5"
        fontWeight={800}
        letterSpacing="3.6"
        fill="#f1f5f9"
      >
        TRIP
      </text>

      {/* Hairline platform that TRIP sits on and B pokes through */}
      <path
        d="M8 19.5 Q 46 22 84 19.5"
        stroke="url(#tripb-accent)"
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
      />

      {/* Tiny paper-plane flourish at the right end of the platform */}
      <path
        d="M78 17 l6 2.4 -4.2 1.1 -0.7 2.8 -1.1 -2.4 z"
        fill="url(#tripb-stroke)"
        opacity="0.9"
      />

      {/* ── The B base, drawn as a single italic-serif silhouette ──
            The stem, two bowls, and serifs are described in one path.
            viewBox y: 0 (top) → 52 (bottom). B spans y≈22..48.          */}
      <g transform="translate(46 36)">
        {/* serif-B outer shape, italic slant ~9deg, filled with gradient */}
        <path
          d="
            M -15 13
            L -11 -13
            Q -10.2 -15 -8 -15
            L 3 -15
            Q 10 -15 11.8 -10
            Q 13 -6 10 -3
            Q 7 -0.2 2.5 0.4
            Q 9 1 12 4.6
            Q 15 8.5 12 12
            Q 9 14.5 3 14.5
            L -11 14.5
            Q -13 14.5 -13 13
            Z

            M -6 -11
            L -8 -1
            L 1 -1
            Q 5.5 -1 7.2 -3.6
            Q 8.8 -6 7.8 -8.6
            Q 6.6 -11 3 -11
            Z

            M -9 3
            L -11.5 12
            L 1.8 12
            Q 6.6 12 8.5 9.2
            Q 10.2 6 8.5 3.6
            Q 6.6 1 1.8 1
            L -7.4 1
            Q -8.4 1 -9 3
            Z
          "
          fill="url(#tripb-stroke)"
          fillRule="evenodd"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(30,41,59,0.6))' }}
        />
        {/* small anchor dot at the base, like a ground-point */}
        <circle cx="0" cy="17" r="1.4" fill="url(#tripb-stroke)" opacity="0.9" />
      </g>
    </svg>
  );
}
