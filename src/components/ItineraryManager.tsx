'use client';

import { useState, useEffect, useRef } from 'react';
import { COUNTRIES } from '@/lib/travel-data';
import type { RecommendedPlace } from '@/lib/recommended-places';
import { useLang } from '@/context/LangContext';

interface Activity {
  id: string;
  day: number;
  time: string;
  title: string;
  location: string;
  locationPlaceId?: string;
  rating?: number;
  cost: number;
  currency: string;
  type: 'flight' | 'accommodation' | 'food' | 'activity' | 'transport' | 'other';
  notes: string;
  city?: string;
  menuItems?: string[];
  transportMode?: string;
  order?: number;
  lat?: number;
  lng?: number;
}

interface Trip {
  id: string;
  name: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  notes: string;
  activities: Activity[];
  createdAt: string;
}

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  priceLevel?: number;
  location?: { lat: number; lng: number };
}

// Google price_level (0–4) → local-currency estimate per visit.
// Table mirrors /api/places/recommend so the form prefill stays consistent.
const PRICE_LEVEL_LOCAL_BY_CURRENCY: Record<string, readonly number[]> = {
  KRW: [0, 12000, 30000, 80000, 180000],
  JPY: [0, 1500, 3500, 9000, 20000],
  USD: [0, 12, 28, 65, 140],
  EUR: [0, 11, 25, 60, 130],
  GBP: [0, 10, 22, 55, 120],
  CNY: [0, 80, 200, 500, 1100],
  THB: [0, 400, 1000, 2500, 5500],
  VND: [0, 250000, 600000, 1500000, 3500000],
  TWD: [0, 350, 900, 2200, 5000],
  SGD: [0, 15, 35, 85, 180],
  HKD: [0, 90, 220, 550, 1200],
  PHP: [0, 650, 1500, 3800, 8000],
  IDR: [0, 150000, 400000, 1000000, 2200000],
  AUD: [0, 18, 42, 100, 210],
  CAD: [0, 16, 38, 90, 190],
  CHF: [0, 11, 26, 60, 130],
  TRY: [0, 400, 900, 2200, 4800],
  AED: [0, 45, 100, 240, 520],
  EGP: [0, 600, 1400, 3300, 7000],
  MAD: [0, 120, 280, 650, 1400],
  INR: [0, 1000, 2400, 5500, 12000],
  MXN: [0, 200, 480, 1100, 2400],
  NZD: [0, 20, 45, 110, 230],
  MYR: [0, 55, 130, 300, 650],
  NPR: [0, 1500, 3500, 8500, 18000],
  MNT: [0, 40000, 95000, 220000, 500000],
};
function priceLevelToLocal(priceLevel: number | undefined, currency: string): number {
  if (priceLevel === undefined) return 0;
  const table = PRICE_LEVEL_LOCAL_BY_CURRENCY[currency] ?? PRICE_LEVEL_LOCAL_BY_CURRENCY.USD;
  return table[Math.max(0, Math.min(4, priceLevel))] ?? 0;
}

const TYPE_COLORS: Record<Activity['type'], string> = {
  flight:        'bg-indigo-900/30 border-indigo-700/50 text-indigo-300',
  accommodation: 'bg-violet-900/30 border-violet-700/50 text-violet-300',
  food:          'bg-amber-900/30 border-amber-700/50 text-amber-300',
  activity:      'bg-emerald-900/30 border-emerald-700/50 text-emerald-300',
  transport:     'bg-sky-900/30 border-sky-700/50 text-sky-300',
  other:         'bg-slate-700/50 border-slate-600/50 text-slate-300',
};
const TYPE_ICONS: Record<Activity['type'], string> = {
  flight: '✈️', accommodation: '🏨', food: '🍽️',
  activity: '🎯', transport: '🚌', other: '📌',
};

// ── Currency chip presets ───────────────────────────────────────────
type ChipSet = { amounts: number[]; label: (n: number) => string };

const ACTIVITY_CHIPS: Record<string, ChipSet> = {
  KRW: { amounts: [1, 3, 5, 10, 20, 50, 100],        label: n => `${n}만` },
  JPY: { amounts: [500, 1000, 3000, 5000, 10000, 30000], label: n => n >= 10000 ? `${n/10000}万` : `${n}` },
  USD: { amounts: [5, 10, 20, 50, 100, 200],           label: n => `$${n}` },
  EUR: { amounts: [5, 10, 20, 50, 100, 200],           label: n => `€${n}` },
  GBP: { amounts: [5, 10, 20, 50, 100, 200],           label: n => `£${n}` },
  AUD: { amounts: [5, 10, 20, 50, 100, 200],           label: n => `A$${n}` },
  CNY: { amounts: [10, 30, 50, 100, 200, 500],         label: n => `¥${n}` },
  SGD: { amounts: [5, 10, 20, 50, 100, 200],           label: n => `S$${n}` },
  THB: { amounts: [50, 100, 200, 500, 1000, 2000],     label: n => `฿${n}` },
};
const getActivityChips = (cur: string): ChipSet =>
  ACTIVITY_CHIPS[cur] ?? { amounts: [10, 30, 50, 100, 200, 500], label: n => `${n}` };

const BUDGET_CHIPS: Record<string, ChipSet> = {
  KRW: { amounts: [50, 100, 150, 200, 300, 500],           label: n => `${n}만원` },
  JPY: { amounts: [30000, 50000, 100000, 200000, 300000, 500000], label: n => `${n/10000}万` },
  USD: { amounts: [300, 500, 1000, 1500, 2000, 3000],      label: n => `$${n}` },
  EUR: { amounts: [300, 500, 1000, 1500, 2000, 3000],      label: n => `€${n}` },
  GBP: { amounts: [200, 400, 800, 1200, 2000, 3000],       label: n => `£${n}` },
  AUD: { amounts: [500, 1000, 1500, 2000, 3000, 5000],     label: n => `A$${n}` },
  CNY: { amounts: [2000, 5000, 8000, 10000, 20000, 30000], label: n => `¥${n}` },
  SGD: { amounts: [500, 800, 1200, 2000, 3000, 5000],      label: n => `S$${n}` },
  THB: { amounts: [10000, 20000, 30000, 50000, 80000, 100000], label: n => `฿${(n/1000).toFixed(0)}k` },
};
const getBudgetChips = (cur: string): ChipSet =>
  BUDGET_CHIPS[cur] ?? { amounts: [500, 1000, 1500, 2000, 3000, 5000], label: n => `${n}` };

function storageKey(userId: string) {
  return `trip-b-itineraries-${userId}`;
}

function loadTrips(userId: string): Trip[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(storageKey(userId)) || '[]'); }
  catch { return []; }
}
function saveTrips(userId: string, trips: Trip[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(trips));
}
function tripDays(trip: Trip): number {
  if (!trip.startDate || !trip.endDate) return 1;
  return Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000));
}

// Manual drag order takes precedence; fall back to time, then to insertion order.
function sortActivities(a: Activity, b: Activity): number {
  const ao = a.order, bo = b.order;
  if (ao !== undefined && bo !== undefined && ao !== bo) return ao - bo;
  if (ao !== undefined && bo === undefined) return -1;
  if (ao === undefined && bo !== undefined) return 1;
  return (a.time || '').localeCompare(b.time || '');
}

