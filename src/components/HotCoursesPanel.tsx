'use client';

import { useEffect, useState } from 'react';
import { COUNTRIES } from '@/lib/travel-data';
import { HOT_COURSES, type HotCourse } from '@/lib/hot-courses';
import { getCountryPhoto, fallbackGradient } from '@/lib/country-photos';
import type { CommunityPost } from '@/components/Community';

// A card describing either a community post's shared trip (real user
// itinerary with hot reactions) or an editorial fallback course.
type Card =
  | { kind: 'community'; id: string; title: string; countryCode: string; days: number; stops: string[]; hype: number; vibe?: string; authorName: string }
  | { kind: 'editorial'; course: HotCourse };

const MIN_LIKES_FOR_HOT = 3; // threshold a community post must clear
const COMMUNITY_TARGET = 5;   // how many community cards to show at most

function tripDurationDays(start: string, end: string): number {
  if (!start || !end) return 1;
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

function toCommunityCard(p: CommunityPost): Card | null {
  const trip = p.sharedTrip;
  if (!trip) return null;
  const days = tripDurationDays(trip.startDate, trip.endDate);
  const stops = [...trip.activities]
    .filter(a => a.type === 'activity' || a.type === 'accommodation' || a.type === 'food')
    .slice(0, 4)
    .map(a => a.title);
  return {
    kind: 'community',
    id: p.id,
    title: trip.name,
    countryCode: trip.countryCode,
    days,
    stops,
    hype: p.likes.length,
    authorName: p.authorName,
  };
}

export default function HotCoursesPanel() {
  const [cards, setCards] = useState<Card[]>(() =>
    HOT_COURSES.slice(0, 5).map(course => ({ kind: 'editorial', course })),
  );
  const [idx, setIdx] = useState(0);

  // Pull community posts once. Rank by likes, keep those above threshold,
  // then pad with editorial courses so the panel always has >=5 cards.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/community/posts');
        if (!res.ok) return;
        const data = await res.json();
        const posts = (data.posts ?? []) as CommunityPost[];
        const communityCards = posts
          .filter(p => p.sharedTrip && p.likes.length >= MIN_LIKES_FOR_HOT)
          .sort((a, b) => b.likes.length - a.likes.length)
          .slice(0, COMMUNITY_TARGET)
          .map(toCommunityCard)
          .filter((c): c is Card => c !== null);
        const padding = HOT_COURSES
          .slice(0, Math.max(0, 5 - communityCards.length))
          .map<Card>(course => ({ kind: 'editorial', course }));
        if (!cancelled) setCards([...communityCards, ...padding]);
      } catch { /* fall back silently */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (cards.length <= 1) return;
    const t = setInterval(() => setIdx(v => (v + 1) % cards.length), 8500);
    return () => clearInterval(t);
  }, [cards.length]);

  const card = cards[idx] ?? cards[0];
  if (!card) return null;

  const countryCode = card.kind === 'community' ? card.countryCode : card.course.countryCode;
  const country = COUNTRIES.find(c => c.code === countryCode);
  const photo = getCountryPhoto(countryCode);
  const bg = photo
    ? { backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.25), rgba(15,23,42,0.9)), url("${photo.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: fallbackGradient(countryCode) };

  const title = card.kind === 'community' ? card.title : card.course.title;
  const days = card.kind === 'community' ? card.days : card.course.days;
  const stops = card.kind === 'community' ? card.stops : card.course.stops;
  const hype = card.kind === 'community' ? card.hype : card.course.hype;
  const vibe = card.kind === 'community' ? undefined : card.course.vibe;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-700/60 shadow-lg">
      <div className="relative min-h-[200px] p-4" style={bg}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300/90 flex items-center gap-1">
            🔥 핫한 코스 {card.kind === 'community' && <span className="text-[9px] font-medium px-1 py-0 rounded bg-pink-500/30 text-pink-100">실사용자</span>}
          </span>
          <span className="text-[11px] text-white/90 font-semibold">♥ {hype}</span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{country?.flag ?? '🌍'}</span>
          <p className="text-base font-extrabold text-white leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{title}</p>
        </div>
        <p className="text-[11px] text-white/80 mb-2">
          {country?.nameKR ?? countryCode} · {days}박 {days + 1}일
          {card.kind === 'community' && ` · @${card.authorName}`}
          {vibe && ` · ${vibe}`}
        </p>

        {stops.length > 0 && (
          <ol className="space-y-1 mt-2">
            {stops.slice(0, 4).map((s, i) => (
              <li key={`${s}-${i}`} className="flex items-center gap-2 text-[11px] text-white/95">
                <span className="shrink-0 w-4 h-4 rounded-full bg-pink-500/80 text-white text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                <span className="truncate">{s}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="flex items-center gap-1 mt-3">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`${i + 1}번째 코스`}
              className={`h-1 rounded-full transition-[width,background-color] duration-200 ${i === idx ? 'w-5 bg-pink-300' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
