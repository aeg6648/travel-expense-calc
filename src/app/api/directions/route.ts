import { NextRequest, NextResponse } from 'next/server';

// Thin proxy over the Google Directions API. Given two stops and a
// transit mode, returns the fastest route's duration and summary so
// the client can annotate an inter-activity gap with real data.
// Env var: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (already used elsewhere).

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin'); // "lat,lng" or "place_id:..."
  const destination = searchParams.get('destination');
  const mode = (searchParams.get('mode') ?? 'transit') as 'transit' | 'driving' | 'walking' | 'bicycling';
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return NextResponse.json({ error: 'NO_API_KEY' }, { status: 503 });
  if (!origin || !destination) {
    return NextResponse.json({ error: 'INVALID_PARAMS' }, { status: 400 });
  }

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', destination);
  url.searchParams.set('mode', mode);
  url.searchParams.set('language', 'ko');
  url.searchParams.set('key', apiKey);
  // Transit-specific — prefer fewer transfers
  if (mode === 'transit') url.searchParams.set('transit_routing_preference', 'fewer_transfers');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'OK' || !data.routes?.[0]) {
      return NextResponse.json({ error: data.status ?? 'NO_ROUTE', routes: [] });
    }
    const route = data.routes[0];
    const leg = route.legs?.[0];
    if (!leg) return NextResponse.json({ error: 'NO_LEG', routes: [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transitSteps = (leg.steps ?? []).filter((s: any) => s.travel_mode === 'TRANSIT');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transitModes = transitSteps.map((s: any) =>
      s.transit_details?.line?.vehicle?.name || s.transit_details?.line?.vehicle?.type || ''
    ).filter(Boolean);
    return NextResponse.json({
      mode,
      durationText: leg.duration?.text as string | undefined,
      durationSeconds: leg.duration?.value as number | undefined,
      distanceText: leg.distance?.text as string | undefined,
      distanceMeters: leg.distance?.value as number | undefined,
      fareText: route.fare?.text as string | undefined,
      transitModes,
      summary: route.summary as string | undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: 'FETCH_FAILED', message: (e as Error).message }, { status: 500 });
  }
}
