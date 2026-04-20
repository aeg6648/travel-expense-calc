'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { TravelStyle } from '@/types/travel';
import { getCountryByCode } from '@/lib/travel-data';
import { getHolidayInfo } from '@/lib/holidays';
import { STYLE_LABELS } from '@/lib/utils';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { SUPPORTED_LANGS } from '@/lib/i18n';

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
  const { lang, setLang, t } = useLang();
  const { user, signIn, signOut } = useAuth();
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
      document.getElementById('country-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
            onClick={() => handleModeChange('budget')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-500/30 transition-all">
              <span className="text-base">✈️</span>
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
            <div className="flex items-center gap-0.5 rounded-xl bg-slate-800/80 border border-slate-700/60 p-0.5">
              {SUPPORTED_LANGS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  title={code.toUpperCase()}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    lang === code
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
            {user ? (
              <button
                onClick={signOut}
                title={user.name}
                className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-slate-500 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-xs text-slate-300 hidden sm:block max-w-[80px] truncate">{user.name}</span>
              </button>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/60 hover:bg-slate-700/60 transition-all text-xs text-slate-300"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0" />
                </svg>
                <span className="hidden sm:block">로그인</span>
              </button>
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
            {/* 큰 비행기 */}
            <div className="plane-fly absolute" style={{ top: '30%' }}>
              <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5 C13.5 5 13.5 7 13.5 9 L13.5 20 C13.5 22 13.5 24 15 25 L16 26 L17 25 C18.5 24 18.5 22 18.5 20 L18.5 9 C18.5 7 18.5 5 17 5 Z" fill="url(#pg1)" opacity="0.9"/>
                <path d="M13.5 12.5 L4 17.5 L4 19.5 L13.5 15.5 Z" fill="url(#pg1)" opacity="0.8"/>
                <path d="M18.5 12.5 L28 17.5 L28 19.5 L18.5 15.5 Z" fill="url(#pg1)" opacity="0.8"/>
                <path d="M13.5 20.5 L9.5 23.5 L9.5 24.5 L13.5 22 Z" fill="url(#pg1)" opacity="0.7"/>
                <path d="M18.5 20.5 L22.5 23.5 L22.5 24.5 L18.5 22 Z" fill="url(#pg1)" opacity="0.7"/>
                <defs>
                  <linearGradient id="pg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a5b4fc"/>
                    <stop offset="100%" stopColor="#6366f1"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* 작은 비행기 */}
            <div className="plane-fly-small absolute" style={{ top: '65%' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5 C13.5 5 13.5 7 13.5 9 L13.5 20 C13.5 22 13.5 24 15 25 L16 26 L17 25 C18.5 24 18.5 22 18.5 20 L18.5 9 C18.5 7 18.5 5 17 5 Z" fill="#818cf8"/>
                <path d="M13.5 12.5 L4 17.5 L4 19.5 L13.5 15.5 Z" fill="#818cf8"/>
                <path d="M18.5 12.5 L28 17.5 L28 19.5 L18.5 15.5 Z" fill="#818cf8"/>
                <path d="M13.5 20.5 L9.5 23.5 L9.5 24.5 L13.5 22 Z" fill="#818cf8"/>
                <path d="M18.5 20.5 L22.5 23.5 L22.5 24.5 L18.5 22 Z" fill="#818cf8"/>
              </svg>
            </div>
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
              <div className="space-y-5">
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
                  <h2 className="text-xl font-bold text-slate-100 mb-2">로그인이 필요합니다</h2>
                  <p className="text-slate-400 text-sm max-w-xs">
                    내 여행 일정을 저장하고 관리하려면<br />Google 계정으로 로그인하세요.
                  </p>
                </div>
                <button
                  onClick={signIn}
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-medium text-sm hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 로그인
                </button>
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