// Haversine distance in km between two coordinate points.
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Recommend a transit mode + rough duration between two activities using straight-line distance.
function suggestTransport(from: Activity, to: Activity): { icon: string; mode: string; minutes: number; km: number } | null {
  if (from.lat === undefined || from.lng === undefined || to.lat === undefined || to.lng === undefined) return null;
  const km = haversineKm({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
  if (km < 0.05) return null;
  if (km < 1.2) return { icon: '🚶', mode: '도보', minutes: Math.max(5, Math.round(km * 13)), km };
  if (km < 8)   return { icon: '🚇', mode: '지하철·버스', minutes: Math.round(10 + km * 3), km };
  if (km < 40)  return { icon: '🚕', mode: '택시·승차공유', minutes: Math.round(8 + km * 1.8), km };
  if (km < 400) return { icon: '🚄', mode: '고속철·기차', minutes: Math.round(30 + km * 0.4), km };
  return { icon: '✈️', mode: '국내선 항공', minutes: Math.round(60 + km * 0.1), km };
}

// ── Live place recommendations hook ────────────────────────────────
// Module-level cache so repeated opens/city-changes don't re-fetch
const _recsCache: Record<string, RecommendedPlace[]> = {};

function useLiveRecommendations(countryCode: string, cityEn: string, category: string) {
  const [places, setPlaces] = useState<RecommendedPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!countryCode) return;
    const key = `${countryCode}::${cityEn}::${category}`;
    if (_recsCache[key]) { setPlaces(_recsCache[key]); return; }
    setLoading(true);
    const params = new URLSearchParams({ countryCode, category });
    if (cityEn) params.set('city', cityEn);
    fetch(`/api/places/recommend?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        const result = (data.places ?? []) as RecommendedPlace[];
        _recsCache[key] = result;
        setPlaces(result);
      })
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [countryCode, cityEn, category]);

  return { places, loading };
}

// ── Places search hook ──────────────────────────────────────────────
function usePlacesSearch(query: string) {
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}&lang=ko`);
        const data = await res.json();
        setResults(data.places || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return { results, loading };
}

// ── Main component ──────────────────────────────────────────────────
export default function ItineraryManager({ userId }: { userId: string }) {
  const { t } = useLang();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => { setTrips(loadTrips(userId)); }, [userId]);

  const persist = (updated: Trip[]) => { setTrips(updated); saveTrips(userId, updated); };

  const deleteTrip = (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    persist(trips.filter(t => t.id !== id));
    if (selectedTrip?.id === id) { setSelectedTrip(null); setView('list'); }
  };

  const updateTrip = (updated: Trip) => {
    persist(trips.map(t => t.id === updated.id ? updated : t));
    setSelectedTrip(updated);
  };

  const addActivity = (act: Omit<Activity, 'id'>) => {
    if (!selectedTrip) return;
    updateTrip({ ...selectedTrip, activities: [...selectedTrip.activities, { ...act, id: crypto.randomUUID() }] });
  };

  const addActivities = (acts: Omit<Activity, 'id'>[]) => {
    if (!selectedTrip) return;
    updateTrip({ ...selectedTrip, activities: [...selectedTrip.activities, ...acts.map(a => ({ ...a, id: crypto.randomUUID() }))] });
  };

  const deleteActivity = (actId: string) => {
    if (!selectedTrip) return;
    updateTrip({ ...selectedTrip, activities: selectedTrip.activities.filter(a => a.id !== actId) });
  };

  const saveEdited = (act: Activity) => {
    if (!selectedTrip) return;
    updateTrip({ ...selectedTrip, activities: selectedTrip.activities.map(a => a.id === act.id ? act : a) });
    setEditingActivity(null);
  };

  const reorderActivity = (day: number, fromId: string, toId: string) => {
    if (!selectedTrip || fromId === toId) return;
    const dayActs = [...selectedTrip.activities]
      .filter(a => a.day === day)
      .sort(sortActivities);
    const fromIdx = dayActs.findIndex(a => a.id === fromId);
    const toIdx = dayActs.findIndex(a => a.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = dayActs.splice(fromIdx, 1);
    dayActs.splice(toIdx, 0, moved);
    const orderMap = new Map(dayActs.map((a, i) => [a.id, i]));
    updateTrip({
      ...selectedTrip,
      activities: selectedTrip.activities.map(a =>
        orderMap.has(a.id) ? { ...a, order: orderMap.get(a.id)! } : a
      ),
    });
  };

  const optimizeDayRoute = (day: number) => {
    if (!selectedTrip) return;
    const dayActs = selectedTrip.activities
      .filter(a => a.day === day)
      .sort(sortActivities);
    const withCoords = dayActs.filter(a => a.lat !== undefined && a.lng !== undefined);
    if (withCoords.length < 3) {
      alert('위치 좌표가 있는 활동이 3개 이상이어야 최적화할 수 있어요.');
      return;
    }
    // Nearest-neighbor TSP heuristic starting from the earliest-time activity
    const haversine = (a: Activity, b: Activity) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad((b.lat ?? 0) - (a.lat ?? 0));
      const dLng = toRad((b.lng ?? 0) - (a.lng ?? 0));
      const lat1 = toRad(a.lat ?? 0), lat2 = toRad(b.lat ?? 0);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return 2 * Math.asin(Math.sqrt(h));
    };
    const start = withCoords.find(a => a.time) ?? withCoords[0];
    const route: Activity[] = [start];
    const remaining = withCoords.filter(a => a.id !== start.id);
    while (remaining.length > 0) {
      const last = route[route.length - 1];
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversine(last, remaining[i]);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      }
      route.push(...remaining.splice(bestIdx, 1));
    }
    // Activities without coords keep their relative order, appended at the end
    const noCoord = dayActs.filter(a => a.lat === undefined || a.lng === undefined);
    const finalOrder = [...route, ...noCoord];
    const orderMap = new Map(finalOrder.map((a, i) => [a.id, i]));
    updateTrip({
      ...selectedTrip,
      activities: selectedTrip.activities.map(a =>
        orderMap.has(a.id) ? { ...a, order: orderMap.get(a.id)! } : a
      ),
    });
  };

  const [showMap, setShowMap] = useState(false);
  const [mapDay, setMapDay] = useState(1);
  const [showExplorer, setShowExplorer] = useState(false);

  // ── DETAIL VIEW ──────────────────────────────────────────────────
  if (view === 'detail' && selectedTrip) {
    const days = tripDays(selectedTrip);
    const country = COUNTRIES.find(c => c.code === selectedTrip.countryCode);
    const totalCost = selectedTrip.activities.reduce((s, a) => s + (a.cost || 0), 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5 transition-colors">
            {t.back}
          </button>
          <button onClick={() => deleteTrip(selectedTrip.id)} className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg border border-red-800/50 hover:bg-red-900/20 transition-all">
            {t.deleteTrip}
          </button>
        </div>

        {/* Trip header */}
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{country?.flag ?? '🌍'}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{selectedTrip.name}</h2>
              <p className="text-sm text-slate-400">
                {selectedTrip.startDate && selectedTrip.endDate
                  ? `${selectedTrip.startDate} ~ ${selectedTrip.endDate} · ${t.nightsDay(days)}`
                  : `${country?.nameKR ?? selectedTrip.countryCode}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: t.budget, value: selectedTrip.budget > 0 ? fmtAmount(selectedTrip.budget, selectedTrip.currency) : '—', color: 'text-slate-300' },
              { label: t.budgetUsed, value: totalCost > 0 ? fmtAmount(totalCost, selectedTrip.currency) : '—', color: 'text-emerald-400' },
              ...(selectedTrip.budget > 0 && totalCost > 0 ? [{ label: `${Math.round((totalCost / selectedTrip.budget) * 100)}%`, value: '', color: totalCost > selectedTrip.budget ? 'text-red-400' : 'text-indigo-400' }] : []),
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-700/50 rounded-xl px-4 py-2">
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {selectedTrip.budget > 0 && totalCost > 0 && (
            <div className="mt-3 w-full bg-slate-700/40 rounded-full h-1.5">
              <div
                className={`h-full rounded-full transition-all ${totalCost > selectedTrip.budget ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((totalCost / selectedTrip.budget) * 100, 100)}%` }}
              />
            </div>
          )}

          {selectedTrip.notes && (
            <p className="mt-3 text-sm text-slate-400 bg-slate-700/30 rounded-xl px-4 py-2">{selectedTrip.notes}</p>
          )}
        </div>

        {/* Activity header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-300">{t.modeItinerary}</h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setShowMap(v => !v); setShowExplorer(false); if (!showMap) setMapDay(1); }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${showMap ? 'bg-emerald-700/40 border-emerald-600/60 text-emerald-300' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
            >
              🗺️ 지도
            </button>
            <button
              onClick={() => { setShowExplorer(v => !v); setShowMap(false); }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${showExplorer ? 'bg-violet-700/40 border-violet-600/60 text-violet-300' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
            >
              🛍️ 장소 탐색
            </button>
            <button
              onClick={() => { setEditingActivity(null); setShowActivityForm(v => !v); setShowExplorer(false); setShowMap(false); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              {showActivityForm ? t.cancel : t.addActivity}
            </button>
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <MapView
            activities={selectedTrip.activities}
            days={days}
            selectedDay={mapDay}
            onDayChange={setMapDay}
            startDate={selectedTrip.startDate}
          />
        )}

        {/* Place Explorer */}
        {showExplorer && (
          <PlaceExplorer
            countryCode={selectedTrip.countryCode}
            days={days}
            defaultCurrency={selectedTrip.currency}
            onConfirm={(acts) => {
              addActivities(acts);
              setShowExplorer(false);
            }}
            onClose={() => setShowExplorer(false)}
          />
        )}

        {showActivityForm && (
          <ActivityForm
            days={days}
            editing={editingActivity}
            defaultCurrency={selectedTrip.currency}
            countryName={country?.nameKR ?? ''}
            countryCode={selectedTrip.countryCode}
            suggestedCity={(() => {
              // 가장 최근 city가 지정된 활동에서 도시 추론
              const withCity = [...selectedTrip.activities].reverse().find(a => a.city && a.city !== '전국');
              return withCity?.city ?? null;
            })()}
            onSave={(act) => {
              if (editingActivity) saveEdited({ ...act, id: editingActivity.id });
              else addActivity(act);
              setShowActivityForm(false);
            }}
            onCancel={() => { setShowActivityForm(false); setEditingActivity(null); }}
          />
        )}

        {/* Day groups */}
        {Array.from({ length: days }, (_, i) => i + 1).map(day => {
          const dayActs = selectedTrip.activities
            .filter(a => a.day === day)
            .sort(sortActivities);
          const coordCount = dayActs.filter(a => a.lat !== undefined && a.lng !== undefined).length;
          return (
            <div key={day} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                  Day {day}
                  {selectedTrip.startDate && (() => {
                    const d = new Date(selectedTrip.startDate);
                    d.setDate(d.getDate() + day - 1);
                    return <span className="text-slate-500 ml-1.5">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>;
                  })()}
                </span>
                {coordCount >= 3 && (
                  <button
                    onClick={() => optimizeDayRoute(day)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 transition-colors"
                    title="위치 좌표 기반으로 최단 동선 정렬"
                  >
                    🧭 동선 최적화
                  </button>
                )}
                <div className="flex-1 h-px bg-slate-700/60" />
                <span className="text-[10px] text-slate-500">
                  {(() => {
                    const total = dayActs.reduce((s, a) => s + (a.cost || 0), 0);
                    return fmtAmount(total, selectedTrip.currency);
                  })()}
                </span>
              </div>

              {dayActs.length === 0 && <p className="text-xs text-slate-600 pl-3">{t.noTripsHint}</p>}

              {dayActs.map((act, idx) => {
                const actColor = TYPE_COLORS[act.type];
                const actIcon = TYPE_ICONS[act.type];
                const prev = idx > 0 ? dayActs[idx - 1] : null;
                const transit = prev ? suggestTransport(prev, act) : null;
                return (
                <div key={act.id}>
                  {transit && (
                    <div className="flex items-center gap-2 pl-5 py-0.5 text-[10px] text-slate-500">
                      <span className="w-px h-3 bg-slate-700" />
                      <span>{transit.icon}</span>
                      <span className="text-slate-400">{transit.mode}</span>
                      <span className="text-slate-600">·</span>
                      <span>~{transit.minutes}분</span>
                      <span className="text-slate-600">·</span>
                      <span>{transit.km < 1 ? `${Math.round(transit.km * 1000)}m` : `${transit.km.toFixed(1)}km`}</span>
                    </div>
                  )}
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', act.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromId = e.dataTransfer.getData('text/plain');
                      if (fromId) reorderActivity(day, fromId, act.id);
                    }}
                    className={`p-3 rounded-xl border ${actColor} flex items-start gap-3 cursor-move hover:brightness-110 transition-all`}
                  >
                    <span className="text-slate-500 mt-1 select-none" aria-hidden>⋮⋮</span>
                    <span className="text-lg mt-0.5 shrink-0">{actIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{act.title}</p>
                            {act.city && <span className="text-[10px] text-slate-500 shrink-0 bg-slate-700/60 px-1.5 py-0.5 rounded-full">{act.city}</span>}
                          </div>
                          {act.location && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>📍</span>
                              <span className="truncate">{act.location}</span>
                              {act.rating && <span className="shrink-0 text-amber-400">★ {act.rating}</span>}
                            </p>
                          )}
                          {act.transportMode && (
                            <p className="text-xs text-sky-400 mt-0.5">🚌 {act.transportMode}</p>
                          )}
                          {act.menuItems && act.menuItems.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {act.menuItems.map(item => (
                                <span key={item} className="text-[10px] bg-amber-900/30 text-amber-300 border border-amber-800/40 px-1.5 py-0.5 rounded-md">{item}</span>
                              ))}
                            </div>
                          )}
                          {act.notes && <p className="text-xs text-slate-500 mt-0.5">{act.notes}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          {act.time && <p className="text-xs text-slate-500">{act.time}</p>}
                          {act.cost > 0 && (
                            <p className="text-xs font-semibold text-slate-300">
                              {fmtAmount(act.cost, act.currency)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => { setEditingActivity(act); setShowActivityForm(true); }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-all"
                      >{t.editTrip}</button>
                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="text-[10px] text-red-500 hover:text-red-400 px-1.5 py-0.5 rounded border border-red-900/50 hover:border-red-700 transition-all"
                      >{t.deleteTrip}</button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // ── CREATE VIEW ────────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <CreateTripForm
        onSave={(trip) => { persist([...trips, trip]); setView('list'); }}
        onCancel={() => setView('list')}
      />
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">{t.itineraryTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{trips.length} {t.totalActivities}</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          {t.newTrip}
        </button>
      </div>

      {trips.length === 0 && (
        <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700/60">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm text-slate-400">{t.noTrips}</p>
          <p className="text-xs mt-1 text-slate-500">{t.noTripsHint}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map(trip => {
          const country = COUNTRIES.find(c => c.code === trip.countryCode);
          const days = tripDays(trip);
          const totalCost = trip.activities.reduce((s, a) => s + (a.cost || 0), 0);
          return (
            <button
              key={trip.id}
              onClick={() => { setSelectedTrip(trip); setView('detail'); }}
              className="p-4 rounded-2xl border border-slate-700/60 bg-slate-800 hover:border-indigo-600/60 transition-all text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{country?.flag ?? '🌍'}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">{trip.name}</p>
                  <p className="text-xs text-slate-400">{country?.nameKR ?? trip.countryCode} · {t.nightsDay(days)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">{trip.startDate} ~ {trip.endDate}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{trip.activities.length} {t.totalActivities}</span>
                {trip.budget > 0 && (
                  <span className="text-slate-400">{fmtAmount(totalCost, trip.currency)} / {fmtAmount(trip.budget, trip.currency)}</span>
                )}
              </div>
              {trip.budget > 0 && (
                <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1">
                  <div
                    className={`h-full rounded-full ${totalCost > trip.budget ? 'bg-red-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min((totalCost / trip.budget) * 100, 100)}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Create trip form ────────────────────────────────────────────────
function CreateTripForm({ onSave, onCancel }: { onSave: (trip: Trip) => void; onCancel: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('JP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState(COUNTRY_DEFAULT_CURRENCY['JP'] ?? 'KRW');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim()) { alert(t.tripName); return; }
    if (startDate && endDate && endDate < startDate) { alert('종료일이 시작일보다 빠를 수 없어요.'); return; }
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(), countryCode, startDate, endDate,
      budget: currency === 'KRW' ? (Number(budget) || 0) * 10000 : (Number(budget) || 0), currency,
      notes: notes.trim(), activities: [],
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">{t.createTrip}</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">✕</button>
      </div>

      <Field label={t.tripName}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t.tripNamePlaceholder} className={inputCls} />
      </Field>

      <Field label={t.tripCountry}>
        <select
          value={countryCode}
          onChange={e => {
            setCountryCode(e.target.value);
            const def = COUNTRY_DEFAULT_CURRENCY[e.target.value];
            if (def) { setCurrency(def); setBudget(''); }
          }}
          className={inputCls}
        >
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.nameKR}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t.startDate}>
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) setEndDate(e.target.value);
            }}
            max={endDate || undefined}
            className={inputCls}
          />
        </Field>
        <Field label={t.endDate}>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate || undefined}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label={t.budget}>
        <div className="flex gap-2 mb-2 max-w-xs">
          <select value={currency} onChange={e => { setCurrency(e.target.value); setBudget(''); }} className="bg-slate-700/50 border border-slate-600 rounded-xl px-2 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors shrink-0 w-[88px]">
            {['KRW','JPY','USD','EUR','GBP','AUD','CNY','SGD','THB'].map(c => <option key={c} value={c}>{CURRENCY_FLAG[c] ?? '💱'} {c}</option>)}
          </select>
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              inputMode="numeric"
              value={budget}
              onChange={e => setBudget(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className={`${inputCls} w-full ${currency === 'KRW' ? 'pr-12' : ''} text-right font-mono`}
            />
            {currency === 'KRW' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none font-medium">만원</span>
            )}
          </div>
        </div>
        {currency === 'KRW' && <p className="text-[10px] text-slate-500 -mt-1 mb-1">예: 150 → 150만원 (1,500,000원)</p>}
        <div className="flex flex-wrap gap-1.5">
          {getBudgetChips(currency).amounts.map(v => (
            <button key={v} type="button" onClick={() => setBudget(String(v))}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${budget === String(v) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600'}`}>
              {getBudgetChips(currency).label(v)}
            </button>
          ))}
        </div>
      </Field>

      <Field label={t.notes}>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2} className={`${inputCls} resize-none`} />
      </Field>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors">{t.cancel}</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">{t.save}</button>
      </div>
    </div>
  );
}

