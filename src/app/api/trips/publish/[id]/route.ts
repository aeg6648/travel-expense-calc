import { NextRequest, NextResponse } from 'next/server';
import { deletePublicTrip, getPublicTrip, isKvConfigured } from '@/lib/public-trips';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isKvConfigured()) {
    return NextResponse.json({ error: 'KV_NOT_CONFIGURED' }, { status: 503 });
  }
  const { id } = await params;
  const trip = await getPublicTrip(id);
  if (!trip) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json(trip);
}

// DELETE unpublishes the trip. Only the original author may delete.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isKvConfigured()) {
    return NextResponse.json({ error: 'KV_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({} as { userSub?: string }));
    const existing = await getPublicTrip(id);
    if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    if (body.userSub && body.userSub !== existing.authorSub) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
    await deletePublicTrip(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
