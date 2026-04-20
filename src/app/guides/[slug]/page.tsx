import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, getGuideBySlug, GuideSection } from '@/lib/guides';
import { getCountryByCode } from '@/lib/travel-data';
import ShareButton from '@/components/ShareButton';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: '가이드를 찾을 수 없습니다 | 트립비' };
  const url = `https://www.tripbudget.my/guides/${slug}`;
  return {
    title: `${guide.title} | 트립비`,
    description: guide.description,
    keywords: guide.keywords,
    alternates: {
      canonical: url,
      languages: { ko: url, 'x-default': url },
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      url,
      locale: 'ko_KR',
      siteName: 'TRIP-B',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
    },
  };
}

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

function renderSection(s: GuideSection, idx: number) {
  const headingId = s.id ?? `sec-${idx}`;
  switch (s.type) {
    case 'paragraph':
      return (
        <section key={idx} id={headingId} className="scroll-mt-20">
          {s.heading && <h2 className="text-2xl font-bold mb-3 text-slate-100">{s.heading}</h2>}
          <p className="text-slate-300 leading-relaxed">{s.body}</p>
        </section>
      );
    case 'list':
      return (
        <section key={idx} id={headingId} className="scroll-mt-20">
          {s.heading && <h2 className="text-2xl font-bold mb-3 text-slate-100">{s.heading}</h2>}
          {s.ordered ? (
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              {s.items.map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-slate-300 leading-relaxed">
              {s.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}
        </section>
      );
    case 'table':
      return (
        <section key={idx} id={headingId} className="scroll-mt-20">
          {s.heading && <h2 className="text-2xl font-bold mb-4 text-slate-100">{s.heading}</h2>}
          <div className="overflow-x-auto rounded-xl border border-slate-700/60">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60 text-slate-300">
                <tr>
                  {s.columns.map((col) => (
                    <th key={col} className="text-left px-4 py-2.5 font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {s.rows.map((row, ri) => (
                  <tr key={ri} className="text-slate-200 hover:bg-slate-800/30 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-2.5">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    case 'callout': {
      const toneClass =
        s.tone === 'info'
          ? 'bg-indigo-900/30 border-indigo-700/50 text-indigo-200'
          : s.tone === 'warn'
          ? 'bg-amber-900/30 border-amber-700/50 text-amber-200'
          : 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200';
      return (
        <aside key={idx} className={`rounded-xl border px-5 py-4 ${toneClass}`}>
          <p className="font-semibold mb-1">{s.title}</p>
          <p className="text-sm leading-relaxed opacity-90">{s.body}</p>
        </aside>
      );
    }
    case 'quote':
      return (
        <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-2 italic text-slate-300">
          {s.text}
          {s.source && <footer className="mt-1 text-xs text-slate-500 not-italic">— {s.source}</footer>}
        </blockquote>
      );
  }
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const url = `https://www.tripbudget.my/guides/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        inLanguage: 'ko-KR',
        url,
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        author: { '@type': 'Organization', name: 'TRIP-B', url: 'https://www.tripbudget.my' },
        publisher: { '@type': 'Organization', name: 'TRIP-B', url: 'https://www.tripbudget.my' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '트립비', item: 'https://www.tripbudget.my' },
          { '@type': 'ListItem', position: 2, name: '가이드', item: 'https://www.tripbudget.my/guides' },
          { '@type': 'ListItem', position: 3, name: guide.title, item: url },
        ],
      },
      guide.faq && guide.faq.length > 0
        ? {
            '@type': 'FAQPage',
            mainEntity: guide.faq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }
        : null,
    ].filter(Boolean),
  };

  const relatedCountries =
    guide.relatedCountries?.map((code) => getCountryByCode(code)).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-gradient-to-b from-slate-800/60 to-[#0f1117] pt-10 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-indigo-400 transition-colors">트립비</Link>
            <span>·</span>
            <Link href="/guides" className="hover:text-indigo-400 transition-colors">가이드</Link>
          </div>
          <div className="text-5xl mb-4">{guide.hero.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">{guide.title}</h1>
          <p className="text-slate-400 mb-4">{guide.hero.tagline}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>📖 {guide.readingMinutes}분 소요</span>
            <span>·</span>
            <span>업데이트 {guide.updatedAt}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 mb-10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            목차
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            {guide.tableOfContents.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="space-y-10 prose-lg">
          {guide.sections.map((s, i) => renderSection(s, i))}
        </article>

        {guide.faq && guide.faq.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-slate-100">자주 묻는 질문</h2>
            {guide.faq.map((f, i) => (
              <details key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 group">
                <summary className="font-semibold cursor-pointer text-slate-200 group-open:text-indigo-300 transition-colors">
                  Q. {f.q}
                </summary>
                <p className="mt-3 text-slate-300 leading-relaxed text-sm">{f.a}</p>
              </details>
            ))}
          </section>
        )}

        {relatedCountries.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">관련 국가 경비 상세</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relatedCountries.map((c) => c && (
                <Link
                  key={c.code}
                  href={`/country/${c.code.toLowerCase()}`}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 hover:border-indigo-500/50 transition-all flex items-center gap-3"
                >
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <p className="font-semibold text-slate-100">{c.nameKR}</p>
                    <p className="text-xs text-slate-500">여행 경비 상세</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 text-center bg-gradient-to-br from-indigo-900/30 to-slate-800/30 rounded-2xl p-8 border border-indigo-700/30">
          <p className="text-slate-300 mb-4">나만의 여행 경비를 직접 계산해보세요</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-indigo-900/40"
            >
              트립비에서 경비 계산하기 →
            </Link>
            <ShareButton
              title={guide.title}
              text={`${guide.title} - ${guide.description}`}
              url={url}
              className="!bg-slate-800 !hover:bg-slate-700 border border-slate-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
