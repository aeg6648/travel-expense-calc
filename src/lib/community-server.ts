// Server-side storage for community posts.
//
// Supports either:
//   REDIS_URL      — TCP Redis connection string (Redis Cloud, Upstash TCP, etc.)
//
// The API route calls these helpers from a Node runtime (default for
// app/api routes), so a TCP client like ioredis works fine.
//
// Auth is NOT verified here — the client passes authorSub in the body.
// Upgrade path: verify a signed ID token on write endpoints before trusting
// author claims.

import Redis from 'ioredis';
import type { CommunityPost } from '@/components/Community';

const KEY_INDEX = 'community:posts:ids';
const key = (id: string) => `community:posts:${id}`;

let clientCache: Redis | null = null;
function getClient(): Redis | null {
  if (clientCache) return clientCache;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  clientCache = new Redis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  });
  return clientCache;
}

export function isKvConfigured(): boolean {
  return !!process.env.REDIS_URL;
}

// Values are stored as JSON strings because ioredis returns strings.
const encode = (v: unknown) => JSON.stringify(v);
const decode = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
};

export async function listPosts(): Promise<CommunityPost[]> {
  const r = getClient();
  if (!r) return [];
  const ids = await r.zrange(KEY_INDEX, 0, -1, 'REV');
  if (!ids.length) return [];
  const raws = await r.mget(...ids.map(key));
  return raws.map(v => decode<CommunityPost>(v)).filter((p): p is CommunityPost => p !== null);
}

export async function createPost(post: CommunityPost): Promise<void> {
  const r = getClient();
  if (!r) throw new Error('Redis not configured');
  await r.set(key(post.id), encode(post));
  await r.zadd(KEY_INDEX, new Date(post.createdAt).getTime(), post.id);
}

export async function getPost(id: string): Promise<CommunityPost | null> {
  const r = getClient();
  if (!r) return null;
  return decode<CommunityPost>(await r.get(key(id)));
}

export async function updatePost(post: CommunityPost): Promise<void> {
  const r = getClient();
  if (!r) throw new Error('Redis not configured');
  await r.set(key(post.id), encode(post));
}

export async function deletePost(id: string): Promise<void> {
  const r = getClient();
  if (!r) throw new Error('Redis not configured');
  await r.del(key(id));
  await r.zrem(KEY_INDEX, id);
}
