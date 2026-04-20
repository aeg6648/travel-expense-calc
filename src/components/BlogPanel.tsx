'use client';

import { useEffect, useState } from 'react';
import { Country } from '@/types/travel';
import { formatKRWShort, classifyBlogData, ClassifiedBlogEntry } from '@/lib/utils';

interface BlogPost {
  title: string;
  link: string;
  description: string;
  bloggerName: string;
  postDate: string;
}

interface GPlace {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  photoRef?: string | null;
}

interface Props {
  country: Country;
  duration: number;
  selectedCity?: string | null;
}

type DerivedStyle = 'budget' | 'standard' | 'luxury';

const STYLE_INFO: Record<DerivedStyle, { label: string; color: string; bg: string; border: string; val: string }> = {
  budget:   { label: '알뜰',    color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-700/50', val: 'text-emerald-300' },
  standard: { label: '일반',    color: 'text-indigo-400',  bg: 'bg-indigo-900/20',  border: 'border-indigo-700/50',  val: 'text-indigo-300'  },
  luxury:   { label: '프리미엄', color: 'text-amber-400',  bg: 'bg-amber-900/20',   border: 'border-amber-700/50',   val: 'text-amber-300'   },
};

const STYLES: DerivedStyle[] = ['budget', 'standard', 'luxury'];

function avg(entries: ClassifiedBlogEntry[]) {
  if (!entries.length) return 0;
  return Math.round(entries.reduce((s, e) => s + e.normalizedKRW, 0) / entries.length);
}

export default function BlogPanel({ country, duration, selectedCity }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [noApi, setNoApi] = useState(false);
  const [activeStyle, setActiveStyle] = useState<DerivedStyle>('standard');
  const [gPlaces, setGPlaces] = useState<GPlace[]>([]);
  const [gLoading, setGLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setNoApi(false);
    fetch(`/api/naver-blogs?country=${encodeURIComponent(country.nameKR)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === 'NAVER_API_KEY_MISSING') setNoApi(true);
        else setPosts(data.items || []);
      })
      .catch(() => setNoApi(true))
      .finally(() => setLoading(false));
  }, [country.nameKR]);

  useEffect(() => {
    const q = selectedCity ? `${selectedCity} 여행 관광지` : `${country.nameKR} 여행 관광지`;
    setGLoading(true);
    setGPlaces([]);
    fetch(`/api/places?q=${encodeURIComponent(q)}&lang=ko`)
      .then(r => r.json())
      .then(data => setGPlaces(data.places || []))
      .catch(() => {})
      .finally(() => setGLoading(false));
  }, [country.nameKR, selectedCity]);

  const filteredBlogData = selectedCity
    ? country.blogData.filter(d => !d.city || d.city === selectedCity)
    : country.blogData;
  const classified = classifyBlogData(filteredBlogData, duration);
  const grouped = STYLES.map(s => ({
    style: s,
    entries: classified.filter(e => e.derivedStyle === s),
    avgKRW: avg(classified.filter(e => e.derivedStyle === s)),
  })).filter(g => g.entries.length > 0);

  const activeGroup = grouped.find(g => g.style === activeStyle) ?? grouped[0];

  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/60 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-semibold text-slate-100">실제 여행자 지출 후기</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
            {selectedCity ? `${selectedCity} · ` : ''}{duration}박 환산 · 지출액 기준 분류
          </span>
        </div>
        <p className="text-[11px] text-slate-500">1박 지출 하위33% → 알뜰, 중간 → 일반, 상위33% → 프리미엄</p>
      </div>

      <div className="flex gap-1.5">
        {grouped.map(({ style, avgKRW }) => {
          const info = STYLE_INFO[style];
          const isActive = activeStyle === style;
          return (
            <button
              key={style}
              onClick={() => setActiveStyle(style)}
              className={`flex-1 py-2 rounded-lg text-center border transition-all ${
                isActive ? `${info.bg} ${info.border}` : 'border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <p className={`text-[10px] font-semibold ${isActive ? info.color : 'text-slate-500'}`}>{info.label}</p>
              <p className={`text-xs font-bold mt-0.5 ${isActive ? info.val : 'text-slate-500'}`}>
                평균 {formatKRWShort(avgKRW)}원
              </p>
            </button>
          );
        })}
      </div>

      {activeGroup && (
        <div className="space-y-2.5">
          {activeGroup.entries.map((d, i) => {
            const info = STYLE_INFO[activeGroup.style];
            return (
              <div key={i} className={`p-3 rounded-xl border ${info.bg} ${info.border} space-y-1.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate">{d.source}</span>
                    {d.city && (
                      <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-400">
                        {d.city}
                      </span>
                    )}
                  </div>
                  <span className={`shrink-0 text-sm font-bold ml-2 ${info.val}`}>
                    {formatKRWShort(d.normalizedKRW)}원
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                  <span>원본 {d.duration}박 ({formatKRWShort(d.totalKRW)}원) → {duration}박 환산</span>
                  <span>{d.year}년</span>
                  <span className="text-slate-500">1박 {formatKRWShort(Math.round(d.perNight))}원</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                  {(() => {
                    const bd = d.breakdown as Record<string, number>;
                    return (
                      <>
                        <span>항공 {formatKRWShort(bd.flight ?? 0)}원</span>
                        <span>숙박 {formatKRWShort(Math.round((bd.accommodation ?? 0) * duration / d.duration))}원</span>
                        <span>식비 {formatKRWShort(Math.round((bd.food ?? 0) * duration / d.duration))}원</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(gLoading || gPlaces.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500/80" />
            Google 인기 장소
          </p>
          {gLoading && (
            <div className="animate-pulse space-y-1.5 p-3 rounded-xl bg-slate-700/30">
              <div className="h-3 bg-slate-700 rounded w-2/3" />
              <div className="h-2 bg-slate-700/50 rounded w-1/2" />
            </div>
          )}
          <div className="flex flex-col gap-2">
            {gPlaces.map(place => (
              <a
                key={place.placeId}
                href={`https://www.google.com/maps/place/?q=place_id:${place.placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/60 border border-slate-700/40 hover:border-blue-600/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-slate-200 group-hover:text-blue-300 transition-colors leading-tight">
                    {place.name}
                  </p>
                  {place.rating != null && (
                    <span className="shrink-0 text-[11px] font-semibold text-amber-400 flex items-center gap-0.5">
                      ★ {place.rating.toFixed(1)}
                      {place.userRatingsTotal != null && (
                        <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                          ({place.userRatingsTotal.toLocaleString()})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {place.address && (
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{place.address}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium">최신 네이버 블로그</p>
          {posts.map((post, i) => (
            <a
              key={i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/60 border border-slate-700/40 hover:border-slate-600 transition-colors group"
            >
              <p className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                {post.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{post.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-slate-500">{post.bloggerName}</span>
                <span className="text-[10px] text-slate-600">·</span>
                <span className="text-[10px] text-slate-500">
                  {post.postDate ? `${post.postDate.slice(0, 4)}.${post.postDate.slice(4, 6)}.${post.postDate.slice(6)}` : ''}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
          <p className="text-[11px] text-slate-400">최신 블로그 로딩 중...</p>
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse space-y-1.5 p-3 rounded-xl bg-slate-700/30">
              <div className="h-3 bg-slate-700 rounded w-3/4" />
              <div className="h-2 bg-slate-700/50 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {noApi && (
        <p className="text-[10px] text-slate-500 pt-1">
          실시간 블로그 연동: .env.local에 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 설정
        </p>
      )}
    </div>
  );
}
