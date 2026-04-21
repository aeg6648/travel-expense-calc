'use client';

import { useState, useEffect } from 'react';

// Evocative travel photos. One is chosen at random on each page load and
// stays for the whole session — no in-page rotation.
const IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=80&auto=format&fit=crop', // Paris
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&q=80&auto=format&fit=crop', // Tokyo / Kyoto
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1600&q=80&auto=format&fit=crop', // Santorini
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=80&auto=format&fit=crop', // Bali
  'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1600&q=80&auto=format&fit=crop', // Swiss Alps
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80&auto=format&fit=crop', // New York
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80&auto=format&fit=crop', // Sydney harbour
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=80&auto=format&fit=crop', // Istanbul
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&q=80&auto=format&fit=crop', // Rome
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=1600&q=80&auto=format&fit=crop', // Vietnam
];

const LAST_KEY = 'tripb_hero_last_v1';

export default function HeroBackground() {
  // Start with null so SSR and hydration don't try to pick a random image
  // (that would cause a hydration mismatch). On mount we pick one.
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    // Exclude the image we showed on the previous visit so consecutive
    // loads always differ — defeats both any lucky Math.random streaks
    // and aggressive CDN caching of the shell.
    let lastShown = '';
    try { lastShown = localStorage.getItem(LAST_KEY) ?? ''; } catch { /* ignore */ }
    const pool = IMAGES.length > 1 && lastShown
      ? IMAGES.filter(x => x !== lastShown)
      : IMAGES;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setSrc(chosen);
    try { localStorage.setItem(LAST_KEY, chosen); } catch { /* ignore */ }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="hero-photo absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Readability overlay: dark + subtle indigo/sky tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/55 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-transparent to-sky-950/30" />

      <style jsx>{`
        .hero-photo {
          opacity: 0;
          animation: hero-fade-in 1.2s ease-out forwards, hero-drift 30s ease-out forwards;
          will-change: opacity, transform;
        }
        @keyframes hero-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hero-drift {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
