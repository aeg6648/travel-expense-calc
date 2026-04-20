// Vibes ("무드") → country code subsets. Clicking a mood pill in the
// hero filters the country grid down to these destinations.

export type VibeId = 'food' | 'art' | 'activity' | 'photogenic' | 'healing' | 'night' | 'shopping' | 'roadtrip';

export interface Vibe {
  id: VibeId;
  emoji: string;
  label: string;
  gradient: { from: string; to: string };
  // Countries that fit this mood, roughly ranked by how well they match.
  countries: string[];
}

export const VIBES: Vibe[] = [
  {
    id: 'food', emoji: '🍜', label: '로컬 미식',
    gradient: { from: 'from-amber-500/35', to: 'to-rose-500/25' },
    countries: ['JP', 'TH', 'VN', 'TW', 'HK', 'IT', 'FR', 'ES', 'MY', 'MX'],
  },
  {
    id: 'art', emoji: '🎨', label: '예술·갤러리',
    gradient: { from: 'from-violet-500/35', to: 'to-indigo-500/25' },
    countries: ['FR', 'IT', 'ES', 'DE', 'GB', 'NL', 'GR', 'CZ', 'US'],
  },
  {
    id: 'activity', emoji: '🏄', label: '액티비티',
    gradient: { from: 'from-cyan-500/35', to: 'to-emerald-500/25' },
    countries: ['NZ', 'AU', 'ID', 'PH', 'CH', 'NP', 'MN', 'HR'],
  },
  {
    id: 'photogenic', emoji: '📸', label: '포토제닉',
    gradient: { from: 'from-pink-500/35', to: 'to-fuchsia-500/25' },
    countries: ['GR', 'TR', 'JP', 'MA', 'EG', 'IT', 'CH', 'HR', 'MX'],
  },
  {
    id: 'healing', emoji: '🌿', label: '힐링',
    gradient: { from: 'from-emerald-500/35', to: 'to-teal-500/25' },
    countries: ['ID', 'TH', 'GR', 'CH', 'NZ', 'NP', 'VN', 'JP'],
  },
  {
    id: 'night', emoji: '🌃', label: '야경·나이트',
    gradient: { from: 'from-slate-500/40', to: 'to-indigo-500/25' },
    countries: ['JP', 'HK', 'TH', 'SG', 'TW', 'US', 'AE'],
  },
  {
    id: 'shopping', emoji: '🛍️', label: '쇼핑 트립',
    gradient: { from: 'from-pink-500/30', to: 'to-amber-500/25' },
    countries: ['HK', 'JP', 'SG', 'AE', 'TH', 'IT', 'FR', 'US'],
  },
  {
    id: 'roadtrip', emoji: '⛺', label: '로드트립',
    gradient: { from: 'from-orange-500/35', to: 'to-red-500/25' },
    countries: ['US', 'AU', 'NZ', 'IT', 'CH', 'CA', 'MX', 'HR'],
  },
];

export function getVibe(id: VibeId | null | undefined): Vibe | undefined {
  if (!id) return undefined;
  return VIBES.find(v => v.id === id);
}
