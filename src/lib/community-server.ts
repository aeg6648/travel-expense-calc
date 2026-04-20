// Server-side storage for community posts, backed by Upstash Redis
// (Vercel Marketplace → Upstash for Redis, or any Upstash Redis instance).
//
// This module picks whichever pair of env vars is present:
//   Native/legacy:   KV_REST_API_URL        + KV_REST_API_TOKEN
//   Upstash direct:  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Vercel now provisions the UPSTASH_* names when you install the Upstash
// integration from Storage → Marketplace → Upstash for Redis.
//
// Auth is NOT verified here — the client passes authorSub in the body.
// Upgrade path: verify a signed ID token on write endpoints before trusting
// author claims.

import { createClient, type VercelKV } from '@vercel/kv';
import type { CommunityPost } from '@/components/Community';

const KEY_INDEX = 'community:posts:ids';
const key = (id: string) => `community:posts:${id}`;

function pickEnv(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

let clientCache: VercelKV | null = null;
function getClient(): VercelKV | null {
  if (clientCache) return clientCache;
  const env = pickEnv();
  if (!env) return null;
  clientCache = createClient({ url: env.url, token: env.token });
  return clientCache;
}

export function isKvConfigured(): boolean {
  return pickEnv() !== null;
}

export async function listPosts(): Promise<CommunityPost[]> {
  const kv = getClient();
  if (!kv) return [];
  const ids = await kv.zrange<string[]>(KEY_INDEX, 0, -1, { rev: true });
  if (!ids || ids.length === 0) return [];
  const posts = await kv.mget<(CommunityPost | null)[]>(...ids.map(key));
  return posts.filter((p): p is CommunityPost => p !== null);
}

export async function createPost(post: CommunityPost): Promise<void> {
  const kv = getClient();
  if (!kv) throw new Error('KV not configured');
  await kv.set(key(post.id), post);
  await kv.zadd(KEY_INDEX, { score: new Date(post.createdAt).getTime(), member: post.id });
}

export async function getPost(id: string): Promise<CommunityPost | null> {
  const kv = getClient();
  if (!kv) return null;
  return (await kv.get<CommunityPost>(key(id))) ?? null;
}

export async function updatePost(post: CommunityPost): Promise<void> {
  const kv = getClient();
  if (!kv) throw new Error('KV not configured');
  await kv.set(key(post.id), post);
}

export async function deletePost(id: string): Promise<void> {
  const kv = getClient();
  if (!kv) throw new Error('KV not configured');
  await kv.del(key(id));
  await kv.zrem(KEY_INDEX, id);
}
