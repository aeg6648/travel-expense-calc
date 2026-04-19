'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TravelStyle } from '@/types/travel';
import { getCountryByCode } from '@/lib/travel-data';
import { getHolidayInfo } from '@/lib/holidays';
import { STYLE_LABELS } from '@/lib/utils';

import CountryGrid from '@/components/CountryGrid';
import CostSummaryCard from '@/components/CostSummaryCard';
import CostBandChart from '@/components/CostBandChart';
import HistoricalChart from '@/components/HistoricalChart';
import FlightCard from '@/components/FlightCard';
import BlogPanel from '@/components/BlogPanel';
import BudgetFinder from '@/components/BudgetFinder';
import AdBanner from '@/components/AdBanner';

type Mode = 'country' | 'budget';

export default function Home() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('country');
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
    TRY: 37, AUD: 1.55, USD: 1,
  });
  const [rateLoading, setRateLoading] = useState(true);

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
    if (mode === 'budget') setMode('country');
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <span className="text-lg">✈️</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-tight">여행 경비 계산기</h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">블로그 후기 기반 · 환율·연휴 반영</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">USD/KRW</span>
              <span className="text-slate-100 font-semibold">
                {rateLoading ? '...' : krwPerUsd.toLocaleString()}
              </span>
            </div>

            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setMode('country')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'country' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🗺️ 국가 선택
              </button>
              <button
                onClick={() => setMode('budget')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'budget' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                💰 예산으로 찾기
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 py-6 space-y-8">
        {!selectedCode && <InfoSection />}
        {mode === 'budget' ? (
          <BudgetFinder currentKrwPerUsd={krwPerUsd} onSelectCountry={handleSelectCountry} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_320px] gap-6">
            {/* Left: country selector + filters */}
            <div className="space-y-5">
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">여행 조건</h3>

                {/* Style */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">여행 스타일</label>
                  <div className="flex gap-2">
                    {(['budget', 'standard', 'luxury'] as TravelStyle[]).map(s => {
                      const glassMap: Record<string, { border: string; text: string; bg: string; hoverBg: string }> = {
                        budget:   { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)',  text: '#6ee7b7', hoverBg: 'rgba(16,185,129,0.2)' },
                        standard: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  text: '#a5b4fc', hoverBg: 'rgba(99,102,241,0.2)' },
                        luxury:   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  text: '#fcd34d', hoverBg: 'rgba(245,158,11,0.2)' },
                      };
                      const g = glassMap[s];
                      const isActive = style === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setStyle(s)}
                          className="flex-1 py-2 rounded-xl text-xs font-medium transition-all border backdrop-blur-sm group"
                          style={
                            isActive
                              ? { backgroundColor: g.bg, color: g.text, borderColor: g.border }
                              : { backgroundColor: 'rgba(255,255,255,0.04)', color: '#94a3b8', borderColor: '#334155' }
                          }
                          onMouseEnter={e => {
                            if (!isActive) {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = '#475569';
                              (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                              (e.currentTarget as HTMLButtonElement).style.borderColor = '#334155';
                              (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                            }
                          }}
                        >
                          {STYLE_LABELS[s]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-slate-300">여행 기간</label>
                    <span className="text-sm font-semibold text-slate-400">{duration}박 {duration + 1}일</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={14}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>2박</span><span>7박</span><span>14박</span>
                  </div>
                </div>

                {/* Departure date */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-2">출발 예정일</label>
                  <div className="relative flex items-center w-full bg-slate-700/50 border border-slate-600 rounded-xl focus-within:border-indigo-500/60 hover:border-slate-500 transition-all">
                    <input
                      type="text"
                      value={departureDate}
                      onChange={e => {
                        const val = e.target.value.replace(/[./]/g, '-');
                        setDepartureDate(val);
                      }}
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
                      <span>{holidayInfo.name} — 항공권 {Math.round((holidayInfo.priceMultiplier - 1) * 100)}% 상승</span>
                    </div>
                  )}
                </div>

                {/* City selector */}
                {selectedCountry?.cities && selectedCountry.cities.length > 0 && (
                  <div className="border-t border-slate-700/60 pt-4">
                    <label className="text-xs font-medium text-slate-300 block mb-2">
                      도시 선택
                      <span className="text-slate-500 ml-1">· 전체 = 국가 평균</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedCity(null)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                          selectedCity === null
                            ? 'bg-slate-200 text-slate-900 border-slate-200'
                            : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        전체
                      </button>
                      {selectedCountry.cities.map(city => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city === selectedCity ? null : city)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                            selectedCity === city
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <CountryGrid selectedCode={selectedCode} onSelect={handleSelectCountry} style={style} />

              {/* TODO: Replace slot with your AdSense rectangle slot ID */}
              <AdBanner slot="1111111111" format="rectangle" />
            </div>

            {/* Right: results */}
            <div className="space-y-5">
              {!selectedCountry ? (
                <WelcomeBanner onModeSwitch={() => setMode('budget')} />
              ) : (
                <>
                  <CostSummaryCard
                    country={selectedCountry}
                    style={style}
                    duration={duration}
                    departureDate={departureDate}
                    currentKrwPerUsd={krwPerUsd}
                    selectedCity={selectedCity}
                    onStyleChange={setStyle}
                  />

                  {/* TODO: Replace slot with your AdSense horizontal slot ID */}
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

                  {/* TODO: Replace slot with your AdSense horizontal slot ID */}
                  <AdBanner slot="3333333333" format="horizontal" />
                </>
              )}
            </div>

            {/* Right sidebar: Sticky vertical ad */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <AdBanner slot="3333333333" format="vertical" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function WelcomeBanner({ onModeSwitch }: { onModeSwitch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <div className="space-y-2">
        <p className="text-5xl">🌍</p>
        <h2 className="text-2xl font-bold text-slate-100">어디로 떠날까요?</h2>
        <p className="text-slate-400 text-sm max-w-md">
          왼쪽에서 국가를 선택하면 블로그 후기 기반 여행 경비,
          환율·물가 변동, 항공권 예측을 한눈에 볼 수 있어요.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm max-w-2xl w-full">
        {[
          { icon: '📊', label: '경비 밴드', desc: '알뜰~프리미엄 범위' },
          { icon: '📈', label: '분기별 추이', desc: '물가·환율 반영' },
          { icon: '✈️', label: '항공권 예측', desc: '성수기·연휴 반영' },
          { icon: '📝', label: '블로그 후기', desc: '실제 여행자 데이터' },
        ].map(f => (
          <div key={f.label} className="p-4 rounded-2xl bg-slate-800 border border-slate-700/60 space-y-1 hover:border-slate-600 transition-colors">
            <p className="text-2xl">{f.icon}</p>
            <p className="font-semibold text-slate-200 text-sm">{f.label}</p>
            <p className="text-xs text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px w-16 bg-slate-700" />
        <span className="text-xs text-slate-500">또는</span>
        <div className="h-px w-16 bg-slate-700" />
      </div>

      <button
        onClick={onModeSwitch}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-medium text-sm shadow-lg shadow-indigo-900/40"
      >
        <span>💰</span>
        <span>예산으로 여행지 찾기</span>
      </button>
    </div>
  );
}

function InfoSection() {
  return (
    <div className="bg-slate-900/50 border border-slate-700/60 rounded-2xl p-8 space-y-6 max-w-5xl mx-auto mb-12">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">여행 경비 계산기 정보</h2>
        <p className="text-slate-300 leading-relaxed">
          본 여행 경비 계산기는 실제 블로그 후기와 여행자 리뷰를 기반으로 
          <strong> 신뢰할 수 있는 여행 경비 예측</strong>을 제공합니다. 
          단순한 통계가 아닌, 실제 여행 경험에 근거한 데이터로 
          각 국가별·여행 스타일별 경비 범위를 산출합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-100">📊 데이터 기반</h3>
          <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
            <li>블로그 후기 및 여행자 리뷰 분석</li>
            <li>공개 환율 데이터 (Open Exchange Rates)</li>
            <li>계절별 항공료 변동 지수</li>
            <li>국가별 주요 휴일 및 성수기 정보</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-100">🎯 계산 기준</h3>
          <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
            <li><strong>알뜰 여행:</strong> 저예산 숙박·로컬 음식</li>
            <li><strong>표준 여행:</strong> 중급 호텔·일반 식당</li>
            <li><strong>프리미엄:</strong> 고급 숙박·고급 음식점</li>
            <li><strong>환율:</strong> 실시간 환율 데이터 반영</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-700/60">
        <h3 className="text-lg font-semibold text-slate-100">💡 사용 방법</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          왼쪽에서 여행할 국가, 여행 스타일, 출발 날짜를 선택하면 
          해당 국가의 예상 경비 범위, 분기별 비용 추이, 실시간 환율, 
          항공료 변동, 그리고 실제 여행자 후기를 한눈에 볼 수 있습니다. 
          예산에 맞는 여행지를 찾고 싶다면 "예산으로 여행지 찾기" 기능을 사용하세요.
        </p>
      </div>

      <div className="text-xs text-slate-500 pt-2 border-t border-slate-700/60">
        <p>
          본 계산기의 데이터는 실제 여행 경험 기반이나, 개인차와 변동성에 따라 
          실제 경비가 다를 수 있습니다. 참고용으로만 사용해주세요.
        </p>
        <p className="mt-2">
          <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">
            개인정보처리방침
          </a>
        </p>
      </div>
    </div>
  );
}
