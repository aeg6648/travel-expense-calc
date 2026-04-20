'use client';

import { useState, useEffect, useRef } from 'react';
import { COUNTRIES } from '@/lib/travel-data';

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
}

const TYPE_INFO: Record<Activity['type'], { label: string; icon: string; color: string }> = {
  flight:        { label: '항공',    icon: '✈️',  color: 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300' },
  accommodation: { label: '숙박',    icon: '🏨',  color: 'bg-violet-900/30 border-violet-700/50 text-violet-300' },
  food:          { label: '식사',    icon: '🍽️', color: 'bg-amber-900/30 border-amber-700/50 text-amber-300' },
  activity:      { label: '액티비티', icon: '🎯',  color: 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300' },
  transport:     { label: '교통',    icon: '🚌',  color: 'bg-sky-900/30 border-sky-700/50 text-sky-300' },
  other:         { label: '기타',    icon: '📌',  color: 'bg-slate-700/50 border-slate-600/50 text-slate-300' },
};

const STORAGE_KEY = 'travel-itineraries';

function loadTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveTrips(trips: Trip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}
function tripDays(trip: Trip): number {
  if (!trip.startDate || !trip.endDate) return 1;
  return Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000));
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
export default function ItineraryManager() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  useEffect(() => { setTrips(loadTrips()); }, []);

  const persist = (updated: Trip[]) => { setTrips(updated); saveTrips(updated); };

  const deleteTrip = (id: string) => {
    if (!confirm('이 여행 일정을 삭제할까요?')) return;
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

  const deleteActivity = (actId: string) => {
    if (!selectedTrip) return;
    updateTrip({ ...selectedTrip, activities: selectedTrip.activities.filter(a => a.id !== actId) });
  };

  const saveEdited = (act: Activity) => {
    if (!selectedTrip) return;
    updateTrip({ ...selectedTrip, activities: selectedTrip.activities.map(a => a.id === act.id ? act : a) });
    setEditingActivity(null);
  };

  // ── DETAIL VIEW ──────────────────────────────────────────────────
  if (view === 'detail' && selectedTrip) {
    const days = tripDays(selectedTrip);
    const country = COUNTRIES.find(c => c.code === selectedTrip.countryCode);
    const totalCost = selectedTrip.activities.reduce((s, a) => s + (a.cost || 0), 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="text-slate-400 hover:text-slate-200 text-sm flex items-center gap-1.5 transition-colors">
            ← 목록으로
          </button>
          <button onClick={() => deleteTrip(selectedTrip.id)} className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg border border-red-800/50 hover:bg-red-900/20 transition-all">
            여행 삭제
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
                  ? `${selectedTrip.startDate} ~ ${selectedTrip.endDate} · ${days}박 ${days + 1}일`
                  : `${country?.nameKR ?? selectedTrip.countryCode}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { label: '예산', value: selectedTrip.budget > 0 ? `${selectedTrip.currency} ${Number(selectedTrip.budget).toLocaleString()}` : '미설정', color: 'text-slate-300' },
              { label: '지출 합계', value: totalCost > 0 ? `${selectedTrip.currency} ${totalCost.toLocaleString()}` : '—', color: 'text-emerald-400' },
              ...(selectedTrip.budget > 0 && totalCost > 0 ? [{ label: '예산 사용률', value: `${Math.round((totalCost / selectedTrip.budget) * 100)}%`, color: totalCost > selectedTrip.budget ? 'text-red-400' : 'text-indigo-400' }] : []),
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">여행 일정</h3>
          <button
            onClick={() => { setEditingActivity(null); setShowActivityForm(v => !v); }}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {showActivityForm ? '닫기' : '+ 일정 추가'}
          </button>
        </div>

        {showActivityForm && (
          <ActivityForm
            days={days}
            editing={editingActivity}
            defaultCurrency={selectedTrip.currency}
            countryName={country?.nameKR ?? ''}
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
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          return (
            <div key={day} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                  Day {day}
                  {selectedTrip.startDate && (() => {
                    const d = new Date(selectedTrip.startDate);
                    d.setDate(d.getDate() + day - 1);
                    return <span className="text-slate-500 ml-1.5">{d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>;
                  })()}
                </span>
                <div className="flex-1 h-px bg-slate-700/60" />
                <span className="text-[10px] text-slate-500">
                  {selectedTrip.currency} {dayActs.reduce((s, a) => s + (a.cost || 0), 0).toLocaleString()}
                </span>
              </div>

              {dayActs.length === 0 && <p className="text-xs text-slate-600 pl-3">일정 없음 — 위에서 추가하세요</p>}

              {dayActs.map(act => {
                const info = TYPE_INFO[act.type];
                return (
                  <div key={act.id} className={`p-3 rounded-xl border ${info.color} flex items-start gap-3`}>
                    <span className="text-lg mt-0.5 shrink-0">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{act.title}</p>
                          {act.location && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>📍</span>
                              <span className="truncate">{act.location}</span>
                              {act.rating && <span className="shrink-0 text-amber-400">★ {act.rating}</span>}
                            </p>
                          )}
                          {act.notes && <p className="text-xs text-slate-500 mt-0.5">{act.notes}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          {act.time && <p className="text-xs text-slate-500">{act.time}</p>}
                          {act.cost > 0 && (
                            <p className="text-xs font-semibold text-slate-300">{act.currency} {act.cost.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => { setEditingActivity(act); setShowActivityForm(true); }}
                        className="text-[10px] text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-all"
                      >수정</button>
                      <button
                        onClick={() => deleteActivity(act.id)}
                        className="text-[10px] text-red-500 hover:text-red-400 px-1.5 py-0.5 rounded border border-red-900/50 hover:border-red-700 transition-all"
                      >삭제</button>
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
          <h2 className="text-base font-semibold text-slate-100">내 여행 일정</h2>
          <p className="text-xs text-slate-500 mt-0.5">저장된 여행 계획 {trips.length}개</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          + 새 여행 만들기
        </button>
      </div>

      {trips.length === 0 && (
        <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700/60">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm text-slate-400">저장된 여행 일정이 없어요</p>
          <p className="text-xs mt-1 text-slate-500">새 여행을 만들어 일정과 예산을 관리해 보세요</p>
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
                  <p className="text-xs text-slate-400">{country?.nameKR ?? trip.countryCode} · {days}박 {days + 1}일</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">{trip.startDate} ~ {trip.endDate}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{trip.activities.length}개 일정</span>
                {trip.budget > 0 && (
                  <span className="text-slate-400">{trip.currency} {totalCost.toLocaleString()} / {Number(trip.budget).toLocaleString()}</span>
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
function CreateTripForm({ onSave, onCancel }: { onSave: (t: Trip) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('JP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!name.trim()) { alert('여행 이름을 입력하세요'); return; }
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(), countryCode, startDate, endDate,
      budget: Number(budget) || 0, currency,
      notes: notes.trim(), activities: [],
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-4 max-w-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">새 여행 만들기</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">✕</button>
      </div>

      <Field label="여행 이름">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 2025 오사카 여행" className={inputCls} />
      </Field>

      <Field label="여행 국가">
        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className={inputCls}>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.nameKR}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="출발일">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="귀국일">
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
        </Field>
      </div>

      <Field label="예산 (선택)">
        <div className="flex gap-2">
          <select value={currency} onChange={e => setCurrency(e.target.value)} className={`${inputCls} w-auto`}>
            {['KRW','USD','EUR','JPY','GBP','AUD','CNY','SGD','THB'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="금액" className={`${inputCls} flex-1`} />
        </div>
      </Field>

      <Field label="메모 (선택)">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="여행 메모..." rows={2} className={`${inputCls} resize-none`} />
      </Field>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm hover:bg-slate-700 transition-colors">취소</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">만들기</button>
      </div>
    </div>
  );
}

// ── Activity form with Google Places search ─────────────────────────
function ActivityForm({
  days, editing, defaultCurrency, countryName, onSave, onCancel,
}: {
  days: number;
  editing: Activity | null;
  defaultCurrency: string;
  countryName: string;
  onSave: (act: Omit<Activity, 'id'>) => void;
  onCancel: () => void;
}) {
  const [day, setDay] = useState(editing?.day ?? 1);
  const [time, setTime] = useState(editing?.time ?? '');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [locationQuery, setLocationQuery] = useState(editing?.location ?? '');
  const [locationConfirmed, setLocationConfirmed] = useState(editing?.location ?? '');
  const [locationPlaceId, setLocationPlaceId] = useState(editing?.locationPlaceId ?? '');
  const [rating, setRating] = useState(editing?.rating);
  const [cost, setCost] = useState(String(editing?.cost ?? ''));
  const [currency, setCurrency] = useState(editing?.currency ?? defaultCurrency);
  const [type, setType] = useState<Activity['type']>(editing?.type ?? 'activity');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      day, time, title: title.trim(),
      location: locationConfirmed || locationQuery,
      locationPlaceId, rating,
      cost: Number(cost) || 0, currency, type,
      notes,
    });
  };

  return (
    <div className="rounded-2xl p-4 border border-indigo-700/40 bg-indigo-900/10 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">{editing ? '일정 수정' : '일정 추가'}</h3>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Day</label>
          <select value={day} onChange={e => setDay(Number(e.target.value))} className={inputSmCls}>
            {Array.from({ length: days }, (_, i) => i + 1).map(d => <option key={d} value={d}>Day {d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">시간</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputSmCls} />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">종류</label>
          <select value={type} onChange={e => setType(e.target.value as Activity['type'])} className={inputSmCls}>
            {(Object.keys(TYPE_INFO) as Activity['type'][]).map(t => (
              <option key={t} value={t}>{TYPE_INFO[t].icon} {TYPE_INFO[t].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">장소 검색 (Google)</label>
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input
              value={locationQuery}
              onChange={e => { setLocationQuery(e.target.value); setLocationConfirmed(''); setShowSuggestions(true); }}
              onFocus={() => locationQuery.length >= 2 && setShowSuggestions(true)}
              placeholder={`장소 검색... (예: 도쿄 타워)`}
              className={`${inputSmCls} pr-7`}
            />
            {loading && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 animate-pulse">…</span>
            )}
            {locationConfirmed && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-400">✓</span>
            )}
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
                        <p className="text-[10px] text-slate-500">{p.userRatingsTotal.toLocaleString()}개 리뷰</p>
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
        <label className="text-[11px] text-slate-400 block mb-1">일정 제목</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 도쿄 타워 방문" className={inputSmCls} />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[11px] text-slate-400 block mb-1">비용</label>
          <div className="flex gap-1">
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={`${inputSmCls} w-auto`}>
              {['KRW','USD','EUR','JPY','GBP','AUD','CNY','SGD','THB'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" className={`${inputSmCls} flex-1`} />
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] text-slate-400 block mb-1">메모</label>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="메모..." className={inputSmCls} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs hover:bg-slate-700 transition-colors">취소</button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
        >저장</button>
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
