'use client';

import { useState } from 'react';
import { Country, TravelStyle } from '@/types/travel';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import { formatKRWShort, STYLE_COLORS, STYLE_LABELS } from '@/lib/utils';

const CustomTooltip = ({
  active,
  payload,
  label,
  baselineLabel,
  baseEntry,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
  baselineLabel: string | null;
  baseEntry: Record<string, unknown> | null;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-xl p-3 text-xs space-y-1.5 shadow-xl">
      <p className="font-semibold text-slate-300 mb-1">
        {label}{baselineLabel && label !== baselineLabel ? ` (기준: ${baselineLabel})` : ''}
      </p>
      {payload.map(entry => {
        const base = baseEntry ? (baseEntry[entry.dataKey] as number | undefined) : undefined;
        const pct = base && base > 0 ? Math.round(((entry.value - base) / base) * 100) : null;
        return (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-400">{STYLE_LABELS[entry.dataKey]}:</span>
            <span className="text-slate-100 font-medium">{formatKRWShort(entry.value)}원</span>
            {pct !== null && (
              <span className={`font-medium ${pct > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {pct > 0 ? '+' : ''}{pct}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface Props {
  country: Country;
  duration: number;
  currentKrwPerUsd: number;
  allRates: Record<string, number>;
}

const QUARTER_MONTHS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];

function avgMulti(months: number[], multipliers: number[]) {
  return months.reduce((acc, m) => acc + (multipliers[m] ?? 1), 0) / months.length;
}

export default function HistoricalChart({ country, duration, currentKrwPerUsd, allRates }: Props) {
  const styles: TravelStyle[] = ['budget', 'standard', 'luxury'];
  const [baselineLabel, setBaselineLabel] = useState<string | null>(null);

  const currentKrwPerLocal = country.currency === 'USD'
    ? currentKrwPerUsd
    : Math.round((allRates.KRW ?? currentKrwPerUsd) / (allRates[country.currency] ?? 1) * 100) / 100;

  const ref2024 = country.historicalRates.find(r => r.year === 2024) ?? {
    krwPerUsd: 1380,
    krwPerLocal: currentKrwPerLocal,
  };

  function getRateForYear(yr: number) {
    const r = country.historicalRates.find(h => h.year === yr);
    if (r) return { krwPerUsd: r.krwPerUsd, krwPerLocal: r.krwPerLocal };
    return { krwPerUsd: currentKrwPerUsd, krwPerLocal: currentKrwPerLocal };
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentQIdx = Math.floor(today.getMonth() / 3);

  const quarters: { year: number; qIdx: number; label: string; months: number[] }[] = [];
  for (let yr = 2022; yr <= currentYear; yr++) {
    const maxQ = yr === currentYear ? currentQIdx : 3;
    for (let qi = 0; qi <= maxQ; qi++) {
      quarters.push({ year: yr, qIdx: qi, label: `${String(yr).slice(2)}Q${qi + 1}`, months: QUARTER_MONTHS[qi] });
    }
  }

  const chartData = quarters.map(({ year, label, months }) => {
    const rate = getRateForYear(year);
    const flightMul = avgMulti(months, country.flight.monthlyMultipliers);
    const entry: Record<string, unknown> = { year: label };

    styles.forEach(s => {
      const blogPoints = country.blogData.filter(d => d.year === year && d.style === s);
      let annualTotal: number;
      if (blogPoints.length > 0) {
        annualTotal = Math.round(
          blogPoints.reduce((acc, p) => acc + p.totalKRW * (duration / p.duration), 0) / blogPoints.length
        );
      } else {
        const flightCost = country.costs[s].breakdown.flight;
        const nonFlight = (country.costs[s].avg - flightCost) * (duration / country.defaultDuration);
        const localRatio = ref2024.krwPerLocal > 0 ? rate.krwPerLocal / ref2024.krwPerLocal : 1;
        const usdRatio = ref2024.krwPerUsd > 0 ? rate.krwPerUsd / ref2024.krwPerUsd : 1;
        annualTotal = Math.round(flightCost * usdRatio + nonFlight * localRatio);
      }
      const flightBase = country.costs[s].breakdown.flight;
      entry[s] = Math.round((annualTotal - flightBase) + flightBase * flightMul);
    });

    return entry;
  });

  const handleChartClick = (data: { activeLabel?: string } | null) => {
    if (!data?.activeLabel) return;
    setBaselineLabel(prev => prev === data.activeLabel ? null : data.activeLabel!);
  };

  const baseEntry = baselineLabel ? chartData.find(d => d.year === baselineLabel) ?? null : null;
  const baseYear = baselineLabel ? parseInt('20' + baselineLabel.slice(0, 2)) : null;
  const baseRate = baseYear ? getRateForYear(baseYear) : null;
  const rateImpactPct = baseRate && baseRate.krwPerLocal > 0
    ? Math.round(((currentKrwPerLocal / baseRate.krwPerLocal) - 1) * 100)
    : null;

  const localDisplayValue = currentKrwPerLocal < 1
    ? currentKrwPerLocal.toFixed(4)
    : currentKrwPerLocal < 100
      ? currentKrwPerLocal.toFixed(1)
      : Math.round(currentKrwPerLocal).toLocaleString();
  const currencyPair = country.currency === 'USD' ? 'USD/KRW' : `${country.currency}/KRW`;

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">분기별 여행 경비 추이</h3>
          <p className="text-xs text-slate-400">블로그 후기 기반 · {duration}박 · 계절 항공료 반영</p>
        </div>
        {baselineLabel ? (
          <button
            onClick={() => setBaselineLabel(null)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60 transition-colors shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {baselineLabel} 기준 ✕
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 shrink-0">차트 클릭 → 기준 설정</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          onClick={handleChartClick}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tickFormatter={v => `${formatKRWShort(v)}`}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip baselineLabel={baselineLabel} baseEntry={baseEntry} />} />
          {baselineLabel && (
            <ReferenceLine
              x={baselineLabel}
              stroke="#818cf8"
              strokeDasharray="4 2"
              label={{ value: '기준', fill: '#818cf8', fontSize: 9, position: 'top' }}
            />
          )}
          {styles.map(s => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              stroke={STYLE_COLORS[s]}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-3 justify-center">
        {styles.map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: STYLE_COLORS[s] }} />
            <span className="text-xs text-slate-400">{STYLE_LABELS[s]}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700/50 pt-3 grid grid-cols-2 gap-3">
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">현재 환율 ({currencyPair})</p>
          <p className="text-lg font-bold text-slate-100">
            1{country.currencySymbol} = {localDisplayValue}원
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          {baselineLabel && rateImpactPct !== null ? (
            <>
              <p className="text-xs text-slate-400 mb-1">{baselineLabel} 대비 ({currencyPair})</p>
              <p className={`text-lg font-bold ${
                rateImpactPct > 0 ? 'text-red-400' :
                rateImpactPct < 0 ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {rateImpactPct > 0 ? '▲' : rateImpactPct < 0 ? '▼' : '—'} {Math.abs(rateImpactPct)}%
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-1">기간 비교</p>
              <p className="text-xs text-slate-500 leading-relaxed">차트의 분기를 클릭하면<br />해당 시점 대비 변화를 표시</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
