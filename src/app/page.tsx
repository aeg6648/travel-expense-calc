'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { TravelStyle } from '@/types/travel';
import { getCountryByCode } from '@/lib/travel-data';
import { getHolidayInfo } from '@/lib/holidays';
import { STYLE_LABELS } from '@/lib/utils';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';

import CountryGrid from '@/components/CountryGrid';
import CostSummaryCard from '@/components/CostSummaryCard';
import CostBandChart from '@/components/CostBandChart';
import HistoricalChart from '@/components/HistoricalChart';
import FlightCard from '@/components/FlightCard';
import BlogPanel from '@/components/BlogPanel';
import BudgetFinder from '@/components/BudgetFinder';
import ItineraryManager from '@/components/ItineraryManager';
import AdBanner from '@/components/AdBanner';

type Mode = 'budget' | 'country' | 'itinerary';

export default function Home() {
  const { t } = useLang();
  const { user, loading: authLoading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [planeAnim, setPlaneAnim] = useState(false);

  const handleLogoClick = () => {
    handleModeChange('budget');
    setPlaneAnim(false);
    // 다음 프레임에 클래스 다시 추가해 애니메이션 재실행
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPlaneAnim(true));
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset profile image error state when user changes (re-login)
  useEffect(() => { setImgError(false); }, [user?.sub]);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('budget');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [style, setStyle] = useState<TravelStyle>('standard');
  const [duration, setDuration] = useState(5);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [krwPerUsd, setKrwPerUsd] = useState(1450);
  const [allRates, setAllRates] = useState<Record<string, number>>({
    KRW: 1450, JPY: 151, THB: 35, VND: 25400, TWD: 32,
    SGD: 1.34, PHP: 58, IDR: 16000, HKD: 7.78, EUR: 0.91,
    TRY: 37, AUD: 1.55, USD: 1, GBP: 0.79, CAD: 1.36, CNY: 7.24,
  });
  const [rateLoading, setRateLoading] = useState(true);
  const [originCode, setOriginCode] = useState('KR');

  const ORIGIN_TO_CURRENCY: Record<string, string> = {
    KR: 'USD', US: 'USD', JP: 'JPY', CN: 'CNY', AU: 'AUD',
    GB: 'GBP', DE: 'EUR', FR: 'EUR', CA: 'CAD', SG: 'SGD', TW: 'TWD', HK: 'HKD',
  };
  const headerCurrency = ORIGIN_TO_CURRENCY[originCode] ?? 'USD';
  const headerRate = headerCurrency === 'KRW'
    ? 1
    : Math.round((allRates['KRW'] ?? 1450) / (allRates[headerCurrency] ?? 1));

  const selectedCountry = selectedCode ? getCountryByCode(selectedCode) : null;
  const holidayInfo = getHolidayInfo(departureDate);

  useEffect(() => {
    fetch('/api/exchange-rates')
      .then(r => r.json())
      .then(data => {
        if (data.rates?.KRW) setKrwPerUsd(Math.round(data.rates.KRW));
        if (data.rates) setAllRates(data.rates);
      })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, []);

  const handleSelectCountry = useCallback((code: string) => {
    setSelectedCode(code);
    setSelectedCity(null);
    setMode('country');
    setTimeout(() => {
      const el = document.getElementById('cost-detail');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        document.getElementById('country-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  }, []);

  const handleModeChange = (m: Mode) => {
    setMode(m);
    if (m !== 'country') setSelectedCode(null);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ── Minimal header ── */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-500/30 transition-all">
              <span
                className={`text-base inline-block ${planeAnim ? 'plane-logo-clicked' : ''}`}
                onAnimationEnd={() => setPlaneAnim(false)}
              >✈️</span>
            </div>
            <span className="text-sm font-bold text-slate-100 hidden sm:block">{t.siteTitle}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-[11px]">{headerCurrency}/KRW</span>
              <span className="text-slate-100 font-semibold text-[11px]">
                {rateLoading ? '…' : headerRate.toLocaleString()}
              </span>
            </div>
            {authLoading ? (
              <div className="w-[90px] h-7 rounded-xl bg-slate-800/80 border border-slate-700/60 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/50 transition-all overflow-hidden"
                >
                  {imgError ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.picture}
                      alt=""
                      className="w-6 h-6 rounded-full shrink-0"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                    />
                  )}
                  <span className="text-xs text-slate-300 hidden sm:block max-w-[72px] truncate leading-none">{user.name.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 text-slate-500 shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* 유저 정보 */}
                    <div className="px-3 py-3 border-b border-slate-700">
                      <p className="text-xs font-semibold text-slate-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    {/* 내 여행 일정 */}
                    <button
                      onClick={() => { setShowUserMenu(false); handleModeChange('itinerary'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors text-left"
                    >
                      <span className="text-base">📅</span>
                      <span>{t.modeItinerary}</span>
                    </button>
                    {/* 문의하기 */}
                    <a
                      href={`mailto:snusmh@gmail.com?subject=트립비 문의&body=안녕하세요, 트립비 관련 문의드립니다.%0A%0A이름: ${user.name}%0A이메일: ${user.email}%0A%0A문의 내용:%0A`}
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors border-t border-slate-700/60"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span>문의하기</span>
                    </a>
                    {/* 로그아웃 */}
                    <button
                      onClick={() => { setShowUserMenu(false); signOut(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                      </svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <GoogleSignInButton size="medium" text="signin_with" theme="filled_black" />
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <div className="relative bg-gradient-to-b from-slate-800/60 to-slate-900 pt-10 pb-8 px-4">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-2 tracking-tight">
              {t.heroTitle}
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              {t.heroSubtitle}
            </p>

            {/* ── BIG mode tabs ── */}
            <div className="flex gap-2 justify-center mb-0">
              {([
                { id: 'budget',    icon: '💰', label: t.modeBudget },
                { id: 'country',   icon: '🗺️', label: t.modeCountry },
                { id: 'itinerary', icon: '📅', label: t.modeItinerary },
              ] as { id: Mode; icon: string; label: string }[]).map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleModeChange(id)}
                  className={`flex-1 max-w-[200px] flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-sm font-semibold transition-all border ${
                    mode === id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-700/60'
                  }`}
                >
                  <span className="text-base sm:text-sm">{icon}</span>
                  <span className="text-[11px] sm:text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Budget mode */}
          {mode === 'budget' && (
            <BudgetFinder allRates={allRates} onSelectCountry={handleSelectCountry} originCode={originCode} onOriginChange={setOriginCode} />
          )}

          {/* Country mode — no selection */}
          {mode === 'country' && !selectedCode && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.travelConditions}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-2">{t.travelStyle}</label>
                    <div className="flex gap-2">
                      {(['budget', 'standard', 'luxury'] as TravelStyle[]).map(s => {
                        const glassMap: Record<string, { border: string; text: string; bg: string }> = {
                          budget:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)', text: '#6ee7b7' },
                          standard: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)', text: '#a5b4fc' },
                          luxury:   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
                        };
                        const g = glassMap[s];
                        const isActive = style === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setStyle(s)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all border"
                            style={isActive
                              ? { backgroundColor: g.bg, color: g.text, borderColor: g.border }
                              : { backgroundColor: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderColor: '#334155' }
                            }
                          >
                            {t.styleLabels[s]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-slate-300">{t.duration}</label>
                      <span className="text-sm font-semibold text-slate-400">{t.nightsDay(duration)}</span>
                    </div>
                    <input
                      type="range" min={2} max={14} value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>2{t.nightUnit}</span><span>7{t.nightUnit}</span><span>14{t.nightUnit}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-2">{t.departureDate}</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={e => setDepartureDate(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {holidayInfo && (
                      <div className={`mt-2 flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg ${
                        holidayInfo.priceMultiplier >= 1.8
                          ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                          : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
                      }`}>
                        <span>{holidayInfo.priceMultiplier >= 1.8 ? '🔴' : '🟡'}</span>
                        <span>{holidayInfo.name} — 항공 {Math.round((holidayInfo.priceMultiplier - 1) * 100)}% 상승</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CountryGrid selectedCode={selectedCode} onSelect={handleSelectCountry} style={style} />
            </div>
          )}

          {/* Country mode — country selected */}
          {mode === 'country' && selectedCode && selectedCountry && (
            <div id="country-detail" className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6">
              {/* Left: filters + grid */}
              <div className="space-y-4">
                {/* Back button */}
                <button
                  onClick={() => setSelectedCode(null)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {t.backToList}
                </button>

                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 space-y-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.travelConditions}</h3>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-2">{t.travelStyle}</label>
                    <div className="flex gap-2">
                      {(['budget', 'standard', 'luxury'] as TravelStyle[]).map(s => {
                        const glassMap: Record<string, { border: string; text: string; bg: string }> = {
                          budget:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)', text: '#6ee7b7' },
                          standard: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)', text: '#a5b4fc' },
                          luxury:   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
                        };
                        const g = glassMap[s];
                        const isActive = style === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setStyle(s)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all border"
                            style={isActive
                              ? { backgroundColor: g.bg, color: g.text, borderColor: g.border }
                              : { backgroundColor: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderColor: '#334155' }
                            }
                          >
                            {t.styleLabels[s]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-slate-300">{t.duration}</label>
                      <span className="text-sm font-semibold text-slate-400">{t.nightsDay(duration)}</span>
                    </div>
                    <input
                      type="range" min={2} max={14} value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>2{t.nightUnit}</span><span>7{t.nightUnit}</span><span>14{t.nightUnit}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-2">{t.departureDate}</label>
                    <div className="relative flex items-center w-full bg-slate-700/50 border border-slate-600 rounded-xl focus-within:border-indigo-500/60 hover:border-slate-500 transition-all">
                      <input
                        type="text"
                        value={departureDate}
                        onChange={e => setDepartureDate(e.target.value.replace(/[./]/g, '-'))}
                        onBlur={e => {
                          const val = e.target.value.replace(/[./]/g, '-');
                          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) setDepartureDate(val);
                        }}
                        placeholder="YYYY-MM-DD"
                        className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 focus:outline-none placeholder-slate-600 min-w-0"
                      />
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => datePickerRef.current?.showPicker?.()}
                          className="px-3 py-2 text-slate-500 hover:text-slate-300 transition-colors border-l border-slate-700/60"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" fill="none" />
                            <path strokeLinecap="round" d="M3 9h18M8 2v4M16 2v4" />
                          </svg>
                        </button>
                        <input
                          ref={datePickerRef}
                          type="date"
                          value={departureDate}
                          onChange={e => setDepartureDate(e.target.value)}
                          className="absolute bottom-0 right-0 opacity-0 w-0 h-0 pointer-events-none"
                          tabIndex={-1}
                        />
                      </div>
                    </div>
                    {holidayInfo && (
                      <div className={`mt-2 flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg ${
                        holidayInfo.priceMultiplier >= 1.8
                          ? 'bg-red-900/30 text-red-400 border border-red-800/50'
                          : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
                      }`}>
                        <span>{holidayInfo.priceMultiplier >= 1.8 ? '🔴' : '🟡'}</span>
                        <span>{holidayInfo.name} — 항공 {Math.round((holidayInfo.priceMultiplier - 1) * 100)}% 상승</span>
                      </div>
                    )}
                  </div>

                  {selectedCountry.cities && selectedCountry.cities.length > 0 && (
                    <div className="border-t border-slate-700/60 pt-4">
                      <label className="text-xs font-medium text-slate-300 block mb-2">
                        {t.citySelect}
                        <span className="text-slate-500 ml-1">· {t.allCitiesHint}</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSelectedCity(null)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                            selectedCity === null
                              ? 'bg-slate-200 text-slate-900 border-slate-200'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'
                          }`}
                        >{t.allCitiesLabel}</button>
                        {selectedCountry.cities.map(city => (
                          <button
                            key={city}
                            onClick={() => setSelectedCity(city === selectedCity ? null : city)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                              selectedCity === city
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'
                            }`}
                          >{city}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <CountryGrid selectedCode={selectedCode} onSelect={handleSelectCountry} style={style} />
                <AdBanner slot="1111111111" format="rectangle" />
              </div>

              {/* Middle: detail */}
              <div id="cost-detail" className="space-y-5">
                <CostSummaryCard
                  country={selectedCountry}
                  style={style}
                  duration={duration}
                  departureDate={departureDate}
                  currentKrwPerUsd={krwPerUsd}
                  selectedCity={selectedCity}
                  onStyleChange={setStyle}
                />
                <AdBanner slot="2222222222" format="horizontal" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <CostBandChart
                    country={selectedCountry}
                    style={style}
                    duration={duration}
                    currentKrwPerUsd={krwPerUsd}
                    selectedCity={selectedCity}
                  />
                  <div className="space-y-5">
                    <HistoricalChart
                      country={selectedCountry}
                      duration={duration}
                      currentKrwPerUsd={krwPerUsd}
                      allRates={allRates}
                    />
                    <FlightCard
                      country={selectedCountry}
                      departureDate={departureDate}
                      style={style}
                    />
                  </div>
                </div>
                <BlogPanel country={selectedCountry} duration={duration} selectedCity={selectedCity} />
                <AdBanner slot="3333333333" format="horizontal" />
              </div>

              {/* Right sidebar: ad */}
              <div className="hidden lg:block">
                <div className="sticky top-20">
                  <AdBanner slot="4444444444" format="vertical" />
                </div>
              </div>
            </div>
          )}

          {/* Itinerary mode */}
          {mode === 'itinerary' && (
            user ? (
              <ItineraryManager userId={user.sub} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                  📅
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-100 mb-2">{t.loginRequired}</h2>
                  <p className="text-slate-400 text-sm max-w-xs">{t.loginDesc}</p>
                </div>
                <GoogleSignInButton size="large" text="signin_with" theme="outline" width={240} />
              </div>
            )
          )}
        </div>

        {/* SEO text - bottom */}
        {mode === 'budget' && !selectedCode && (
          <div className="max-w-5xl mx-auto px-4 pb-12">
            <SeoSection />
          </div>
        )}
      </main>
    </div>
  );
}

function SeoSection() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-8 space-y-5 text-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-2">여행 경비 계산기</h2>
        <p className="text-slate-400 leading-relaxed">
          예산에 맞는 해외 여행지를 찾고, 항공권·숙박·식비 분배를 한눈에 확인하세요.
          일본·태국·베트남·유럽 등 주요 여행지의 실제 경비를 블로그 후기 기반으로 계산합니다.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          { href: '/country/jp', label: '🇯🇵 일본 여행 경비' },
          { href: '/country/th', label: '🇹🇭 태국 여행 비용' },
          { href: '/country/vn', label: '🇻🇳 베트남 여행 비용' },
          { href: '/country/sg', label: '🇸🇬 싱가포르 경비' },
          { href: '/country/fr', label: '🇫🇷 프랑스 여행 경비' },
          { href: '/country/us', label: '🇺🇸 미국 여행 비용' },
          { href: '/country/au', label: '🇦🇺 호주 여행 경비' },
          { href: '/country/it', label: '🇮🇹 이탈리아 경비' },
        ].map(({ href, label }) => (
          <a key={href} href={href} className="text-indigo-400 hover:text-indigo-300 transition-colors">{label}</a>
        ))}
      </div>
      <p className="text-xs text-slate-500 border-t border-slate-700/60 pt-4">
        본 계산기의 데이터는 실제 여행 경험 기반이나 개인차·변동성이 있을 수 있습니다. 참고용으로만 사용하세요.
        · <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">개인정보처리방침</a>
      </p>
    </div>
  );
}
