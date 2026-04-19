'use client';

import { Country, TravelStyle } from '@/types/travel';
import { formatKRWShort, CATEGORY_COLORS, CATEGORY_LABELS, STYLE_LABELS, STYLE_COLORS } from '@/lib/utils';

interface Props {
  country: Country;
  style: TravelStyle;
  duration: number;
  currentKrwPerUsd: number;
  selectedCity?: string | null;
}

interface BarEntry {
  name: string;
  style: string;
  flight: number;
  accommodation: number;
  food: number;
  localTransport: number;
  activities: number;
  shopping: number;
  total: number;
}

const CATEGORIES = ['flight', 'accommodation', 'food', 'localTransport', 'activities', 'shopping'] as const;

export default function CostBandChart({ country, style, duration, currentKrwPerUsd, selectedCity }: Props) {
  const styles: TravelStyle[] = ['budget', 'standard', 'luxury'];
  const rateAdj = currentKrwPerUsd / 1380;

  const barData: BarEntry[] = styles.map(s => {
    const costs = country.costs[s];
    const scale = duration / country.defaultDuration;
    const flight = Math.round(costs.breakdown.flight);
    const adj = (v: number) => Math.round(v * scale * rateAdj);
    const accommodation = adj(costs.breakdown.accommodation);
    const food = adj(costs.breakdown.food);
    const localTransport = adj(costs.breakdown.localTransport);
    const activities = adj(costs.breakdown.activities);
    const shopping = adj(costs.breakdown.shopping);
    const total = flight + accommodation + food + localTransport + activities + shopping;
    return { name: STYLE_LABELS[s], style: s, flight, accommodation, food, localTransport, activities, shopping, total };
  });

  const maxTotal = Math.max(...barData.map(d => d.total));

  const filteredBlogData = selectedCity
    ? country.blogData.filter(d => !d.city || d.city === selectedCity)
    : country.blogData;

  const blogPoints = filteredBlogData.map(d => ({
    style: d.style,
    total: Math.round(d.totalKRW * (duration / d.duration)),
  }));

  const bandData = styles.map(s => {
    const points = blogPoints.filter(p => p.style === s).map(p => p.total);
    if (!points.length) return null;
    return {
      style: s,
      name: STYLE_LABELS[s],
      min: Math.min(...points),
      avg: Math.round(points.reduce((a, b) => a + b, 0) / points.length),
      max: Math.max(...points),
    };
  }).filter(Boolean) as { style: string; name: string; min: number; avg: number; max: number }[];

  const bandMax = bandData.length ? Math.max(...bandData.map(b => b.max)) : 1;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">여행 스타일별 예상 경비</h3>
        <p className="text-xs text-slate-400 mb-5">{duration}박 기준 · 환율 반영 추정치</p>

        <div className="space-y-4">
          {barData.map(row => {
            const widthPct = (row.total / maxTotal) * 100;
            return (
              <div key={row.style}>
                <div className="flex justify-between items-center mb-1.5">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: STYLE_COLORS[row.style] + '33', color: STYLE_COLORS[row.style] }}
                  >
                    {row.name}
                  </span>
                  <span className="text-sm font-bold text-slate-100">{formatKRWShort(row.total)}원</span>
                </div>
                <div className="relative h-8 w-full bg-slate-700/50 rounded-xl overflow-hidden">
                  <div className="absolute inset-y-0 left-0 flex h-full" style={{ width: `${widthPct}%` }}>
                    {CATEGORIES.map(cat => {
                      const val = row[cat];
                      const pct = (val / row.total) * 100;
                      return (
                        <div
                          key={cat}
                          className="h-full flex-shrink-0 relative group"
                          style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                  {CATEGORIES.map(cat => (
                    <span key={cat} className="text-[10px] text-slate-500">
                      <span style={{ color: CATEGORY_COLORS[cat] }}>■</span>{' '}
                      {CATEGORY_LABELS[cat]} {formatKRWShort(row[cat])}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-700/50">
          {CATEGORIES.map(cat => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              <span className="text-xs text-slate-400">{CATEGORY_LABELS[cat]}</span>
            </div>
          ))}
        </div>
      </div>

      {bandData.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">블로그 실제 후기 경비 범위</h3>
          <p className="text-xs text-slate-400 mb-4">네이버 블로그 후기 데이터 기반 (최소~최대)</p>
          <div className="space-y-4">
            {bandData.map(d => {
              const minPct = (d.min / bandMax) * 100;
              const maxPct = (d.max / bandMax) * 100;
              const avgPct = (d.avg / bandMax) * 100;
              const barColor = STYLE_COLORS[d.style] || '#6366f1';
              return (
                <div key={d.style} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-200">{d.name}</span>
                    <span className="text-xs text-slate-400">
                      {formatKRWShort(d.min)} ~ {formatKRWShort(d.max)}원
                    </span>
                  </div>
                  <div className="relative h-6 bg-slate-700/50 rounded-full overflow-visible">
                    <div
                      className="absolute h-full rounded-full opacity-30"
                      style={{ left: `${minPct}%`, width: `${maxPct - minPct}%`, backgroundColor: barColor }}
                    />
                    <div
                      className="absolute w-3 h-3 rounded-full border-2 border-slate-800 shadow-md"
                      style={{ left: `calc(${avgPct}% - 6px)`, top: '50%', transform: 'translateY(-50%)', backgroundColor: barColor }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      평균 {formatKRWShort(d.avg)}원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
