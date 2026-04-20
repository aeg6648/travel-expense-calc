'use client';

import { useState, useMemo } from 'react';
import { COUNTRIES } from '@/lib/travel-data';
import { getFlightMultiplier, getHolidayInfo } from '@/lib/holidays';
import { formatKRWShort, STYLE_LABELS, STYLE_COLORS } from '@/lib/utils';
import { TravelStyle } from '@/types/travel';

const CURRENCIES = [
  { code: 'KRW', symbol: '₩', name: '한국 원' },
  { code: 'USD', symbol: '$', name: '미국 달러' },
  { code: 'EUR', symbol: '€', name: '유로' },
  { code: 'JPY', symbol: '¥', name: '일본 엔' },
  { code: 'GBP', symbol: '£', name: '영국 파운드' },
  { code: 'AUD', symbol: 'A$', name: '호주 달러' },
  { code: 'CAD', symbol: 'C$', name: '캐나다 달러' },
  { code: 'CNY', symbol: '¥', name: '중국 위안' },
  { code: 'SGD', symbol: 'S$', name: '싱가포르 달러' },
  { code: 'THB', symbol: '฿', name: '태국 바트' },
  { code: 'HKD', symbol: 'HK$', name: '홍콩 달러' },
  { code: 'TWD', symbol: 'NT$', name: '대만 달러' },
];

const ORIGIN_COUNTRIES = [
  { code: 'KR', name: '한국', flag: '🇰🇷' },
  { code: 'US', name: '미국', flag: '🇺🇸' },
  { code: 'JP', name: '일본', flag: '🇯🇵' },
  { code: 'CN', name: '중국', flag: '🇨🇳' },
  { code: 'AU', name: '호주', flag: '🇦🇺' },
  { code: 'GB', name: '영국', flag: '🇬🇧' },
  { code: 'DE', name: '독일', flag: '🇩🇪' },
  { code: 'FR', name: '프랑스', flag: '🇫🇷' },
  { code: 'CA', name: '캐나다', flag: '🇨🇦' },
  { code: 'SG', name: '싱가포르', flag: '🇸🇬' },
  { code: 'TW', name: '대만', flag: '🇹🇼' },
  { code: 'HK', name: '홍콩', flag: '🇭🇰' },
];

// Distance multiplier vs Korea baseline (rough estimate)
const ORIGIN_FLIGHT_MULTIPLIER: Record<string, number> = {
  KR: 1.0, JP: 0.85, CN: 0.9, HK: 0.95, TW: 0.9,
  SG: 1.05, AU: 1.15, US: 1.6, GB: 1.7, DE: 1.65,
  FR: 1.65, CA: 1.65,
};

interface Props {
  allRates: Record<string, number>;
  onSelectCountry: (code: string) => void;
}

