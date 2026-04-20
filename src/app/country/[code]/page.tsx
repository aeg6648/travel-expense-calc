import type { Metadata } from 'next';
import { getCountryByCode } from '@/lib/travel-data';

type PageProps = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code: rawCode } = await params;
  const country = getCountryByCode(rawCode?.toUpperCase() ?? '');
  if (!country) return { title: '국가를 찾을 수 없습니다 | 트립비' };
  const url = `https://www.tripbudget.my/country/${rawCode.toLowerCase()}`;
  return {
    title: `${country.nameKR} 여행 경비 완전 가이드 2026 | 트립비`,
    description: `${country.nameKR} 여행 경비 총정리. 알뜰·일반·프리미엄 스타일별 실제 예산, 항공료 ₩${country.flight.basePriceKRW.toLocaleString()}~, 숙박·식비·교통비 상세 분석`,
    keywords: [
      `${country.nameKR} 여행 경비`,
      `${country.nameKR} 여행 비용 2026`,
      `${country.nameKR} 여행 예산`,
      `${country.nameKR} 항공료`,
      `${country.nameKR} 숙박비`,
      `${country.nameKR} ${country.defaultDuration}박 경비`,
      ...country.tags,
    ],
    alternates: {
      canonical: url,
      languages: { ko: url, 'x-default': url },
    },
    openGraph: {
      title: `${country.nameKR} 여행 경비 가이드 | 트립비`,
      description: `${country.nameKR} ${country.defaultDuration}박 기준 알뜰 ₩${country.costs.budget.avg.toLocaleString()} ~ 프리미엄 ₩${country.costs.luxury.avg.toLocaleString()}`,
      type: 'article',
      url,
      locale: 'ko_KR',
      siteName: 'TRIP-B',
    },
  };
}

export async function generateStaticParams() {
  const countries = ['AU', 'JP', 'TH', 'SG', 'US', 'GB', 'FR', 'DE', 'ES', 'IT', 'TR', 'VN', 'TW', 'HK', 'PH', 'ID'];
  return countries.map((code) => ({ code: code.toLowerCase() }));
}

