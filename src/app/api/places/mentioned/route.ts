import { NextRequest, NextResponse } from 'next/server';

// Common Korean place-name suffixes that blog posts use.
// Matches 2-12-char prefix followed by one of these suffixes.
const PLACE_SUFFIX = [
  '궁', '성', '타워', '공원', '박물관', '미술관', '사원', '사찰',
  '신사', '역', '거리', '골목', '시장', '광장', '섬', '해변',
  '호수', '산', '폭포', '전망대', '카페거리', '리조트',
  '테마파크', '놀이공원', '정원', '마을', '항', '포구', '대교',
  '다리', '성당', '교회', '궁전', '요새', '유적', '동굴', '온천',
  '해수욕장', '해안', '고원', '마켓', '드림', '월드',
];

const SUFFIX_RE = new RegExp(
  `([가-힣A-Za-z][가-힣A-Za-z0-9\\s]{1,15}?(?:${PLACE_SUFFIX.join('|')}))`,
  'g',
);

// Ignore uninformative hits ("맛집거리" = "tasty street", "상가거리", etc.)
const STOP_TOKENS = new Set([
  '호텔', '리조트', '맛집거리', '먹거리', '쇼핑거리', '관광거리',
  '번화가', '명동거리', '관광', '여행', '숙박', '호텔이',
]);

interface MentionedPlace {
  name: string;
  count: number;
}

const cache = new Map<string, { data: MentionedPlace[]; ts: number }>();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || '';
  const city = searchParams.get('city') || '';
  if (!country) return NextResponse.json({ places: [] });

  const cacheKey = `${country}::${city}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return NextResponse.json({ places: hit.data });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ places: [], error: 'NAVER_API_KEY_MISSING' });
  }

  const base = city ? `${city}` : `${country}`;
  const queries = [
    `${base} 여행 명소 추천`,
    `${base} 가볼만한곳`,
    `${base} 여행 코스`,
  ];

  const allTexts: string[] = [];
  await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await fetch(
          `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(q)}&display=30&sort=sim`,
          {
            headers: {
              'X-Naver-Client-Id': clientId,
              'X-Naver-Client-Secret': clientSecret,
            },
            next: { revalidate: 3600 },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        for (const item of data.items || []) {
          const stripped = `${item.title ?? ''} ${item.description ?? ''}`.replace(/<[^>]+>/g, '');
          allTexts.push(stripped);
        }
      } catch {
        /* ignore */
      }
    }),
  );

  const counts = new Map<string, number>();
  for (const text of allTexts) {
    const matches = text.matchAll(SUFFIX_RE);
    for (const m of matches) {
      const raw = m[1].trim().replace(/\s+/g, '');
      if (raw.length < 2 || raw.length > 16) continue;
      if (STOP_TOKENS.has(raw)) continue;
      // Drop tokens that are just the suffix alone
      if (PLACE_SUFFIX.includes(raw)) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  }

  const places: MentionedPlace[] = [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  cache.set(cacheKey, { data: places, ts: Date.now() });
  return NextResponse.json({ places });
}