const TRANSPORT_MODES = ['지하철', '버스', '택시', '도보', '고속철', '신칸센', 'MRT', '트램', '페리', '비행기', '렌터카', '오토바이', '기차'];

// ── Country → city list (ko display / en for Google queries) ────────
const COUNTRY_CITY_MAP: Record<string, { ko: string; en: string }[]> = {
  JP: [
    { ko: '도쿄', en: 'Tokyo' }, { ko: '오사카', en: 'Osaka' },
    { ko: '교토', en: 'Kyoto' }, { ko: '후쿠오카', en: 'Fukuoka' },
    { ko: '나라', en: 'Nara' }, { ko: '삿포로', en: 'Sapporo' },
    { ko: '나고야', en: 'Nagoya' }, { ko: '가마쿠라', en: 'Kamakura' },
    { ko: '히로시마', en: 'Hiroshima' }, { ko: '오키나와', en: 'Okinawa' },
  ],
  TH: [
    { ko: '방콕', en: 'Bangkok' }, { ko: '푸켓', en: 'Phuket' },
    { ko: '치앙마이', en: 'Chiang Mai' }, { ko: '파타야', en: 'Pattaya' },
    { ko: '코사무이', en: 'Koh Samui' }, { ko: '코창', en: 'Koh Chang' },
  ],
  VN: [
    { ko: '하노이', en: 'Hanoi' }, { ko: '호찌민', en: 'Ho Chi Minh City' },
    { ko: '다낭', en: 'Da Nang' }, { ko: '호이안', en: 'Hoi An' },
    { ko: '하롱', en: 'Ha Long' }, { ko: '냐짱', en: 'Nha Trang' },
    { ko: '달랏', en: 'Da Lat' }, { ko: '푸꾸옥', en: 'Phu Quoc' },
  ],
  TW: [
    { ko: '타이베이', en: 'Taipei' }, { ko: '타이중', en: 'Taichung' },
    { ko: '가오슝', en: 'Kaohsiung' }, { ko: '타이난', en: 'Tainan' },
    { ko: '화롄', en: 'Hualien' }, { ko: '컨딩', en: 'Kenting' },
  ],
  SG: [{ ko: '싱가포르', en: 'Singapore' }],
  HK: [{ ko: '홍콩', en: 'Hong Kong' }, { ko: '마카오', en: 'Macau' }],
  FR: [
    { ko: '파리', en: 'Paris' }, { ko: '니스', en: 'Nice' },
    { ko: '리옹', en: 'Lyon' }, { ko: '마르세유', en: 'Marseille' },
    { ko: '보르도', en: 'Bordeaux' }, { ko: '몽생미셸', en: 'Mont Saint Michel' },
  ],
  ES: [
    { ko: '바르셀로나', en: 'Barcelona' }, { ko: '마드리드', en: 'Madrid' },
    { ko: '세비야', en: 'Seville' }, { ko: '그라나다', en: 'Granada' },
    { ko: '발렌시아', en: 'Valencia' }, { ko: '산티아고', en: 'Santiago de Compostela' },
  ],
  IT: [
    { ko: '로마', en: 'Rome' }, { ko: '밀라노', en: 'Milan' },
    { ko: '베네치아', en: 'Venice' }, { ko: '피렌체', en: 'Florence' },
    { ko: '나폴리', en: 'Naples' }, { ko: '아말피', en: 'Amalfi' },
    { ko: '시칠리아', en: 'Sicily' }, { ko: '친퀘테레', en: 'Cinque Terre' },
  ],
  TR: [
    { ko: '이스탄불', en: 'Istanbul' }, { ko: '카파도키아', en: 'Cappadocia' },
    { ko: '안탈리아', en: 'Antalya' }, { ko: '파묵칼레', en: 'Pamukkale' },
    { ko: '에페스', en: 'Ephesus' }, { ko: '보드룸', en: 'Bodrum' },
  ],
  GR: [
    { ko: '아테네', en: 'Athens' }, { ko: '산토리니', en: 'Santorini' },
    { ko: '미코노스', en: 'Mykonos' }, { ko: '크레타', en: 'Crete' },
    { ko: '로도스', en: 'Rhodes' },
  ],
  PT: [
    { ko: '리스본', en: 'Lisbon' }, { ko: '포르투', en: 'Porto' },
    { ko: '알가르베', en: 'Algarve' }, { ko: '신트라', en: 'Sintra' },
  ],
  US: [
    { ko: '뉴욕', en: 'New York' }, { ko: '로스앤젤레스', en: 'Los Angeles' },
    { ko: '하와이', en: 'Hawaii' }, { ko: '라스베가스', en: 'Las Vegas' },
    { ko: '샌프란시스코', en: 'San Francisco' }, { ko: '시카고', en: 'Chicago' },
    { ko: '마이애미', en: 'Miami' }, { ko: '시애틀', en: 'Seattle' },
    { ko: '보스턴', en: 'Boston' }, { ko: '워싱턴DC', en: 'Washington DC' },
  ],
  CA: [
    { ko: '밴쿠버', en: 'Vancouver' }, { ko: '토론토', en: 'Toronto' },
    { ko: '퀘벡', en: 'Quebec City' }, { ko: '몬트리올', en: 'Montreal' },
    { ko: '밴프', en: 'Banff' },
  ],
  AU: [
    { ko: '시드니', en: 'Sydney' }, { ko: '멜버른', en: 'Melbourne' },
    { ko: '골드코스트', en: 'Gold Coast' }, { ko: '케언스', en: 'Cairns' },
    { ko: '브리즈번', en: 'Brisbane' }, { ko: '퍼스', en: 'Perth' },
  ],
  NZ: [
    { ko: '오클랜드', en: 'Auckland' }, { ko: '퀸스타운', en: 'Queenstown' },
    { ko: '크라이스트처치', en: 'Christchurch' }, { ko: '웰링턴', en: 'Wellington' },
  ],
  GB: [
    { ko: '런던', en: 'London' }, { ko: '에딘버러', en: 'Edinburgh' },
    { ko: '맨체스터', en: 'Manchester' }, { ko: '옥스포드', en: 'Oxford' },
    { ko: '코츠월드', en: 'Cotswolds' },
  ],
  DE: [
    { ko: '베를린', en: 'Berlin' }, { ko: '뮌헨', en: 'Munich' },
    { ko: '함부르크', en: 'Hamburg' }, { ko: '프랑크푸르트', en: 'Frankfurt' },
    { ko: '로텐부르크', en: 'Rothenburg' }, { ko: '퓌센', en: 'Fussen' },
  ],
  AT: [
    { ko: '빈', en: 'Vienna' }, { ko: '잘츠부르크', en: 'Salzburg' },
    { ko: '인스브루크', en: 'Innsbruck' }, { ko: '할슈타트', en: 'Hallstatt' },
  ],
  CH: [
    { ko: '취리히', en: 'Zurich' }, { ko: '제네바', en: 'Geneva' },
    { ko: '인터라켄', en: 'Interlaken' }, { ko: '루체른', en: 'Lucerne' },
  ],
  NL: [
    { ko: '암스테르담', en: 'Amsterdam' }, { ko: '로테르담', en: 'Rotterdam' },
    { ko: '헤이그', en: 'The Hague' }, { ko: '잔세스칸스', en: 'Zaanse Schans' },
  ],
  BE: [
    { ko: '브뤼셀', en: 'Brussels' }, { ko: '브뤼헤', en: 'Bruges' },
    { ko: '겐트', en: 'Ghent' }, { ko: '앤트워프', en: 'Antwerp' },
  ],
  CN: [
    { ko: '베이징', en: 'Beijing' }, { ko: '상하이', en: 'Shanghai' },
    { ko: '청두', en: 'Chengdu' }, { ko: '시안', en: "Xi'an" },
    { ko: '계림', en: 'Guilin' }, { ko: '장자제', en: 'Zhangjiajie' },
  ],
  IN: [
    { ko: '뉴델리', en: 'New Delhi' }, { ko: '뭄바이', en: 'Mumbai' },
    { ko: '바라나시', en: 'Varanasi' }, { ko: '아그라', en: 'Agra' },
    { ko: '자이푸르', en: 'Jaipur' }, { ko: '고아', en: 'Goa' },
  ],
  PH: [
    { ko: '마닐라', en: 'Manila' }, { ko: '세부', en: 'Cebu' },
    { ko: '보라카이', en: 'Boracay' }, { ko: '팔라완', en: 'Palawan' },
    { ko: '시아르가오', en: 'Siargao' },
  ],
  ID: [
    { ko: '발리', en: 'Bali' }, { ko: '자카르타', en: 'Jakarta' },
    { ko: '롬복', en: 'Lombok' }, { ko: '족자카르타', en: 'Yogyakarta' },
    { ko: '코모도', en: 'Komodo' },
  ],
  MA: [
    { ko: '마라케시', en: 'Marrakech' }, { ko: '페스', en: 'Fez' },
    { ko: '카사블랑카', en: 'Casablanca' }, { ko: '셰프샤우엔', en: 'Chefchaouen' },
  ],
  AE: [
    { ko: '두바이', en: 'Dubai' }, { ko: '아부다비', en: 'Abu Dhabi' },
  ],
  MX: [
    { ko: '멕시코시티', en: 'Mexico City' }, { ko: '칸쿤', en: 'Cancun' },
    { ko: '과달라하라', en: 'Guadalajara' }, { ko: '플라야델카르멘', en: 'Playa del Carmen' },
  ],
  BR: [
    { ko: '리우데자네이루', en: 'Rio de Janeiro' }, { ko: '상파울루', en: 'Sao Paulo' },
    { ko: '이과수', en: 'Iguazu' }, { ko: '포르탈레자', en: 'Fortaleza' },
  ],
  PE: [
    { ko: '리마', en: 'Lima' }, { ko: '쿠스코', en: 'Cusco' },
    { ko: '마추픽추', en: 'Machu Picchu' },
  ],
};

