import { COUNTRIES } from '@/lib/travel-data';

const SITE_URL = 'https://www.tripbudget.my';
const SITE_TITLE = '트립비 | Trip-B - 국가별 여행 경비 계산기';
const SITE_DESC = '호주·일본·태국·싱가포르·베트남 등 국가별 여행 경비를 블로그 후기 기반으로 실시간 계산';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const now = new Date().toUTCString();

  const items = COUNTRIES.map((c) => {
    const url = `${SITE_URL}/country/${c.code.toLowerCase()}`;
    const title = `${c.nameKR} 여행 경비 완전 가이드 2026`;
    const desc = `${c.nameKR} ${c.defaultDuration}박 기준 알뜰 ₩${c.costs.budget.avg.toLocaleString()} ~ 프리미엄 ₩${c.costs.luxury.avg.toLocaleString()}. 항공권 ₩${c.flight.basePriceKRW.toLocaleString()}~, 숙박·식비·교통비 상세 분석.`;
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${now}</pubDate>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
