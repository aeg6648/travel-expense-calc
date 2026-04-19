'use client';

import { Country } from '@/types/travel';
import { getFlightMultiplier, getHolidayInfo } from '@/lib/holidays';
import { formatKRW, formatKRWShort } from '@/lib/utils';

interface Props {
  country: Country;
  departureDate: string;
  style: 'budget' | 'standard' | 'luxury';
}

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function FlightCard({ country, departureDate, style }: Props) {
  const flightBase = country.costs[style].breakdown.flight;
  const flightData = country.flight;
  const multiplier = getFlightMultiplier(departureDate, flightData.monthlyMultipliers, flightData.holidayMultiplier);
  const adjustedPrice = Math.round(flightBase * multiplier);
  const holidayInfo = getHolidayInfo(departureDate);
  const isPeak = multiplier >= 1.4;
  const isCheap = multiplier <= 0.9;
  const monthMax = Math.max(...flightData.monthlyMultipliers);
  const monthMin = Math.min(...flightData.monthlyMultipliers);

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">항공권 가격 예측</h3>
          <p className="text-xs text-slate-400">인천 출발 왕복 기준 · {style === 'budget' ? 'LCC' : style === 'standard' ? '일반석' : '프리미엄'}</p>
        </div>
        <span className="text-2xl">{country.flag}</span>
      </div>

      {holidayInfo && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
          holidayInfo.priceMultiplier >= 1.8
            ? 'bg-red-900/30 border border-red-800/50 text-red-400'
            : 'bg-amber-900/30 border border-amber-800/50 text-amber-400'
        }`}>
          <span className="text-base flex-shrink-0">
            {holidayInfo.priceMultiplier >= 1.8 ? '🔴' : '🟡'}
          </span>
          <div>
            <p className="font-semibold">{holidayInfo.name} ({holidayInfo.priceMultiplier}x 가격 상승)</p>
            <p className="opacity-75 mt-0.5">
              연휴 전후 항공권은 평소보다 최대 {Math.round((holidayInfo.priceMultiplier - 1) * 100)}% 비쌉니다.
            </p>
          </div>
        </div>
      )}

      <div className={`p-4 rounded-xl border ${
        isPeak ? 'bg-red-900/20 border-red-800/40' :
        isCheap ? 'bg-emerald-900/20 border-emerald-800/40' :
        'bg-slate-700/30 border-slate-600/40'
      }`}>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${isPeak ? 'text-red-400' : isCheap ? 'text-emerald-400' : 'text-slate-100'}`}>
            {formatKRWShort(adjustedPrice)}원
          </span>
          {multiplier !== 1.0 && (
            <span className={`text-sm mb-1 ${isPeak ? 'text-red-400' : 'text-emerald-400'}`}>
              ({isPeak ? '+' : ''}{Math.round((multiplier - 1) * 100)}%)
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          비성수기 기준 {formatKRWShort(flightBase)}원 · 현재 계수 {multiplier.toFixed(2)}x
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-3">월별 항공권 가격 변동</p>
        <div className="relative h-32">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-full border-t border-slate-700/40" />
            ))}
          </div>
          <div className="absolute inset-0 flex gap-1 items-end pb-0">
            {flightData.monthlyMultipliers.map((m, i) => {
              const heightPct = ((m - monthMin) / (monthMax - monthMin || 1)) * 70 + 20;
              const isCurrentMonth = new Date(departureDate).getMonth() === i;
              const isExpensive = m >= 1.4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  {isCurrentMonth && (
                    <span className="text-[9px] font-bold text-indigo-400 mb-0.5 leading-none">
                      {Math.round(m * 100)}%
                    </span>
                  )}
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isCurrentMonth ? 'bg-indigo-500 shadow-lg shadow-indigo-900/50' :
                      isExpensive ? 'bg-red-500/60' : 'bg-slate-600/60'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex mt-1.5">
          {MONTH_LABELS.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <span className={`text-[9px] leading-none ${
                new Date(departureDate).getMonth() === i ? 'text-indigo-400 font-bold' : 'text-slate-600'
              }`}>
                {i % 3 === 0 ? label : i === new Date(departureDate).getMonth() ? label : ''}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />선택한 달</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 inline-block" />성수기</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-600/60 inline-block" />일반</div>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-2">항공사별 예상 가격</p>
        <div className="space-y-2">
          {flightData.airlineOptions.map(airline => {
            const price = Math.round(adjustedPrice * airline.priceMultiplier);
            return (
              <div key={airline.name} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-28 flex-shrink-0">{airline.name}</span>
                <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500/70"
                    style={{ width: `${(airline.priceMultiplier / 1.5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-200 w-20 text-right">
                  {formatKRWShort(price)}원
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
