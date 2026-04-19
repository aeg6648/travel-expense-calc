'use client';

import { useState, useMemo } from 'react';
import { COUNTRIES } from '@/lib/travel-data';
import { getFlightMultiplier, getHolidayInfo } from '@/lib/holidays';
import { formatKRW, formatKRWShort, STYLE_LABELS, STYLE_COLORS } from '@/lib/utils';
import { TravelStyle } from '@/types/travel';

interface Props {
  currentKrwPerUsd: number;
  onSelectCountry: (code: string) => void;
}

export default function BudgetFinder({ currentKrwPerUsd, onSelectCountry }: Props) {
  const [budget, setBudget] = useState(1500000);
  const [duration, setDuration] = useState(5);
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [style, setStyle] = useState<TravelStyle>('standard');

  const holidayInfo = getHolidayInfo(departureDate);

  const results = useMemo(() => {
    return COUNTRIES.map(country => {
      const costs = country.costs[style];
      const durationRatio = duration / country.defaultDuration;
      const rateRatio = currentKrwPerUsd / 1380;
      const flightBase = costs.breakdown.flight;
      const flightMulti = getFlightMultiplier(departureDate, country.flight.monthlyMultipliers, country.flight.holidayMultiplier);
      const flightCost = Math.round(flightBase * flightMulti);
      const nonFlightBase = (costs.avg - flightBase) * durationRatio * rateRatio;
      const total = Math.round(flightCost + nonFlightBase);
      const withinBudget = total <= budget;
      const budgetPct = Math.round((total / budget) * 100);
      return { country, total, flightCost, withinBudget, budgetPct, flightMulti };
    }).sort((a, b) => a.total - b.total);
  }, [budget, duration, departureDate, style, currentKrwPerUsd]);

  const withinBudget = results.filter(r => r.withinBudget);
  const over = results.filter(r => !r.withinBudget);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-4">
        <h2 className="text-sm font-semibold text-slate-100">조건 설정</h2>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-slate-300">총 예산</label>
            <span className="text-base font-bold text-indigo-400">{formatKRWShort(budget)}원</span>
          </div>
          <input
            type="range"
            min={500000}
            max={15000000}
            step={100000}
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>50만</span><span>500만</span><span>1000만</span><span>1500만</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">여행 기간</label>
            <div className="flex gap-2 flex-wrap">
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

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">여행 스타일</label>
            <div className="flex gap-2 flex-wrap">
              {(['budget', 'standard', 'luxury'] as TravelStyle[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    style === s ? 'text-white border-transparent' : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:text-slate-200'
                  }`}
                  style={style === s ? { backgroundColor: STYLE_COLORS[s] } : {}}
                >
                  {STYLE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-2">출발 예정일</label>
          <input
            type="date"
            value={departureDate}
            onChange={e => setDepartureDate(e.target.value)}
            className="bg-slate-700/50 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors w-full"
          />
        </div>

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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            예산 내 여행지 <span className="text-indigo-400">{withinBudget.length}곳</span>
          </h2>
          <span className="text-xs text-slate-400">{duration}박 · {STYLE_LABELS[style]}</span>
        </div>

        {withinBudget.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-slate-800 rounded-2xl border border-slate-700/60">
            <p className="text-2xl mb-2">😅</p>
            <p className="text-sm">예산 내 여행지가 없습니다</p>
            <p className="text-xs mt-1 text-slate-500">예산을 늘리거나 기간·스타일을 조정해보세요</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {withinBudget.map(({ country, total, flightCost, budgetPct, flightMulti }) => (
            <button
              key={country.code}
              onClick={() => onSelectCountry(country.code)}
              className="p-4 rounded-2xl border border-emerald-800/50 bg-emerald-900/15 hover:bg-emerald-900/25 transition-all text-left group hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                    alt={country.nameKR}
                    className="w-8 h-6 object-cover rounded shadow-md flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{country.nameKR}</p>
                    <p className="text-xs text-slate-400">{country.region} · {duration}박</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
                  예산의 {budgetPct}%
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-bold text-slate-100">{formatKRWShort(total)}원</span>
                <span className="text-xs text-slate-500 mb-1">예상 총액</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-3">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                <span>✈️ {formatKRWShort(flightCost)}원</span>
                {flightMulti > 1.3 && <span className="text-amber-400">성수기 {Math.round((flightMulti-1)*100)}%↑</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {country.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {over.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-px bg-slate-700/60" />
              <span className="text-xs text-slate-500">예산 초과 ({over.length}곳)</span>
              <div className="flex-1 h-px bg-slate-700/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {over.slice(0, 6).map(({ country, total, budgetPct }) => (
                <button
                  key={country.code}
                  onClick={() => onSelectCountry(country.code)}
                  className="p-3 rounded-2xl border border-slate-700/40 bg-slate-800/60 hover:bg-slate-700/60 transition-all text-left opacity-60 hover:opacity-100"
                >
                  <div className="flex items-center gap-2">
                  <img
                      src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                      alt={country.nameKR}
                      className="w-7 h-5 object-cover rounded shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">{country.nameKR}</p>
                        <span className="text-xs text-red-400">+{budgetPct - 100}% 초과</span>
                      </div>
                      <p className="text-xs text-slate-500">{formatKRWShort(total)}원 예상</p>
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
