import { NextRequest, NextResponse } from 'next/server';

const CATEGORY_QUERIES: Record<string, string[]> = {
  food: ['best restaurants local food', 'popular street food cafes'],
  activity: ['top tourist attractions sights', 'must visit places things to do'],
  accommodation: ['best hotels guesthouses'],
  transport: ['main train station public transport metro'],
  all: ['best restaurants', 'top tourist attractions', 'best hotels'],
};

const GOOGLE_TYPE_TO_OURS: Record<string, 'food' | 'activity' | 'accommodation' | 'transport'> = {
  restaurant: 'food', food: 'food', cafe: 'food', bakery: 'food',
  bar: 'food', meal_takeaway: 'food', meal_delivery: 'food',
  tourist_attraction: 'activity', museum: 'activity', park: 'activity',
  amusement_park: 'activity', art_gallery: 'activity', zoo: 'activity',
  stadium: 'activity', natural_feature: 'activity', night_club: 'activity',
  lodging: 'accommodation',
  train_station: 'transport', bus_station: 'transport',
  transit_station: 'transport', subway_station: 'transport', airport: 'transport',
};

function inferType(types: string[]): 'food' | 'activity' | 'accommodation' | 'transport' {
  for (const t of types) {
    if (GOOGLE_TYPE_TO_OURS[t]) return GOOGLE_TYPE_TO_OURS[t];
  }
  return 'activity';
}

// USD cost estimates per price_level (0-4)
const PRICE_USD = [0, 12, 28, 65, 140] as const;

const COUNTRY_CURRENCY: Record<string, { code: string; rate: number; krwRate: number }> = {
  JP: { code: 'JPY', rate: 150, krwRate: 9.5 },
  TH: { code: 'THB', rate: 35, krwRate: 40 },
  VN: { code: 'VND', rate: 25000, krwRate: 0.055 },
  TW: { code: 'TWD', rate: 32, krwRate: 43 },
  SG: { code: 'SGD', rate: 1.35, krwRate: 1020 },
  FR: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  ES: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  IT: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  DE: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  GR: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  PT: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  NL: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  AT: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  BE: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  TR: { code: 'USD', rate: 1, krwRate: 1380 },
  US: { code: 'USD', rate: 1, krwRate: 1380 },
  AU: { code: 'AUD', rate: 1.55, krwRate: 890 },
  HK: { code: 'HKD', rate: 7.83, krwRate: 176 },
  PH: { code: 'PHP', rate: 57, krwRate: 24 },
  ID: { code: 'IDR', rate: 16000, krwRate: 0.086 },
  GB: { code: 'GBP', rate: 0.79, krwRate: 1750 },
  CN: { code: 'CNY', rate: 7.25, krwRate: 190 },
  MX: { code: 'MXN', rate: 17, krwRate: 81 },
  IN: { code: 'INR', rate: 84, krwRate: 16 },
  CA: { code: 'CAD', rate: 1.36, krwRate: 1015 },
  NZ: { code: 'NZD', rate: 1.63, krwRate: 847 },
  MA: { code: 'MAD', rate: 10, krwRate: 138 },
  EG: { code: 'USD', rate: 1, krwRate: 1380 },
  ZA: { code: 'ZAR', rate: 18.5, krwRate: 75 },
  BR: { code: 'BRL', rate: 5, krwRate: 276 },
  AR: { code: 'USD', rate: 1, krwRate: 1380 },
  PE: { code: 'USD', rate: 1, krwRate: 1380 },
  CL: { code: 'USD', rate: 1, krwRate: 1380 },
  CO: { code: 'USD', rate: 1, krwRate: 1380 },
  CH: { code: 'CHF', rate: 0.9, krwRate: 1533 },
  SE: { code: 'SEK', rate: 10.5, krwRate: 131 },
  NO: { code: 'NOK', rate: 10.7, krwRate: 129 },
  DK: { code: 'DKK', rate: 6.9, krwRate: 200 },
  PL: { code: 'PLN', rate: 3.9, krwRate: 354 },
  CZ: { code: 'CZK', rate: 23, krwRate: 60 },
  HU: { code: 'HUF', rate: 360, krwRate: 3.8 },
  RO: { code: 'RON', rate: 4.6, krwRate: 300 },
  RS: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  HR: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  BA: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  ME: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  MK: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  SI: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  SK: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  LT: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  LV: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  EE: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  IS: { code: 'USD', rate: 1, krwRate: 1380 },
  IE: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  FI: { code: 'EUR', rate: 0.92, krwRate: 1500 },
  UA: { code: 'USD', rate: 1, krwRate: 1380 },
  RU: { code: 'USD', rate: 1, krwRate: 1380 },
  AE: { code: 'AED', rate: 3.67, krwRate: 376 },
  SA: { code: 'SAR', rate: 3.75, krwRate: 368 },
  IL: { code: 'USD', rate: 1, krwRate: 1380 },
  JO: { code: 'USD', rate: 1, krwRate: 1380 },
  QA: { code: 'QAR', rate: 3.64, krwRate: 379 },
  KW: { code: 'USD', rate: 1, krwRate: 1380 },
};

// Module-level server cache (cleared each deploy via revalidate)
const serverCache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const countryCode = searchParams.get('countryCode') ?? '';
  const city = searchParams.get('city') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const lang = searchParams.get('lang') ?? 'ko';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ places: [], error: 'NO_API_KEY' });
  if (!countryCode) return NextResponse.json({ places: [] });

  const cacheKey = `${countryCode}::${city}::${category}::${lang}`;
  const cached = serverCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const location = city || countryCode;
  const curInfo = COUNTRY_CURRENCY[countryCode] ?? { code: 'USD', rate: 1, krwRate: 1380 };
  const queries = CATEGORY_QUERIES[category] ?? CATEGORY_QUERIES.all;

  const results = await Promise.all(
    queries.map(async (q) => {
      const query = `${q} in ${location}`;
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.set('query', query);
      url.searchParams.set('language', lang);
      url.searchParams.set('key', apiKey);
      try {
        const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
        if (!res.ok) return [];
        const data = await res.json();
        return data.results ?? [];
      } catch { return []; }
    }),
  );

  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const places = results.flat().filter((p: any) => {
    if (!p.place_id || seen.has(p.place_id)) return false;
    seen.add(p.place_id);
    return true;
  }).slice(0, 60).map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const types: string[] = p.types ?? [];
    const type = inferType(types);
    const priceLevel: number | undefined = p.price_level;
    const costUSD = priceLevel !== undefined ? PRICE_USD[priceLevel] ?? PRICE_USD[1] : PRICE_USD[1];
    const costLocal = Math.round(costUSD * curInfo.rate);
    const costKRW = Math.round(costUSD * 1380);
    const address: string = p.formatted_address ?? '';
    return {
      id: p.place_id as string,
      name: p.name as string,
      nameLocal: p.name as string,
      type,
      city,
      costLocal,
      currency: curInfo.code,
      costKRW,
      description: address.replace(/^(.+?),\s*.+?,.*$/, '$1'),
      rating: p.rating as number | undefined,
      placeId: p.place_id as string,
    };
  });

  const payload = { places };
  serverCache.set(cacheKey, { data: payload, ts: Date.now() });
  return NextResponse.json(payload);
}
