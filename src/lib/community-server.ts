// Server-side Vercel KV storage for community posts.
//
// Requires these env vars in Vercel → Settings → Environment Variables:
//   KV_REST_API_URL
//   KV_REST_API_TOKEN
// (Provisioned automatically when you add a Vercel KV / Upstash integration
//  to the project.)
//
// Auth is NOT verified here — the client passes authorSub in the body.
// Upgrade path: verify a signed ID token on write endpoints before trusting
// author claims.

import { kv } from '@vercel/kv';
import type { CommunityPost } from '@/components/Community';

const KEY_INDEX = 'community:posts:ids';
const key = (id: string) => `community:posts:${id}`;

export function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function listPosts(): Promise<CommunityPost[]> {
  const ids = await kv.zrange<string[]>(KEY_INDEX, 0, -1, { rev: true });
  if (!ids || ids.length === 0) return [];
  const posts = await kv.mget<(CommunityPost | null)[]>(...ids.map(key));
  return posts.filter((p): p is CommunityPost => p !== null);
}

export async function createPost(post: CommunityPost): Promise<void> {
  await kv.set(key(post.id), post);
  await kv.zadd(KEY_INDEX, { score: new Date(post.createdAt).getTime(), member: post.id });
}

export async function getPost(id: string): Promise<CommunityPost | null> {
  return (await kv.get<CommunityPost>(key(id))) ?? null;
}

export async function updatePost(post: CommunityPost): Promise<void> {
  await kv.set(key(post.id), post);
}

export async function deletePost(id: string): Promise<void> {
  await kv.del(key(id));
  await kv.zrem(KEY_INDEX, id);
}
