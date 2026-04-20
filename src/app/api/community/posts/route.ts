import { NextRequest, NextResponse } from 'next/server';
import { createPost, listPosts, isKvConfigured } from '@/lib/community-server';

export async function GET() {
  if (!isKvConfigured()) {
    return NextResponse.json(
      { error: 'KV_NOT_CONFIGURED', posts: [] },
      { status: 503 },
    );
  }
  try {
    const posts = await listPosts();
    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: (e as Error).message, posts: [] },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isKvConfigured()) {
    return NextResponse.json({ error: 'KV_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const body = await req.json();
    if (!body?.id || !body?.authorSub || !body?.title || !body?.body) {
      return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
    }
    await createPost(body);
    return NextResponse.json({ ok: true, post: body });
  } catch (e) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: (e as Error).message },
      { status: 500 },
    );
  }
}
