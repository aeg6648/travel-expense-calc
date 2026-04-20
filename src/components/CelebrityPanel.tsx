'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CELEBRITY_DESTINATIONS,
  TRAVEL_ADVISORIES,
  type CelebrityDestination,
} from '@/lib/celebrity-destinations';

export default function CelebrityPanel() {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState<CelebrityDestination | null>(null);

  // Shuffle once per visit so the order feels fresh, then auto-advance.
  const deck = useMemo(() => {
    const arr = [...CELEBRITY_DESTINATIONS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % deck.length), 9000);
    return () => clearInterval(t);
  }, [deck.length]);

  const d = deck[idx] ?? deck[0];

  // Pick one advisory per visit
  const advisory = useMemo(
    () => TRAVEL_ADVISORIES[Math.floor(Math.random() * TRAVEL_ADVISORIES.length)],
    [],
  );

  return (
    <aside className="space-y-4">
      {/* Celebrity traveled-to card */}
      <button
        onClick={() => d && setOpen(d)}
        className="group block w-full text-left rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800 shadow-lg hover:border-indigo-500/60 transition-all"
      >
        <div className="relative h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={d.id}
            src={d.photo}
            alt={`${d.person} — ${d.city}`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
          {d.tag && (
            <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white">
              {d.tag}
            </span>
          )}
          <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white/90 group-hover:bg-indigo-600/80 transition-colors">
            자세히 →
          </span>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-[10px] text-white/70 uppercase tracking-widest">최근 다녀옴</p>
            <p className="text-lg font-bold text-white leading-tight mt-0.5">{d.person}</p>
            <p className="text-xs text-white/80 mt-0.5">📍 {d.city}</p>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-300 leading-relaxed">{d.caption}</p>
          <div className="flex items-center gap-1 mt-3">
            {deck.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === idx ? 'w-5 bg-indigo-400' : 'w-1.5 bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </button>

      {/* Advisory / recommendation banner */}
      <div
        className={`rounded-2xl p-4 border shadow-lg ${
          advisory.kind === 'recommend'
            ? 'bg-gradient-to-br from-emerald-900/30 via-slate-800 to-slate-800 border-emerald-700/50'
            : 'bg-gradient-to-br from-amber-900/30 via-slate-800 to-slate-800 border-amber-700/50'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{advisory.emoji}</span>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              advisory.kind === 'recommend' ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {advisory.kind === 'recommend' ? '추천' : '주의'}
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-100 leading-tight">{advisory.title}</p>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{advisory.body}</p>
      </div>

      {open && <CelebrityModal destination={open} onClose={() => setOpen(null)} />}
    </aside>
  );
}

function CelebrityModal({ destination, onClose }: { destination: CelebrityDestination; onClose: () => void }) {
  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={destination.photo} alt={destination.city} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur text-white flex items-center justify-center transition-colors"
            aria-label="닫기"
          >✕</button>
          {destination.tag && (
            <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/25 text-white">
              {destination.tag}
            </span>
          )}
          <div className="absolute bottom-4 left-5 right-5">
            <p className="text-[11px] text-white/70 uppercase tracking-widest">
              {destination.year && `${destination.year}  ·  `}{destination.duration ?? '여행'}
            </p>
            <h2 className="text-2xl font-bold text-white leading-tight mt-0.5">{destination.person}</h2>
            <p className="text-sm text-white/90 mt-0.5">📍 {destination.city}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-slate-200 leading-relaxed">{destination.summary}</p>

          {destination.style && (
            <p className="text-xs text-indigo-300">{destination.style}</p>
          )}

          {destination.spots.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">방문한 곳</h3>
              <ol className="space-y-2">
                {destination.spots.map((s, i) => (
                  <li key={s.name} className="flex items-start gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{s.name}</p>
                      <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{s.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {destination.tips && destination.tips.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">따라가고 싶다면</h3>
              <ul className="space-y-1.5">
                {destination.tips.map(tip => (
                  <li key={tip} className="flex gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {destination.gallery && destination.gallery.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">갤러리</h3>
              <div className="grid grid-cols-2 gap-2">
                {destination.gallery.map(src => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="aspect-[4/3] w-full object-cover rounded-lg" />
                ))}
              </div>
            </section>
          )}

          {destination.source && (
            <p className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
              * 출처/참고: {destination.source.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
