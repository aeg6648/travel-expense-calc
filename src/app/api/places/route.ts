import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const language = searchParams.get('lang') || 'ko';

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ places: [], error: 'NO_API_KEY' });
  }
  if (!query.trim()) {
    return NextResponse.json({ places: [] });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=${language}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Places API error');

    const data = await res.json();
    const places = (data.results || []).slice(0, 6).map((p: Record<string, unknown>) => ({
      placeId: p.place_id,
      name: p.name,
      address: (p.formatted_address as string)?.replace(/^(.+?,\s*.+?),.*$/, '$1') ?? '',
      rating: p.rating,
      userRatingsTotal: p.user_ratings_total,
      types: (p.types as string[] | undefined)?.slice(0, 3) ?? [],
      photoRef: ((p.photos as Record<string, unknown>[] | undefined)?.[0]?.photo_reference as string) ?? null,
      location: (p.geometry as Record<string, unknown> | undefined)?.location ?? null,
    }));

    return NextResponse.json({ places });
  } catch {
    return NextResponse.json({ places: [], error: 'FETCH_FAILED' });
  }
}
