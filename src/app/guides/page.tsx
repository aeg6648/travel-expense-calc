import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: '여행 가이드 - 국가별·시기별·예산별 완전정리 | 트립비',
  description:
    '20대 첫 해외여행, 2026 일본 경비, 동남아 가성비 비교, 성수기 항공권 분석 등 여행 경비 실전 가이드 모음.',
  alternates: {
    canonical: 'https://www.tripbudget.my/guides',
    languages: {
      ko: 'https://www.tripbudget.my/guides',
      'x-default': 'https://www.tripbudget.my/guides',
    },
  },
  openGraph: {
    title: '여행 가이드 | 트립비',
    description: '첫 해외여행 예산부터 동남아 가성비 비교까지, 한국 여행자용 실전 가이드.',
    type: 'website',
    url: 'https://www.tripbudget.my/guides',
    locale: 'ko_KR',
    siteName: 'TRIP-B',
  },
};

export default function GuidesIndexPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '트립비 여행 가이드',
    inLanguage: 'ko-KR',
    url: 'https://www.tripbudget.my/guides',
    hasPart: GUIDES.map((g) => ({
      '@type': 'Article',
      headline: g.title,
      url: `https://www.tripbudget.my/guides/${g.slug}`,
      datePublished: g.publishedAt,
      dateModified: g.updatedAt,
      inLanguage: 'ko-KR',
    })),
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-gradient-to-b from-slate-800/60 to-[#0f1117] pt-10 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors mb-6"
          >
            ← 트립비 홈으로
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">여행 가이드</h1>
          <p className="text-slate-400 text-sm">
            한국 여행자가 가장 많이 궁금해하는 질문들을 데이터 기반으로 정리했습니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="group bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 hover:border-indigo-500/50 transition-all"
          >
            <div className="text-4xl mb-3">{g.hero.emoji}</div>
            <h2 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors">
              {g.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
              {g.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>📖 {g.readingMinutes}분</span>
              <span>·</span>
              <span>{g.updatedAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
