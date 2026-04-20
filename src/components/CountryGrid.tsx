'use client';

import { Country } from '@/types/travel';
import { COUNTRIES, REGIONS } from '@/lib/travel-data';
import { formatKRWShort } from '@/lib/utils';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';

interface Props {
  selectedCode: string | null;
  onSelect: (code: string) => void;
  style: 'budget' | 'standard' | 'luxury';
}

const COUNTRY_PHOTOS: Record<string, { url: string; fallbackFrom: string; fallbackTo: string }> = {
  JP: { url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#9f1239', fallbackTo: '#be123c' },
  TH: { url: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#92400e', fallbackTo: '#b45309' },
  VN: { url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#065f46', fallbackTo: '#047857' },
  TW: { url: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#0c4a6e', fallbackTo: '#075985' },
  SG: { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#7f1d1d', fallbackTo: '#991b1b' },
  PH: { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#0e4163', fallbackTo: '#0369a1' },
  ID: { url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#14532d', fallbackTo: '#166534' },
  FR: { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#312e81', fallbackTo: '#3730a3' },
  ES: { url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#7c2d12', fallbackTo: '#9a3412' },
  TR: { url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#7f1d1d', fallbackTo: '#991b1b' },
  US: { url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#1e3a5f', fallbackTo: '#1d4ed8' },
  AU: { url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#78350f', fallbackTo: '#92400e' },
  HK: { url: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#4c1d95', fallbackTo: '#5b21b6' },
  IT: { url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=75&auto=format&fit=crop', fallbackFrom: '#14532d', fallbackTo: '#15803d' },
};

export default function CountryGrid({ selectedCode, onSelect, style }: Props) {
  const { t } = useLang();
  const [region, setRegion] = useState<string>('전체');
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter(c => {
    const matchRegion = region === '전체' || c.region === region;
    const matchSearch = !search ||
      c.nameKR.includes(search) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.includes(search));
    return matchRegion && matchSearch;
  });

  return (
    <div className="space-y-4">
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
  const { t, lang } = useLang();
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
            {lang === 'ko' ? country.nameKR : country.name}
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
          {t.avgCostFrom(formatKRWShort(avgCost))}
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