export default function BudgetFinder({ allRates, onSelectCountry }: Props) {
  const [currency, setCurrency] = useState('KRW');
  const [budgetInput, setBudgetInput] = useState('1500000');
  const [duration, setDuration] = useState(5);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [style, setStyle] = useState<TravelStyle>('standard');
  const [originCode, setOriginCode] = useState('KR');
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

  const holidayInfo = getHolidayInfo(departureDate);

  // Convert input budget to KRW
  const budgetKRW = useMemo(() => {
    const amount = parseFloat(budgetInput.replace(/,/g, '')) || 0;
    const krwPerUsd = allRates['KRW'] ?? 1450;
    const currencyPerUsd = allRates[currency] ?? 1;
    return Math.round((amount / currencyPerUsd) * krwPerUsd);
  }, [budgetInput, currency, allRates]);

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '';
  const originMultiplier = ORIGIN_FLIGHT_MULTIPLIER[originCode] ?? 1.0;

  const results = useMemo(() => {
    return COUNTRIES.map(country => {
      const costs = country.costs[style];
      const durationRatio = duration / country.defaultDuration;
      const rateRatio = (allRates['KRW'] ?? 1450) / 1380;
      const flightBase = costs.breakdown.flight;
      const flightMulti = getFlightMultiplier(departureDate, country.flight.monthlyMultipliers, country.flight.holidayMultiplier);
      const flightCost = Math.round(flightBase * flightMulti * originMultiplier);
      const nonFlightBase = costs.avg - flightBase;
      const accommodationCost = Math.round(costs.breakdown.accommodation * durationRatio * rateRatio);
      const foodCost = Math.round(costs.breakdown.food * durationRatio * rateRatio);
      const transportCost = Math.round(costs.breakdown.localTransport * durationRatio * rateRatio);
      const activitiesCost = Math.round(costs.breakdown.activities * durationRatio * rateRatio);
      const shoppingCost = Math.round(costs.breakdown.shopping * durationRatio * rateRatio);
      const total = flightCost + accommodationCost + foodCost + transportCost + activitiesCost + shoppingCost;
      const withinBudget = total <= budgetKRW;
      const budgetPct = Math.round((total / budgetKRW) * 100);
      return {
        country, total, flightCost, accommodationCost, foodCost,
        transportCost, activitiesCost, shoppingCost,
        withinBudget, budgetPct, flightMulti,
      };
    }).sort((a, b) => a.total - b.total);
  }, [budgetKRW, duration, departureDate, style, allRates, originMultiplier]);

  const withinBudget = results.filter(r => r.withinBudget);
  const over = results.filter(r => !r.withinBudget);
  const originInfo = ORIGIN_COUNTRIES.find(o => o.code === originCode);

  const formatInCurrency = (krw: number) => {
    if (currency === 'KRW') return `${formatKRWShort(krw)}만원`;
    const krwPerUsd = allRates['KRW'] ?? 1450;
    const currencyPerUsd = allRates[currency] ?? 1;
    const converted = (krw / krwPerUsd) * currencyPerUsd;
    return Math.round(converted).toLocaleString();
  };

  return (
    <div className="space-y-5">
      {/* Input card */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-4">
        {/* Budget input row */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-2">총 여행 예산</label>
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <input
                type="text"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="예산 입력..."
                className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-2.5 text-lg font-semibold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {currency !== 'KRW' && budgetKRW > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ≈ {formatKRWShort(budgetKRW)}만원
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">여행 기간</label>
            <div className="flex gap-1.5 flex-wrap">
              {[3, 4, 5, 7, 10].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    duration === d
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {d}박
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">여행 스타일</label>
            <div className="flex gap-1.5 flex-wrap">
              {(['budget', 'standard', 'luxury'] as TravelStyle[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  style={style === s
                    ? { backgroundColor: STYLE_COLORS[s], color: '#fff', borderColor: 'transparent' }
                    : { backgroundColor: 'rgba(51,65,85,0.5)', color: '#94a3b8', borderColor: '#475569' }
                  }
                >
                  {STYLE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Origin */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">출발 국가</label>
            <select
              value={originCode}
              onChange={e => setOriginCode(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {ORIGIN_COUNTRIES.map(o => (
                <option key={o.code} value={o.code}>{o.flag} {o.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">출발 예정일</label>
            <input
              type="date"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {originCode !== 'KR' && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-900/20 border border-sky-700/40 text-xs text-sky-300">
            <span>{originInfo?.flag}</span>
            <span>{originInfo?.name} 출발 기준 항공비 추정 (실제 가격과 차이가 있을 수 있음)</span>
          </div>
        )}

        {holidayInfo && (
          <div className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
            holidayInfo.priceMultiplier >= 1.8
              ? 'bg-red-900/30 text-red-400 border border-red-800/50'
              : 'bg-amber-900/30 text-amber-400 border border-amber-800/50'
          }`}>
            <span>{holidayInfo.priceMultiplier >= 1.8 ? '🔴' : '🟡'}</span>
            <span>{holidayInfo.name} — 항공권 최대 {Math.round((holidayInfo.priceMultiplier - 1) * 100)}% 상승 적용</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            예산 내 여행지 <span className="text-indigo-400 ml-1">{withinBudget.length}곳</span>
          </h2>
          <span className="text-xs text-slate-400">{duration}박 · {STYLE_LABELS[style]} · {currencySymbol}{Number(budgetInput).toLocaleString()}</span>
        </div>

        {withinBudget.length === 0 && (
          <div className="text-center py-10 text-slate-400 bg-slate-800 rounded-2xl border border-slate-700/60">
            <p className="text-3xl mb-2">😅</p>
            <p className="text-sm">예산 내 여행지가 없어요</p>
            <p className="text-xs mt-1 text-slate-500">예산을 늘리거나 기간·스타일을 조정해보세요</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {withinBudget.map(({ country, total, flightCost, accommodationCost, foodCost, transportCost, activitiesCost, shoppingCost, budgetPct, flightMulti }) => {
            const isOpen = showBreakdown === country.code;
            return (
              <div
                key={country.code}
                className="rounded-2xl border border-emerald-800/50 bg-emerald-900/10 overflow-hidden"
              >
                <button
                  onClick={() => onSelectCountry(country.code)}
                  className="w-full p-4 text-left hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        alt={country.nameKR}
                        className="w-8 h-5 object-cover rounded shadow-md flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">{country.nameKR}</p>
                        <p className="text-[11px] text-slate-400">{country.region} · {duration}박</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 shrink-0">
                      {budgetPct}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-bold text-slate-100">
                      {currency === 'KRW' ? `${formatKRWShort(total)}만원` : `${currencySymbol}${formatInCurrency(total)}`}
                    </span>
                    {currency !== 'KRW' && (
                      <span className="text-xs text-slate-500">(≈ {formatKRWShort(total)}만원)</span>
                    )}
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                  </div>
                  {flightMulti > 1.3 && (
                    <p className="text-[10px] text-amber-400 mt-1.5">⚠️ 성수기 항공 {Math.round((flightMulti-1)*100)}%↑</p>
                  )}
                </button>

                {/* Budget breakdown toggle */}
                <div className="px-4 pb-3">
                  <button
                    onClick={() => setShowBreakdown(isOpen ? null : country.code)}
                    className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    {isOpen ? '▲' : '▼'} 예산 분배 보기
                  </button>
                  {isOpen && (
                    <div className="mt-2 space-y-1.5">
                      {[
                        { label: '✈️ 항공', cost: flightCost, color: 'bg-indigo-500' },
                        { label: '🏨 숙박', cost: accommodationCost, color: 'bg-violet-500' },
                        { label: '🍽️ 식비', cost: foodCost, color: 'bg-amber-500' },
                        { label: '🚌 교통', cost: transportCost, color: 'bg-emerald-500' },
                        { label: '🎯 액티비티', cost: activitiesCost, color: 'bg-red-500' },
                        { label: '🛍️ 쇼핑', cost: shoppingCost, color: 'bg-pink-500' },
                      ].map(({ label, cost, color }) => (
                        <div key={label} className="flex items-center gap-2 text-[11px]">
                          <span className="w-14 text-slate-400 shrink-0">{label}</span>
                          <div className="flex-1 bg-slate-700/40 rounded-full h-1.5">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.round((cost / total) * 100)}%` }} />
                          </div>
                          <span className="w-14 text-right text-slate-300 shrink-0">
                            {currency === 'KRW' ? `${formatKRWShort(cost)}만` : `${currencySymbol}${formatInCurrency(cost)}`}
                          </span>
                          <span className="w-7 text-right text-slate-500 shrink-0">{Math.round((cost / total) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {over.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-px bg-slate-700/60" />
              <span className="text-xs text-slate-500">예산 초과 ({over.length}곳)</span>
              <div className="flex-1 h-px bg-slate-700/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {over.map(({ country, total, budgetPct }) => (
                <button
                  key={country.code}
                  onClick={() => onSelectCountry(country.code)}
                  className="p-3 rounded-2xl border border-slate-700/40 bg-slate-800/60 hover:bg-slate-700/60 transition-all text-left opacity-60 hover:opacity-100"
                >
                  <div className="flex items-center gap-2">
                    <img src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`} alt={country.nameKR} className="w-7 h-5 object-cover rounded shadow-sm shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">{country.nameKR}</p>
                        <span className="text-xs text-red-400">+{budgetPct - 100}% 초과</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {currency === 'KRW' ? `${formatKRWShort(total)}만원` : `${currencySymbol}${formatInCurrency(total)}`} 예상
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
