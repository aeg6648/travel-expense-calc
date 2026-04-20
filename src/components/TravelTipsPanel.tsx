'use client';

import { useEffect, useMemo, useState } from 'react';
import { TRAVEL_TIPS, type TravelTip } from '@/lib/travel-tips';

// Rotates through a shuffled subset of tips (one at a time) and lets the
// user manually cycle to the next tip.
export default function TravelTipsPanel() {
  // Stable shuffle per mount so the rotation feels fresh each visit.
  const deck = useMemo<TravelTip[]>(() => {
    const arr = [...TRAVEL_TIPS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % deck.length), 7000);
    return () => clearInterval(t);
  }, [deck.length]);

  const tip = deck[i];
  if (!tip) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl p-4 border border-slate-700/60 bg-gradient-to-br from-slate-800 via-indigo-950/40 to-slate-800 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">💡 여행 팁</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">{i + 1}/{deck.length}</span>
          <button
            onClick={() => setI(v => (v + 1) % deck.length)}
            className="w-5 h-5 rounded-full bg-slate-700/60 hover:bg-indigo-600/80 text-slate-300 hover:text-white text-[10px] flex items-center justify-center transition-colors"
            aria-label="다음 팁"
            title="다음 팁"
          >›</button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none shrink-0">{tip.emoji}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-semibold text-indigo-400">#{tip.category}</span>
          </div>
          <p className="text-sm font-bold text-slate-100 leading-tight">{tip.title}</p>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{tip.body}</p>
        </div>
      </div>
    </section>
  );
}
