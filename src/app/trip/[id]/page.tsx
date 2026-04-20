import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicTrip } from '@/lib/public-trips';
import { COUNTRIES } from '@/lib/travel-data';
import { getCountryPhoto, fallbackGradient } from '@/lib/country-photos';
import ShareButton from '@/components/ShareButton';
import type { Activity } from '@/components/ItineraryManager';

type PageProps = { params: Promise<{ id: string }> };

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 1;
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

function countdown(start: string, end: string): string | null {
  if (!start) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const s = new Date(start); s.setHours(0, 0, 0, 0);
  const e = end ? new Date(end) : s; e.setHours(0, 0, 0, 0);
  const oneDay = 86400000;
  const diffStart = Math.round((s.getTime() - today.getTime()) / oneDay);
  if (diffStart > 0) return `D-${diffStart}`;
  if (today.getTime() > e.getTime()) return `완료 · ${Math.round((today.getTime() - e.getTime()) / oneDay)}일 전`;
  const dayNum = Math.round((today.getTime() - s.getTime()) / oneDay) + 1;
  const total = Math.round((e.getTime() - s.getTime()) / oneDay) + 1;
  return `여행 중 · Day ${dayNum}/${total}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pub = await getPublicTrip(id);
  if (!pub) return { title: '공개되지 않은 여행 · TRIP-B' };
  const country = COUNTRIES.find(c => c.code === pub.trip.countryCode);
  const dur = pub.trip.startDate && pub.trip.endDate ? daysBetween(pub.trip.startDate, pub.trip.endDate) : 1;
  const title = `${pub.trip.name} — ${country?.nameKR ?? pub.trip.countryCode} ${dur}박 · TRIP-B`;
  const description = `${pub.authorName}님이 공유한 ${dur}박 여행 일정 — ${pub.trip.activities.length}개 활동`;
  const photo = getCountryPhoto(pub.trip.countryCode);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: photo ? [{ url: photo.url, width: 1200, height: 800 }] : undefined,
    },
  };
}

export default async function PublicTripPage({ params }: PageProps) {
  const { id } = await params;
  const pub = await getPublicTrip(id);

  if (!pub) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-5xl mb-3">🗺️</p>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">공개되지 않은 여행이에요</h1>
          <p className="text-sm text-slate-400 mb-6">작성자가 아직 공유하지 않았거나 삭제했을 수 있어요.</p>
          <Link href="/" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm">TRIP-B 홈으로</Link>
        </div>
      </div>
    );
  }

  const trip = pub.trip;
  const country = COUNTRIES.find(c => c.code === trip.countryCode);
  const photo = getCountryPhoto(trip.countryCode);
  const days = trip.startDate && trip.endDate ? daysBetween(trip.startDate, trip.endDate) : 1;
  const cd = trip.startDate ? countdown(trip.startDate, trip.endDate) : null;
  const byDay = new Map<number, Activity[]>();
  for (const a of trip.activities) {
    if (!byDay.has(a.day)) byDay.set(a.day, []);
    byDay.get(a.day)!.push(a);
  }
  for (const list of byDay.values()) {
    list.sort((x, y) => {
      if (x.order !== undefined && y.order !== undefined) return x.order - y.order;
      return (x.time || '').localeCompare(y.time || '');
    });
  }
  const orderedDays = Array.from(byDay.keys()).sort((a, b) => a - b);
  const totalActivities = trip.activities.length;

  const heroStyle = photo
    ? { backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.35), rgba(15,23,42,0.9)), url("${photo.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: fallbackGradient(trip.countryCode) };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-300 hover:text-indigo-300">← TRIP-B</Link>
          <ShareButton
            title={`${trip.name} · TRIP-B`}
            text={`${pub.authorName}님이 공유한 ${country?.nameKR ?? ''} ${days}박 여행 일정을 확인해보세요`}
          />
        </div>
      </header>

      <section className="relative overflow-hidden" style={heroStyle}>
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-8">
          {cd && (
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/80 text-white mb-3">
              {cd}
            </span>
          )}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl drop-shadow">{country?.flag ?? '🌍'}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                {trip.name}
              </h1>
              <p className="text-sm text-white/85 mt-0.5">
                {country?.nameKR ?? trip.countryCode}
                {trip.startDate && trip.endDate && ` · ${trip.startDate} ~ ${trip.endDate}`}
                {` · ${days}박 ${days + 1}일`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-white/85">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
              {pub.authorPicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pub.authorPicture} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span>👤</span>
              )}
              {pub.authorName}
            </span>
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/10 border border-white/20">
              📍 활동 {totalActivities}개
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {orderedDays.length === 0 ? (
          <p className="text-center text-slate-500 py-16">아직 활동이 없는 일정이에요.</p>
        ) : (
          orderedDays.map(d => {
            const stops = byDay.get(d)!.filter(a => a.location);
            const routeHref = stops.length >= 2
              ? (() => {
                  const enc = (a: Activity) => a.locationPlaceId ? `place_id:${a.locationPlaceId}` : encodeURIComponent(a.location);
                  const origin = enc(stops[0]);
                  const dest = enc(stops[stops.length - 1]);
                  const waypoints = stops.slice(1, -1).map(enc).join('|');
                  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
                  if (waypoints) url += `&waypoints=${waypoints}`;
                  return url;
                })()
              : null;
            return (
              <section key={d} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-indigo-300">Day {d}</h2>
                  {routeHref && (
                    <a
                      href={routeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] px-2.5 py-1 rounded-full border border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/30 transition-colors"
                    >🗺 동선 보기</a>
                  )}
                </div>
                <ol className="space-y-3">
                  {byDay.get(d)!.map((a, i) => {
                    const mapsHref = a.locationPlaceId
                      ? `https://www.google.com/maps/place/?q=place_id:${a.locationPlaceId}`
                      : a.location
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`
                        : null;
                    return (
                      <li key={a.id} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-[11px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {a.time && <span className="text-[11px] text-slate-400 tabular-nums">{a.time}</span>}
                            <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                            {a.cost > 0 && (
                              <span className="text-[11px] text-slate-500">
                                {a.currency === 'KRW' ? `${(a.cost / 10000).toLocaleString()}만원` : `${a.cost.toLocaleString()} ${a.currency}`}
                              </span>
                            )}
                          </div>
                          {a.location && (
                            mapsHref ? (
                              <a
                                href={mapsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-300 mt-1"
                              >
                                📍 <span className="truncate">{a.location}</span>
                                <span className="opacity-60">↗</span>
                              </a>
                            ) : (
                              <p className="text-[11px] text-slate-500 mt-1">📍 {a.location}</p>
                            )
                          )}
                          {a.notes && (
                            <p className="text-[11px] text-slate-400 mt-1">{a.notes}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })
        )}

        {trip.notes && (
          <section className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">메모</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{trip.notes}</p>
          </section>
        )}

        <footer className="text-center pt-6 pb-12">
          <p className="text-xs text-slate-500 mb-3">
            {new Date(pub.updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })} 공유됨
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
          >
            나도 TRIP-B로 일정 만들기 →
          </Link>
        </footer>
      </main>
    </div>
  );
}
