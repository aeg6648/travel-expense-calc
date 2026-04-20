import { NextRequest, NextResponse } from 'next/server';
import { deletePost, getPost, updatePost, isKvConfigured } from '@/lib/community-server';

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
    const existing = await getPost(id);
    if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    // Trust-but-verify: client sends userSub; only author can delete.
    if (body.userSub && body.userSub !== existing.authorSub) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: (e as Error).message },
      { status: 500 },
    );
  }
}

// PATCH handles like toggling and comment appending.
// Body shape:
//   { type: 'toggleLike', userSub: string }
//   { type: 'addComment', comment: CommunityComment }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isKvConfigured()) {
    return NextResponse.json({ error: 'KV_NOT_CONFIGURED' }, { status: 503 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const existing = await getPost(id);
    if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    if (body.type === 'toggleLike') {
      if (!body.userSub) return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
      const idx = existing.likes.indexOf(body.userSub);
      if (idx >= 0) existing.likes.splice(idx, 1);
      else existing.likes.push(body.userSub);
    } else if (body.type === 'addComment') {
      if (!body.comment?.id || !body.comment?.authorSub) {
        return NextResponse.json({ error: 'INVALID_COMMENT' }, { status: 400 });
      }
      existing.comments.push(body.comment);
    } else {
      return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
    }

    await updatePost(existing);
    return NextResponse.json({ post: existing });
  } catch (e) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: (e as Error).message },
      { status: 500 },
    );
  }
}
