'use client';

// Evocative travel photos that quietly rotate behind the hero title.
// Each image is visible ~5s with a ~1s crossfade and subtle Ken Burns zoom.
const IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=80&auto=format&fit=crop', // Paris
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80&auto=format&fit=crop', // Tokyo / Kyoto
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=80&auto=format&fit=crop', // Santorini
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80&auto=format&fit=crop', // Bali
  'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1600&q=80&auto=format&fit=crop', // Swiss Alps
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80&auto=format&fit=crop', // New York
];

const CYCLE_SECONDS = IMAGES.length * 6;

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {IMAGES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          className="hero-slide absolute inset-0 w-full h-full object-cover"
          style={{ animationDelay: `${i * 6}s` }}
        />
      ))}
      {/* Readability overlay: dark top + bottom, slightly tinted indigo */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/55 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-sky-950/30" />

      <style jsx>{`
        .hero-slide {
          opacity: 0;
          animation: hero-slide-fade ${CYCLE_SECONDS}s infinite;
          will-change: opacity, transform;
        }
        @keyframes hero-slide-fade {
          0%   { opacity: 0; transform: scale(1.04); }
          5%   { opacity: 1; transform: scale(1.02); }
          ${Math.round((100 / IMAGES.length) - 1)}% { opacity: 1; transform: scale(1.0); }
          ${Math.round(100 / IMAGES.length)}% { opacity: 0; transform: scale(1.0); }
          100% { opacity: 0; transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
