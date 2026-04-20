'use client';

import { useEffect, useMemo, useState } from 'react';
import { CELEBRITY_DESTINATIONS, TRAVEL_ADVISORIES } from '@/lib/celebrity-destinations';

export default function CelebrityPanel() {
  const [idx, setIdx] = useState(0);

  // Pick a random starting index per visit then slowly cycle forward.
  useEffect(() => {
    setIdx(Math.floor(Math.random() * CELEBRITY_DESTINATIONS.length));
    const t = setInterval(() => {
      setIdx(i => (i + 1) % CELEBRITY_DESTINATIONS.length);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const d = CELEBRITY_DESTINATIONS[idx] ?? CELEBRITY_DESTINATIONS[0];

  // Pick one advisory per visit
  const advisory = useMemo(() => {
    const r = Math.floor(Math.random() * TRAVEL_ADVISORIES.length);
    return TRAVEL_ADVISORIES[r];
  }, []);

  return (
    <aside className="space-y-4">
      {/* Celebrity traveled-to card */}
      <div className="rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800 shadow-lg">
        <div className="relative h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={d.id}
            src={d.photo}
            alt={`${d.person} — ${d.city}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
          {d.tag && (
            <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white">
              {d.tag}
            </span>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-[10px] text-white/70 uppercase tracking-widest">최근 다녀옴</p>
            <p className="text-lg font-bold text-white leading-tight mt-0.5">{d.person}</p>
            <p className="text-xs text-white/80 mt-0.5">📍 {d.city}</p>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-300 leading-relaxed">{d.caption}</p>
          <div className="flex items-center gap-1 mt-3">
            {CELEBRITY_DESTINATIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`${i + 1}번째 여행지`}
                className={`h-1 rounded-full transition-all ${
                  i === idx ? 'w-5 bg-indigo-400' : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

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
    </aside>
  );
}