// ── Country default currency ────────────────────────────────────────
const COUNTRY_DEFAULT_CURRENCY: Record<string, string> = {
  JP: 'JPY', KR: 'KRW', TH: 'THB', VN: 'VND', TW: 'TWD', SG: 'SGD',
  HK: 'HKD', CN: 'CNY', PH: 'PHP', ID: 'IDR', IN: 'INR', MY: 'MYR',
  FR: 'EUR', ES: 'EUR', IT: 'EUR', DE: 'EUR', GR: 'EUR', PT: 'EUR',
  NL: 'EUR', AT: 'EUR', BE: 'EUR', CH: 'CHF', GB: 'GBP',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN',
  US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  TR: 'TRY', AE: 'AED', SA: 'SAR', IL: 'ILS',
  MX: 'MXN', BR: 'BRL', AR: 'ARS', PE: 'PEN', CL: 'CLP',
  ZA: 'ZAR', MA: 'MAD', EG: 'EGP',
};

// Currency code → representative flag emoji for inline amount display.
const CURRENCY_FLAG: Record<string, string> = {
  KRW: '🇰🇷', JPY: '🇯🇵', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧',
  CNY: '🇨🇳', HKD: '🇭🇰', TWD: '🇹🇼', SGD: '🇸🇬', THB: '🇹🇭',
  VND: '🇻🇳', PHP: '🇵🇭', IDR: '🇮🇩', MYR: '🇲🇾', INR: '🇮🇳',
  AUD: '🇦🇺', NZD: '🇳🇿', CAD: '🇨🇦', CHF: '🇨🇭', TRY: '🇹🇷',
  AED: '🇦🇪', SAR: '🇸🇦', ILS: '🇮🇱', EGP: '🇪🇬', MAD: '🇲🇦',
  MXN: '🇲🇽', BRL: '🇧🇷', ARS: '🇦🇷', PEN: '🇵🇪', CLP: '🇨🇱',
  ZAR: '🇿🇦', SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', PLN: '🇵🇱',
  CZK: '🇨🇿', HUF: '🇭🇺', RON: '🇷🇴', MNT: '🇲🇳', NPR: '🇳🇵',
};

