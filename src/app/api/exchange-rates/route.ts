import { NextResponse } from 'next/server';

let cache: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL = 3600000; // 1 hour

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ rates: cache.rates, cached: true });
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    cache = { rates: data.rates, timestamp: Date.now() };
    return NextResponse.json({ rates: data.rates, cached: false });
  } catch {
    // Fallback rates (approximate 2025 values)
    const fallbackRates: Record<string, number> = {
      KRW: 1450, JPY: 151, THB: 35, VND: 25400,
      TWD: 32, SGD: 1.34, PHP: 58, IDR: 16000,
      HKD: 7.78, EUR: 0.91, TRY: 37, AUD: 1.55,
      USD: 1,
    };
    return NextResponse.json({ rates: fallbackRates, cached: false, fallback: true });
  }
}