export default async function CountryPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = rawCode?.toUpperCase();
  const country = code ? getCountryByCode(code) : null;

  if (!country) {
    return (
      <div className="min-h-screen bg-[#0f1117] text-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">국가를 찾을 수 없습니다</h1>
          <p className="text-slate-400">요청하신 국가의 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  const nights = country.defaultDuration;
  const bCosts = country.costs.budget;
  const sCosts = country.costs.standard;
  const lCosts = country.costs.luxury;
  const bdk = bCosts.breakdown;
  const sdk = sCosts.breakdown;
  const cities = country.cities?.join(', ') || '';

  const recentBlogData = country.blogData
    .filter(b => b.year >= 2023)
    .sort((a, b) => b.year - a.year)
    .slice(0, 4);

  const countryUrl = `https://www.tripbudget.my/country/${code!.toLowerCase()}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '트립비', item: 'https://www.tripbudget.my' },
          { '@type': 'ListItem', position: 2, name: `${country.nameKR} 여행 경비`, item: countryUrl },
        ],
      },
      {
        '@type': 'TravelAction',
        name: `${country.nameKR} 여행 경비 계산`,
        inLanguage: 'ko-KR',
        fromLocation: { '@type': 'Country', name: '대한민국' },
        toLocation: { '@type': 'Country', name: country.nameKR },
        url: countryUrl,
      },
      {
        '@type': 'Article',
        headline: `${country.nameKR} 여행 경비 완전 가이드 2026`,
        inLanguage: 'ko-KR',
        url: countryUrl,
        about: { '@type': 'Country', name: country.nameKR },
        publisher: {
          '@type': 'Organization',
          name: 'TRIP-B',
          url: 'https://www.tripbudget.my',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-gradient-to-b from-slate-800/60 to-[#0f1117] pt-10 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors mb-6">
            ← 트립비 홈으로
          </a>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">{country.flag}</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">{country.nameKR} 여행 경비 완전 가이드</h1>
              <p className="text-slate-400 mt-1">{country.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {country.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-indigo-900/40 border border-indigo-700/40 text-indigo-300">#{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* 스타일별 총 경비 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-1">🎒 알뜰 여행</h3>
            <p className="text-[11px] text-slate-500 mb-2">{nights}박 기준</p>
            <p className="text-2xl font-bold text-emerald-400">₩{bCosts.avg.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">범위 ₩{bCosts.min.toLocaleString()} ~ ₩{bCosts.max.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-indigo-700/40">
            <h3 className="text-sm text-slate-400 mb-1">🏨 표준 여행</h3>
            <p className="text-[11px] text-slate-500 mb-2">{nights}박 기준</p>
            <p className="text-2xl font-bold text-indigo-400">₩{sCosts.avg.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">범위 ₩{sCosts.min.toLocaleString()} ~ ₩{sCosts.max.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm text-slate-400 mb-1">💎 프리미엄</h3>
            <p className="text-[11px] text-slate-500 mb-2">{nights}박 기준</p>
            <p className="text-2xl font-bold text-amber-400">₩{lCosts.avg.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">범위 ₩{lCosts.min.toLocaleString()} ~ ₩{lCosts.max.toLocaleString()}</p>
          </div>
        </div>

        {/* 비용 구성 상세 */}
        <section>
          <h2 className="text-xl font-bold mb-4">비용 구성 상세</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: '🎒 알뜰 여행', color: 'text-emerald-400', bk: bdk, total: bCosts.avg },
              { label: '🏨 표준 여행', color: 'text-indigo-400', bk: sdk, total: sCosts.avg },
            ].map(({ label, color, bk, total }) => (
              <div key={label} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/60">
                <h3 className={`font-semibold ${color} mb-3`}>{label} ({nights}박)</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { icon: '✈️', name: '항공', val: bk.flight },
                    { icon: '🏨', name: '숙박', val: bk.accommodation },
                    { icon: '🍽️', name: '식비', val: bk.food },
                    { icon: '🚌', name: '교통', val: bk.localTransport },
                    { icon: '🎯', name: '액티비티', val: bk.activities },
                    { icon: '🛍️', name: '쇼핑', val: bk.shopping },
                  ].map(({ icon, name, val }) => (
                    <li key={name} className="flex items-center justify-between">
                      <span className="text-slate-400">{icon} {name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-700 rounded-full h-1">
                          <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${Math.round((val / total) * 100)}%` }} />
                        </div>
                        <span className="text-slate-200 w-28 text-right">₩{val.toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                  <li className="flex justify-between border-t border-slate-700 pt-2 font-semibold">
                    <span className="text-slate-300">합계</span>
                    <span className={color}>₩{total.toLocaleString()}</span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 항공편 */}
        <section>
          <h2 className="text-xl font-bold mb-4">항공편 정보</h2>
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/60 space-y-4">
            <p className="text-slate-300 text-sm">
              한국 → {country.nameKR} 편도 최저가 기준 <strong className="text-white">₩{country.flight.basePriceKRW.toLocaleString()}</strong>부터 시작 (왕복 ₩{(country.flight.basePriceKRW * 2).toLocaleString()} 내외)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {country.flight.airlineOptions.map(a => (
                <div key={a.name} className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-slate-200">{a.name}</p>
                  <p className="text-xs text-indigo-300 mt-1 font-semibold">
                    ₩{Math.round(country.flight.basePriceKRW * a.priceMultiplier * 2).toLocaleString()}~
                  </p>
                  <p className="text-[10px] text-slate-500">왕복 기준</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 기간별 예산 */}
        <section>
          <h2 className="text-xl font-bold mb-4">기간별 예산 가이드</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-700">
                  <th className="pb-2 pr-4">기간</th>
                  <th className="pb-2 pr-4 text-emerald-400">알뜰</th>
                  <th className="pb-2 pr-4 text-indigo-400">표준</th>
                  <th className="pb-2 text-amber-400">프리미엄</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[3, 5, 7, 10, 14].map(n => {
                  const ratio = n / nights;
                  return (
                    <tr key={n} className="text-slate-300">
                      <td className="py-2.5 pr-4 font-medium">{n}박 {n+1}일</td>
                      <td className="py-2.5 pr-4 text-emerald-300">₩{Math.round(bCosts.avg * ratio).toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-indigo-300">₩{Math.round(sCosts.avg * ratio).toLocaleString()}</td>
                      <td className="py-2.5 text-amber-300">₩{Math.round(lCosts.avg * ratio).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">* 항공료 포함 전체 경비 기준. 성수기·환율 변동에 따라 달라질 수 있음.</p>
        </section>

        {/* 실제 블로그 후기 데이터 */}
        {recentBlogData.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">실제 여행자 경비 후기</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentBlogData.map((b, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">{b.year}년 · {b.duration}박</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.style === 'budget' ? 'bg-emerald-900/40 text-emerald-300' :
                      b.style === 'standard' ? 'bg-indigo-900/40 text-indigo-300' :
                      'bg-amber-900/40 text-amber-300'
                    }`}>
                      {b.style === 'budget' ? '알뜰' : b.style === 'standard' ? '표준' : '프리미엄'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{b.source}</p>
                  <p className="text-lg font-bold text-slate-100">₩{b.totalKRW.toLocaleString()}</p>
                  {b.city && <p className="text-xs text-slate-500 mt-0.5">{b.city}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 여행 정보 */}
        <section>
          <h2 className="text-xl font-bold mb-4">{country.nameKR} 기본 여행 정보</h2>
          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4 border border-slate-700/60">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">통화</p>
                <p className="text-slate-200 font-medium">{country.currency} ({country.currencySymbol})</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">추천 여행 기간</p>
                <p className="text-slate-200 font-medium">{nights}박 {nights+1}일</p>
              </div>
              {cities && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">주요 도시</p>
                  <p className="text-slate-200 font-medium text-sm">{cities}</p>
                </div>
              )}
            </div>
            <div className="border-t border-slate-700/60 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-300 mb-2">포함 비용</p>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>숙박료 (호텔, 게스트하우스, 에어비앤비)</li>
                  <li>식사비 (현지 음식점, 카페)</li>
                  <li>지역 교통비 (대중교통, 택시)</li>
                  <li>입장료 및 관광 비용</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-300 mb-2">미포함 비용</p>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>국제 항공료 (별도 표기)</li>
                  <li>여행자 보험</li>
                  <li>비자 신청료</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-4 pb-8">
          <p className="text-slate-400 text-sm mb-4">더 정확한 경비를 계산해보세요</p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-indigo-900/40"
          >
            트립비에서 상세 계산하기 →
          </a>
        </div>
      </div>
    </div>
  );
}