function fmtAmount(amount: number, currency: string): string {
  if (currency === 'KRW') return `${(amount / 10000).toLocaleString()}만원`;
  const flag = CURRENCY_FLAG[currency] ?? '💱';
  return `${flag} ${Number(amount).toLocaleString()}`;
}

// ── Activity form with Google Places search ─────────────────────────
function ActivityForm({
  days, editing, defaultCurrency, countryName, countryCode, suggestedCity, onSave, onCancel,
}: {
  days: number;
  editing: Activity | null;
  defaultCurrency: string;
  countryName: string;
  countryCode: string;
  suggestedCity?: string | null;
  onSave: (act: Omit<Activity, 'id'>) => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  const [day, setDay] = useState(editing?.day ?? 1);
  const [time, setTime] = useState(editing?.time ?? '');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [locationQuery, setLocationQuery] = useState(editing?.location ?? '');
  const [locationConfirmed, setLocationConfirmed] = useState(editing?.location ?? '');
  const [locationPlaceId, setLocationPlaceId] = useState(editing?.locationPlaceId ?? '');
  const [placeLat, setPlaceLat] = useState<number | undefined>(editing?.lat);
  const [placeLng, setPlaceLng] = useState<number | undefined>(editing?.lng);
  const [rating, setRating] = useState(editing?.rating);
  const toDisplay = (rawKRW: number, cur: string) => cur === 'KRW' ? String(rawKRW / 10000) : String(rawKRW);
  const [cost, setCost] = useState(editing ? toDisplay(editing.cost, editing.currency) : '');
  const [currency, setCurrency] = useState(editing?.currency ?? defaultCurrency);
  const [type, setType] = useState<Activity['type']>(editing?.type ?? 'activity');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>(editing?.menuItems ?? []);
  const [availableMenuItems, setAvailableMenuItems] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState(editing?.transportMode ?? '');
  const [showRecommended, setShowRecommended] = useState(!editing);
  // 현재 도시 필터: 이전 활동에서 추론된 도시 혹은 editing 중인 활동의 도시
  const [filterCity, setFilterCity] = useState<string>(editing?.city ?? suggestedCity ?? '');
  const searchRef = useRef<HTMLDivElement>(null);

  const cities = COUNTRY_CITY_MAP[countryCode] ?? [];
  const cityEn = cities.find(c => c.ko === filterCity)?.en ?? '';
  const { places: recommendedPlaces, loading: loadingRecs } = useLiveRecommendations(countryCode, cityEn, 'all');
  const availableCities = cities.map(c => c.ko);

  const applyRecommended = (place: RecommendedPlace) => {
    setTitle(place.name);
    setLocationQuery(place.nameLocal);
    setLocationConfirmed(place.nameLocal);
    if (place.placeId) setLocationPlaceId(place.placeId);
    if (place.lat !== undefined) setPlaceLat(place.lat);
    if (place.lng !== undefined) setPlaceLng(place.lng);
    setType(place.type === 'food' ? 'food' : place.type === 'transport' ? 'transport' : place.type === 'accommodation' ? 'accommodation' : 'activity');
    setCurrency(place.currency);
    setCost(place.currency === 'KRW' ? String(place.costKRW / 10000) : String(place.costLocal));
    if (place.rating) setRating(place.rating);
    if (place.menuItems) { setAvailableMenuItems(place.menuItems); setSelectedMenuItems([]); }
    else setAvailableMenuItems([]);
    if (place.city && place.city !== '전국') {
      // Live API returns English city names; map back to Korean for display
      const koCity = COUNTRY_CITY_MAP[countryCode]?.find(c => c.en === place.city)?.ko ?? place.city;
      setFilterCity(koCity);
    }
    if (place.transportPreset) setTransportMode(place.transportPreset.mode + (place.transportPreset.route ? ` — ${place.transportPreset.route}` : ''));
    else setTransportMode('');
    setShowRecommended(false);
  };

  const toggleMenuItem = (item: string) => {
    setSelectedMenuItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  // append country name to narrow results
  const searchQuery = locationQuery.length >= 2
    ? (countryName ? `${locationQuery} ${countryName}` : locationQuery)
    : '';
  const { results, loading } = usePlacesSearch(searchQuery);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectPlace = (p: PlaceSuggestion) => {
    setLocationQuery(p.name);
    setLocationConfirmed(p.name);
    setLocationPlaceId(p.placeId);
    setRating(p.rating);
    if (!title) setTitle(p.name);
    // Pre-fill cost from Google price_level if nothing entered yet
    if (!cost && p.priceLevel !== undefined) {
      const local = priceLevelToLocal(p.priceLevel, currency);
      if (local > 0) {
        setCost(currency === 'KRW' ? String(Math.round(local / 10000)) : String(local));
      }
    }
    if (p.location) { setPlaceLat(p.location.lat); setPlaceLng(p.location.lng); }
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      day, time, title: title.trim(),
      location: locationConfirmed || locationQuery,
      locationPlaceId, rating,
      cost: currency === 'KRW' ? (Number(cost) || 0) * 10000 : (Number(cost) || 0), currency, type,
      notes,
      city: filterCity || undefined,
      menuItems: selectedMenuItems.length > 0 ? selectedMenuItems : undefined,
      transportMode: transportMode.trim() || undefined,
      lat: placeLat,
      lng: placeLng,
    });
  };

  return (
    <div className="rounded-2xl p-4 border border-indigo-700/40 bg-indigo-900/10 space-y-3 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">{editing ? t.editTrip : t.addActivity}</h3>
        {!editing && (
          <button
            type="button"
            onClick={() => setShowRecommended(v => !v)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${showRecommended ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
          >
            {loadingRecs ? <span className="w-2 h-2 rounded-full bg-current animate-pulse inline-block" /> : '⭐'}
            구글 추천
          </button>
        )}
      </div>

      {/* Recommended Places Quick-Select */}
      {showRecommended && (
        <div className="space-y-2.5">
          {/* 도시 필터 */}
          {availableCities.length > 1 && (
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFilterCity('')}
                className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all ${!filterCity ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
              >전체</button>
              {availableCities.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFilterCity(city === filterCity ? '' : city)}
                  className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all ${filterCity === city ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
                >{city}</button>
              ))}
            </div>
          )}
          {filterCity && (
            <p className="text-[10px] text-indigo-400">📍 {filterCity} 기준 구글 추천</p>
          )}
          {/* 카테고리별 목록 */}
          {loadingRecs ? (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-24 rounded-xl bg-slate-700/50 animate-pulse" />
              ))}
            </div>
          ) : recommendedPlaces.length === 0 ? (
            <p className="text-[10px] text-slate-600 py-1">추천 장소를 불러오지 못했어요</p>
          ) : (
            (['food', 'activity', 'transport', 'accommodation'] as const).map(cat => {
              const items = recommendedPlaces.filter(p => p.type === cat);
              if (items.length === 0) return null;
              const catLabel = cat === 'food' ? '🍽️ 맛집' : cat === 'activity' ? '🎯 관광' : cat === 'transport' ? '🚌 교통' : '🏨 숙박';
              return (
                <div key={cat}>
                  <p className="text-[10px] text-slate-500 mb-1">{catLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map(place => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => applyRecommended(place)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-indigo-500 transition-all text-left"
                      >
                        <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">{place.name}</span>
                        {place.rating && <span className="text-[10px] text-amber-400 shrink-0">★{place.rating}</span>}
                        {place.costLocal > 0
                          ? <span className="text-[10px] text-indigo-400 shrink-0">{CURRENCY_FLAG[place.currency] ?? '💱'} {place.costLocal.toLocaleString()}</span>
                          : <span className="text-[10px] text-emerald-400 shrink-0">무료</span>
                        }
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">{t.activityDay}</label>
          <select value={day} onChange={e => setDay(Number(e.target.value))} className={inputSmCls}>
            {Array.from({ length: days }, (_, i) => i + 1).map(d => <option key={d} value={d}>{t.dayLabel(d)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">{t.activityTime}</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputSmCls} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-[11px] text-slate-400 block mb-1">{t.activityType}</label>
          <select value={type} onChange={e => setType(e.target.value as Activity['type'])} className={inputSmCls}>
            {(Object.keys(TYPE_ICONS) as Activity['type'][]).map(k => (
              <option key={k} value={k}>{TYPE_ICONS[k]} {t.activityTypes[k]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">{t.locationSearch}</label>
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input
              value={locationQuery}
              onChange={e => { setLocationQuery(e.target.value); setLocationConfirmed(''); setShowSuggestions(true); }}
              onFocus={() => locationQuery.length >= 2 && setShowSuggestions(true)}
              placeholder={t.locationPlaceholder}
              className={`${inputSmCls} pr-7`}
            />
            {locationConfirmed ? (
              <button
                type="button"
                onClick={() => { setLocationQuery(''); setLocationConfirmed(''); setLocationPlaceId(''); setRating(undefined); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-red-400 transition-colors"
                title="위치 초기화"
              >✓</button>
            ) : loading ? (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 animate-pulse">…</span>
            ) : null}
          </div>

          {showSuggestions && results.length > 0 && (
            <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden">
              {results.map(p => (
                <button
                  key={p.placeId}
                  onMouseDown={() => selectPlace(p)}
                  className="w-full px-3 py-2.5 text-left hover:bg-slate-700 transition-colors border-b border-slate-700/60 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{p.address}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {p.rating && (
                        <p className="text-[10px] text-amber-400">★ {p.rating}</p>
                      )}
                      {p.userRatingsTotal && (
                        <p className="text-[10px] text-slate-500">{t.reviewCount(p.userRatingsTotal)}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">{t.activityTitle}</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t.activityTitlePlaceholder} className={inputSmCls} />
      </div>

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">{t.activityCost}</label>
        <div className="flex gap-2 mb-1.5 max-w-xs">
          <select value={currency} onChange={e => { setCurrency(e.target.value); setCost(''); }} className="bg-slate-700/70 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors shrink-0 w-[88px]">
            {['KRW','JPY','USD','EUR','GBP','AUD','CNY','SGD','THB'].map(c => <option key={c} value={c}>{CURRENCY_FLAG[c] ?? '💱'} {c}</option>)}
          </select>
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              inputMode="numeric"
              value={cost}
              onChange={e => setCost(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder={currency === 'KRW' ? '0' : '0'}
              className={`${inputSmCls} w-full ${currency === 'KRW' ? 'pr-10' : ''} text-right font-mono`}
            />
            {currency === 'KRW' && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none font-medium">만원</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {getActivityChips(currency).amounts.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => setCost(String((Number(cost) || 0) + amt))}
              className="px-2 py-0.5 text-[10px] rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 transition-colors"
            >
              +{getActivityChips(currency).label(amt)}
            </button>
          ))}
          {cost !== '' && cost !== '0' && (
            <button type="button" onClick={() => setCost('')}
              className="px-2 py-0.5 text-[10px] rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Menu items selection (food type) */}
      {type === 'food' && availableMenuItems.length > 0 && (
        <div>
          <label className="text-[11px] text-slate-400 block mb-1.5">🍽️ 메뉴 선택 <span className="text-slate-600">(선택 항목이 일정에 표시됩니다)</span></label>
          <div className="flex flex-wrap gap-1.5">
            {availableMenuItems.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleMenuItem(item)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                  selectedMenuItems.includes(item)
                    ? 'bg-amber-900/40 border-amber-700/60 text-amber-300'
                    : 'bg-slate-700/60 border-slate-600 text-slate-400 hover:text-slate-200'
                }`}
              >
                {selectedMenuItems.includes(item) ? '✓ ' : ''}{item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transport mode (transport type) */}
      {type === 'transport' && (
        <div>
          <label className="text-[11px] text-slate-400 block mb-1.5">🚌 교통 수단 / 노선</label>
          <input
            value={transportMode}
            onChange={e => setTransportMode(e.target.value)}
            placeholder="예: 지하철 — 긴자선, 오모테산도역"
            className={inputSmCls}
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {TRANSPORT_MODES.map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setTransportMode(transportMode === mode ? '' : mode)}
                className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${transportMode === mode ? 'bg-indigo-700/60 border-indigo-500/60 text-indigo-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 border-slate-600'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">{t.activityNotes}</label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.activityNotesPlaceholder} className={inputSmCls} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs hover:bg-slate-700 transition-colors">{t.cancel}</button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
        >{t.save}</button>
      </div>
    </div>
  );
}

// ── MapView component ───────────────────────────────────────────────
function MapView({
  activities,
  days,
  selectedDay,
  onDayChange,
}: {
  activities: Activity[];
  days: number;
  selectedDay: number;
  onDayChange: (d: number) => void;
  startDate: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

  const dayActivities = activities
    .filter(a => a.day === selectedDay && a.location)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const embedUrl = (() => {
    if (!apiKey || dayActivities.length === 0) return '';
    if (dayActivities.length === 1) {
      const q = dayActivities[0].locationPlaceId
        ? `place_id:${dayActivities[0].locationPlaceId}`
        : encodeURIComponent(dayActivities[0].location);
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${q}&language=ko`;
    }
    const enc = (a: Activity) =>
      a.locationPlaceId ? `place_id:${a.locationPlaceId}` : encodeURIComponent(a.location);
    const origin = enc(dayActivities[0]);
    const dest = enc(dayActivities[dayActivities.length - 1]);
    const waypoints = dayActivities.slice(1, -1).map(enc).join('|');
    let url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${dest}&language=ko`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    return url;
  })();

  return (
    <div className="bg-slate-800 rounded-2xl border border-emerald-700/40 overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-700/60 overflow-x-auto">
        <span className="text-xs text-slate-400 shrink-0 mr-1">Day</span>
        {Array.from({ length: days }, (_, i) => i + 1).map(d => {
          const hasLocs = activities.some(a => a.day === d && a.location);
          return (
            <button
              key={d}
              onClick={() => onDayChange(d)}
              className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                selectedDay === d
                  ? 'bg-emerald-700/40 border-emerald-600/60 text-emerald-300'
                  : hasLocs
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-700/40 text-slate-600'
              }`}
            >{d}</button>
          );
        })}
      </div>

      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-72 border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : !apiKey ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
          <span className="text-2xl">🗺️</span>
          <p>지도를 표시하려면 Google Maps API 키가 필요해요</p>
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
          <span className="text-2xl">📍</span>
          <p>Day {selectedDay}에 위치가 지정된 활동이 없어요</p>
          <p className="text-xs text-slate-600">활동 추가 시 위치를 검색해 등록해보세요</p>
        </div>
      )}

      {dayActivities.length > 0 && (
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {dayActivities.map((act, idx) => (
            <div key={act.id} className="flex items-center gap-2 text-xs text-slate-400">
              <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-800/50 text-emerald-300 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
              <span className="truncate flex-1 min-w-0">{act.location}</span>
              {act.time && <span className="shrink-0 text-slate-500">{act.time}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PlaceExplorer component ─────────────────────────────────────────
interface CartEntry {
  place: RecommendedPlace;
  day: number;
  time: string;
}

function PlaceExplorer({
  countryCode,
  days,
  onConfirm,
  onClose,
}: {
  countryCode: string;
  days: number;
  defaultCurrency: string;
  onConfirm: (acts: Omit<Activity, 'id'>[]) => void;
  onClose: () => void;
}) {
  const explorerCities = COUNTRY_CITY_MAP[countryCode] ?? [];
  const [filterCityKo, setFilterCityKo] = useState('');
  const [filterCat, setFilterCat] = useState<'all' | RecommendedPlace['type']>('all');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [showCart, setShowCart] = useState(false);

  const cityEn = explorerCities.find(c => c.ko === filterCityKo)?.en ?? '';
  const { places, loading } = useLiveRecommendations(countryCode, cityEn, filterCat);

  const inCart = (id: string) => cart.some(e => e.place.id === id);

  const toggleCart = (place: RecommendedPlace) => {
    if (inCart(place.id)) {
      setCart(prev => prev.filter(e => e.place.id !== place.id));
    } else {
      setCart(prev => [...prev, { place, day: 1, time: '' }]);
      setShowCart(true);
    }
  };

  const updateCartEntry = (idx: number, patch: Partial<CartEntry>) => {
    setCart(prev => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
  };

  const handleConfirm = () => {
    const acts: Omit<Activity, 'id'>[] = cart.map(e => {
      // Resolve the Korean city name for display in the activity card
      const koCity = explorerCities.find(c => c.en === e.place.city)?.ko ?? e.place.city;
      return {
        day: e.day,
        time: e.time,
        title: e.place.name,
        location: e.place.nameLocal,
        locationPlaceId: e.place.placeId,
        rating: e.place.rating,
        cost: e.place.currency === 'KRW' ? e.place.costKRW : e.place.costLocal,
        currency: e.place.currency,
        type: (e.place.type === 'food' ? 'food'
          : e.place.type === 'transport' ? 'transport'
          : e.place.type === 'accommodation' ? 'accommodation'
          : 'activity') as Activity['type'],
        notes: e.place.description ?? '',
        city: koCity && koCity !== '전국' ? koCity : undefined,
        menuItems: e.place.menuItems,
        transportMode: e.place.transportPreset
          ? e.place.transportPreset.mode + (e.place.transportPreset.route ? ` — ${e.place.transportPreset.route}` : '')
          : undefined,
        lat: e.place.lat,
        lng: e.place.lng,
      };
    });
    onConfirm(acts);
  };

  const catButtons: { key: 'all' | RecommendedPlace['type']; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'food', label: '🍽️ 맛집' },
    { key: 'activity', label: '🎯 관광' },
    { key: 'transport', label: '🚌 교통' },
    { key: 'accommodation', label: '🏨 숙박' },
  ];

  const catIcon = (type: RecommendedPlace['type']) =>
    type === 'food' ? '🍽️' : type === 'activity' ? '🎯' : type === 'transport' ? '🚌' : '🏨';

  return (
    <div className="bg-slate-800 rounded-2xl border border-violet-700/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">🛍️ 장소 탐색</span>
          <span className="text-[10px] text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded-full border border-violet-800/50">Google</span>
          {cart.length > 0 && (
            <button
              onClick={() => setShowCart(v => !v)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${showCart ? 'bg-violet-700/40 border-violet-600 text-violet-300' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
            >🛒 {cart.length}개 선택됨</button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={handleConfirm}
              className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >일정에 추가</button>
          )}
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
        </div>
      </div>

      {/* Cart panel */}
      {showCart && cart.length > 0 && (
        <div className="border-b border-slate-700/60 bg-slate-900/40 px-4 py-3 space-y-2">
          <p className="text-[11px] text-violet-400 font-medium">선택한 장소 — Day / 시간을 지정해주세요</p>
          {cart.map((entry, idx) => (
            <div key={entry.place.id} className="flex items-center gap-2 text-xs">
              <span className="text-slate-300 flex-1 min-w-0 truncate">{entry.place.name}</span>
              <select
                value={entry.day}
                onChange={e => updateCartEntry(idx, { day: Number(e.target.value) })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-1.5 py-1 text-xs text-slate-200 focus:outline-none shrink-0"
              >
                {Array.from({ length: days }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
              <input
                type="time"
                value={entry.time}
                onChange={e => updateCartEntry(idx, { time: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded-lg px-1.5 py-1 text-xs text-slate-200 focus:outline-none w-24 shrink-0"
              />
              <button
                onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-400 shrink-0"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="px-4 pt-3 pb-2 space-y-2">
        {explorerCities.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterCityKo('')}
              className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all ${!filterCityKo ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
            >전체</button>
            {explorerCities.map(city => (
              <button
                key={city.ko}
                onClick={() => setFilterCityKo(city.ko === filterCityKo ? '' : city.ko)}
                className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all ${filterCityKo === city.ko ? 'bg-violet-600 border-violet-500 text-white' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
              >{city.ko}</button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {catButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterCat(key)}
              className={`px-2.5 py-0.5 text-[11px] rounded-full border transition-all ${filterCat === key ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:text-slate-200'}`}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Place grid */}
      <div className="px-4 pb-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-700/60 bg-slate-800/50 animate-pulse">
                <div className="h-3 bg-slate-700 rounded mb-2 w-3/4" />
                <div className="h-2 bg-slate-700/60 rounded mb-3 w-full" />
                <div className="flex justify-between items-center">
                  <div className="h-2 bg-slate-700/40 rounded w-1/3" />
                  <div className="h-6 w-12 bg-slate-700/60 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <p className="text-xl mb-2">🔍</p>
            <p>도시를 선택하면 구글에서 추천 장소를 가져와요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
            {places.map(place => {
              const added = inCart(place.id);
              const koCity = explorerCities.find(c => c.en === place.city)?.ko ?? place.city;
              return (
                <div
                  key={place.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${added ? 'border-violet-600/60 bg-violet-900/20' : 'border-slate-700/60 bg-slate-800/80 hover:border-slate-600'}`}
                >
                  <div>
                    <p className="text-xs font-medium text-slate-200 truncate">{catIcon(place.type)} {place.name}</p>
                    {koCity && koCity !== filterCityKo && <p className="text-[10px] text-slate-500">{koCity}</p>}
                  </div>
                  {place.description && (
                    <p className="text-[10px] text-slate-500 line-clamp-2">{place.description}</p>
                  )}
                  <div className="flex items-end justify-between gap-1 mt-auto">
                    <div>
                      {place.rating && <p className="text-[10px] text-amber-400">★ {place.rating}</p>}
                      <p className="text-[10px] text-indigo-400">
                        {place.costLocal > 0 ? `${CURRENCY_FLAG[place.currency] ?? '💱'} ${place.costLocal.toLocaleString()}` : '무료'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCart(place)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all shrink-0 ${
                        added
                          ? 'bg-violet-700/50 border-violet-600 text-violet-300'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-indigo-500'
                      }`}
                    >{added ? '✓ 담김' : '+ 담기'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ───────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors';
const inputSmCls = 'w-full bg-slate-700/70 border border-slate-600 rounded-lg px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors';
