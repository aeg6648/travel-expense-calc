import { NextRequest, NextResponse } from 'next/server';
import { createPost, deletePost, isKvConfigured } from '@/lib/community-server';
import { buildPostsForSeed } from '@/lib/community-seed';
import { isAdminEmail } from '@/lib/admin';

// POST /api/community/seed
// Body: { email, sub, name, picture?, replace? }
// Admin-only. Inserts CELEBRITY_DESTINATIONS-derived community posts
// (deterministic IDs so re-running is idempotent). When `replace: true`
// is set, existing seed posts with the same IDs are deleted first.
export async function POST(req: NextRequest) {
  if (!isKvConfigured()) {
    return NextResponse.json({ error: 'KV_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const body = await req.json();
    if (!isAdminEmail(body.email)) {
      return NextResponse.json({ error: 'NOT_ADMIN' }, { status: 403 });
    }
    const posts = buildPostsForSeed({
      sub: body.sub ?? 'admin',
      name: body.name ?? '관리자',
      picture: body.picture,
      email: body.email,
    });

    if (body.replace) {
      for (const p of posts) {
        try { await deletePost(p.id); } catch { /* ignore */ }
      }
    }

    let inserted = 0;
    for (const p of posts) {
      try { await createPost(p); inserted++; } catch { /* skip on failure */ }
    }

    return NextResponse.json({ ok: true, inserted, total: posts.length });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
