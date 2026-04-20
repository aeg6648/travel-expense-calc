'use client';

import { Country, TravelStyle } from '@/types/travel';
import { formatKRWShort, CATEGORY_COLORS, classifyBlogData } from '@/lib/utils';
import { getFlightMultiplier } from '@/lib/holidays';
import { useLang } from '@/context/LangContext';

interface Props {
  country: Country;
  style: TravelStyle;
  duration: number;
  departureDate: string;
  currentKrwPerUsd: number;
  selectedCity?: string | null;
  onStyleChange?: (s: TravelStyle) => void;
}

export default function CostSummaryCard({ country, style, duration, departureDate, currentKrwPerUsd, selectedCity, onStyleChange }: Props) {
  const { t } = useLang();
  const costs = country.costs[style];
  const durationRatio = duration / country.defaultDuration;
  const rateRatio = currentKrwPerUsd / 1380;
  const flightMulti = getFlightMultiplier(departureDate, country.flight.monthlyMultipliers, country.flight.holidayMultiplier);

  const breakdown = {
    flight: Math.round(costs.breakdown.flight * flightMulti),
    accommodation: Math.round(costs.breakdown.accommodation * durationRatio * rateRatio),
    food: Math.round(costs.breakdown.food * durationRatio * rateRatio),
    localTransport: Math.round(costs.breakdown.localTransport * durationRatio * rateRatio),
    activities: Math.round(costs.breakdown.activities * durationRatio * rateRatio),
    shopping: Math.round(costs.breakdown.shopping * durationRatio * rateRatio),
  };

  const calcTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const matchingBlogEntries = country.blogData.filter(d =>
    d.style === style && (!selectedCity || !d.city || d.city === selectedCity)
  );
  const blogBasedTotal = matchingBlogEntries.length > 0
    ? Math.round(
        matchingBlogEntries.reduce((sum, d) => {
          const flightAdj = (d.breakdown.flight ?? 0) * flightMulti;
          const nonFlightAdj = (d.totalKRW - (d.breakdown.flight ?? 0)) * (duration / d.duration) * rateRatio;
          return sum + flightAdj + nonFlightAdj;
        }, 0) / matchingBlogEntries.length
      )
    : null;

  const total = blogBasedTotal ?? calcTotal;
  const baseTotal = costs.avg * durationRatio;

  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/60 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <img
            src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
            alt={country.nameKR}
            className="w-10 h-7 object-cover rounded shadow-md"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-100">{country.nameKR}</h2>
            <p className="text-xs text-slate-400">{country.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{duration}{t.nightUnit} · {t.styleLabels[style]}{selectedCity ? ` · ${selectedCity}` : ''}</p>
          <p className="text-2xl font-bold text-slate-100 mt-0.5">{formatKRWShort(total)}원</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {blogBasedTotal ? t.blogReviewAvg(matchingBlogEntries.length) : t.estimated}
          </p>
        </div>
      </div>

      {/* 3-style comparison */}
      {(() => {
        const filteredBlogData = selectedCity
          ? country.blogData.filter(d => !d.city || d.city === selectedCity)
          : country.blogData;
        const classified = classifyBlogData(filteredBlogData, duration);
        const styleGroups = (['budget', 'standard', 'luxury'] as TravelStyle[]).map(s => {
          const entries = classified.filter(e => e.derivedStyle === s);
          const avgKRW = entries.length
            ? Math.round(entries.reduce((sum, e) => sum + e.normalizedKRW, 0) / entries.length)
            : null;
          return { s, avgKRW, count: entries.length };
        });
        const C = {
          budget:   { ring: 'border-emerald-500/50', bg: 'bg-emerald-900/20', label: 'text-emerald-400', val: 'text-emerald-300' },
          standard: { ring: 'border-indigo-500/50',  bg: 'bg-indigo-900/20',  label: 'text-indigo-400',  val: 'text-indigo-300'  },
          luxury:   { ring: 'border-amber-500/50',   bg: 'bg-amber-900/20',   label: 'text-amber-400',   val: 'text-amber-300'   },
        };
        return (
          <div className="bg-slate-700/30 rounded-xl p-3 space-y-2">
            <p className="text-[11px] text-slate-400">{t.blogAvgLabel(matchingBlogEntries.length, duration)}</p>
            <div className="flex gap-2">
              {styleGroups.map(({ s, avgKRW, count }) => {
                const isActive = s === style;
                const c = C[s];
                return (
                  <button
                    key={s}
                    onClick={() => onStyleChange?.(s)}
                    className={`flex-1 rounded-lg p-2.5 text-center border transition-all ${
                      isActive
                        ? `${c.ring} ${c.bg}`
                        : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-700/40 cursor-pointer'
                    }`}
                  >
                    <p className={`text-[10px] font-semibold mb-1 ${isActive ? c.label : 'text-slate-500'}`}>
                      {t.styleLabels[s]}
                    </p>
                    <p className={`text-sm font-bold ${isActive ? c.val : 'text-slate-400'}`}>
                      {avgKRW ? `${formatKRWShort(avgKRW)}원` : t.noData}
                    </p>
                    <p className={`text-[9px] mt-0.5 ${isActive ? c.label : 'text-slate-500'}`}>
                      {t.reviewCount(count)}{isActive ? ` · ${t.selected}` : ''}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Category breakdown */}
      <div className="space-y-2.5">
        {Object.entries(breakdown).map(([key, value]) => {
          const pct = Math.round((value / total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[key] }} />
                  <span className="text-slate-400">{t.categoryLabels[key as keyof typeof t.categoryLabels] ?? key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{pct}%</span>
                  <span className="text-slate-200 font-medium w-20 text-right">{formatKRWShort(value)}원</span>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: CATEGORY_COLORS[key] }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {country.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
