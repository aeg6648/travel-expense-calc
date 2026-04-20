// KV storage for publicly-shared trip snapshots. Same Redis instance as
// community; different key namespace.

import Redis from 'ioredis';
import type { Trip } from '@/components/ItineraryManager';

export interface PublicTrip {
  id: string;
  trip: Trip;
  authorSub: string;
  authorName: string;
  authorPicture?: string;
  anonymous?: boolean;
  publishedAt: string;
  updatedAt: string;
}

let clientCache: Redis | null = null;
function getClient(): Redis | null {
  if (clientCache) return clientCache;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  clientCache = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 2 });
  return clientCache;
}

export function isKvConfigured(): boolean {
  return !!process.env.REDIS_URL;
}

const key = (id: string) => `trip:public:${id}`;

export async function getPublicTrip(id: string): Promise<PublicTrip | null> {
  const r = getClient();
  if (!r) return null;
  try {
    const raw = await r.get(key(id));
    if (!raw) return null;
    return JSON.parse(raw) as PublicTrip;
  } catch { return null; }
}

export async function putPublicTrip(p: PublicTrip): Promise<void> {
  const r = getClient();
  if (!r) throw new Error('Redis not configured');
  await r.set(key(p.id), JSON.stringify(p));
}

export async function deletePublicTrip(id: string): Promise<void> {
  const r = getClient();
  if (!r) throw new Error('Redis not configured');
  await r.del(key(id));
}
