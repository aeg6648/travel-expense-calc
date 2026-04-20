import { NextRequest, NextResponse } from 'next/server';
import { isKvConfigured, putPublicTrip, type PublicTrip } from '@/lib/public-trips';

// POST /api/trips/publish
// Body: { trip, authorSub, authorName, authorPicture?, anonymous? }
// Stores the trip snapshot so /trip/[id] can serve a read-only view.
export async function POST(req: NextRequest) {
  if (!isKvConfigured()) {
    return NextResponse.json({ error: 'KV_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const body = await req.json();
    if (!body?.trip?.id || !body?.authorSub || !body?.authorName) {
      return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const payload: PublicTrip = {
      id: body.trip.id,
      trip: body.trip,
      authorSub: body.authorSub,
      authorName: body.anonymous ? (body.authorName || '익명의 여행자') : body.authorName,
      authorPicture: body.anonymous ? undefined : body.authorPicture,
      anonymous: !!body.anonymous,
      publishedAt: now,
      updatedAt: now,
    };
    await putPublicTrip(payload);
    return NextResponse.json({ ok: true, id: payload.id, url: `/trip/${payload.id}` });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
