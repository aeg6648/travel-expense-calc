'use client';

import { Country } from '@/types/travel';
import { COUNTRIES, REGIONS } from '@/lib/travel-data';
import { formatKRWShort } from '@/lib/utils';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import { getVibe, type VibeId } from '@/lib/vibes';
import { COUNTRY_PHOTOS } from '@/lib/country-photos';

interface Props {
  selectedCode: string | null;
  onSelect: (code: string) => void;
  style: 'budget' | 'standard' | 'luxury';
  vibeId?: VibeId | null;
  onClearVibe?: () => void;
}

export default function CountryGrid({ selectedCode, onSelect, style, vibeId, onClearVibe }: Props) {
  const { t } = useLang();
  const [region, setRegion] = useState<string>('전체');
  const [search, setSearch] = useState('');

  const vibe = getVibe(vibeId);
  const vibeSet = vibe ? new Set(vibe.countries) : null;

  const filtered = COUNTRIES.filter(c => {
    const matchVibe = !vibeSet || vibeSet.has(c.code);
    const matchRegion = region === '전체' || c.region === region;
    const matchSearch = !search ||
      c.nameKR.includes(search) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.includes(search));
    return matchVibe && matchRegion && matchSearch;
  });
  // When a vibe is active, keep the suggested order (best-fit first)
  if (vibe) {
    filtered.sort((a, b) => vibe.countries.indexOf(a.code) - vibe.countries.indexOf(b.code));
  }

  return (
    <div className="space-y-4">
      {vibe && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-900/40 via-slate-800 to-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{vibe.emoji}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">무드 필터</p>
              <p className="text-sm font-semibold text-slate-100 truncate">{vibe.label} 여행지 {filtered.length}곳</p>
            </div>
          </div>
          {onClearVibe && (
            <button
              onClick={onClearVibe}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
            >필터 해제</button>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-sm">✕</button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              region === r
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            {t.regionLabels[r as keyof typeof t.regionLabels] ?? r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(country => {
          const cost = country.costs[style];
          const isSelected = selectedCode === country.code;
          return (
            <CountryCard
              key={country.code}
              country={country}
              isSelected={isSelected}
              avgCost={cost.avg}
              onSelect={() => onSelect(country.code)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>{t.noSearchResults}</p>
        </div>
      )}
    </div>
  );
}

function CountryCard({
  country,
  isSelected,
  avgCost,
  onSelect,
}: {
  country: Country;
  isSelected: boolean;
  avgCost: number;
  onSelect: () => void;
}) {
  const { t } = useLang();

  const costLabel = `평균 ${formatKRWShort(avgCost)}원~`;
  const photo = COUNTRY_PHOTOS[country.code];
  const fallbackStyle = photo
    ? { background: `linear-gradient(135deg, ${photo.fallbackFrom}, ${photo.fallbackTo})` }
    : { background: 'linear-gradient(135deg, #312e81, #3730a3)' };

  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onSelect}
      className={`group flex flex-col rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] overflow-hidden border ${
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-500/30'
          : 'border-slate-700/60 hover:border-slate-500'
      }`}
    >
      {/* Photo header */}
      <div className="h-28 flex-shrink-0 relative overflow-hidden" style={imgError || !photo ? fallbackStyle : {}}>
        {photo && !imgError && (
          <img
            src={photo.url}
            alt={country.nameKR}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {/* 상단 그라디언트 - 국기 가독성 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        {/* 하단 그라디언트 - 텍스트 가독성 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {/* 상단 좌: 국기 */}
        <span className="absolute top-2.5 left-3 text-2xl text-white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}>
          {country.flag}
        </span>
        {/* 하단: 국가명 + 지역 */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
          <p className="font-bold text-white text-sm leading-tight" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {country.nameKR}
          </p>
          <p className="text-white/70 text-[10px] mt-0.5">{t.regionLabels[country.region as keyof typeof t.regionLabels] ?? country.region}</p>
        </div>
        {isSelected && (
          <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold shadow">✓</span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 bg-slate-800 flex-1">
        <p className="text-xs font-semibold text-indigo-400 mb-2">
          {costLabel}
        </p>
        <div className="flex flex-wrap gap-1">
          {country.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
