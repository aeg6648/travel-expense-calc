export function formatKRW(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(1)}천만원`;
  }
  if (amount >= 1000000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function formatKRWShort(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}천만`;
  if (amount >= 1000000) return `${Math.round(amount / 10000)}만`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}만`;
  return `${amount.toLocaleString()}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return dateToString(d);
}

export function getSeasonLabel(month: number): string {
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

export const CATEGORY_COLORS: Record<string, string> = {
  flight: '#6366f1',
  accommodation: '#8b5cf6',
  food: '#f59e0b',
  localTransport: '#10b981',
  activities: '#ef4444',
  shopping: '#ec4899',
};

export const CATEGORY_LABELS: Record<string, string> = {
  flight: '항공권',
  accommodation: '숙박',
  food: '식비',
  localTransport: '현지교통',
  activities: '액티비티',
  shopping: '쇼핑',
};

export const STYLE_LABELS: Record<string, string> = {
  budget: '알뜰여행',
  standard: '일반여행',
  luxury: '프리미엄',
};

export const STYLE_COLORS: Record<string, string> = {
  budget: '#10b981',
  standard: '#6366f1',
  luxury: '#f59e0b',
};

export interface ClassifiedBlogEntry {
  year: number;
  source: string;
  city?: string;
  duration: number;
  totalKRW: number;
  perNight: number;
  normalizedKRW: number;
  derivedStyle: 'budget' | 'standard' | 'luxury';
  breakdown: object;
}

/**
 * 블로그 데이터를 1박 지출 기준으로 정렬해 하위33%=알뜰, 중간=일반, 상위33%=프리미엄으로 자동 분류.
 * style 필드를 무시하고 실제 지출액만 기준으로 삼는다.
 */
export function classifyBlogData(
  blogData: { year: number; source: string; duration: number; totalKRW: number; breakdown: object }[],
  targetDuration: number,
): ClassifiedBlogEntry[] {
  if (blogData.length === 0) return [];

  const withPerNight = blogData.map(d => ({
    ...d,
    perNight: d.totalKRW / d.duration,
    normalizedKRW: Math.round(d.totalKRW * (targetDuration / d.duration)),
  }));

  const sorted = [...withPerNight].sort((a, b) => a.perNight - b.perNight);
  const n = sorted.length;
  const p33 = sorted[Math.max(0, Math.floor(n * 0.33))].perNight;
  const p66 = sorted[Math.max(0, Math.floor(n * 0.66))].perNight;

  return withPerNight.map(d => ({
    ...d,
    derivedStyle: d.perNight <= p33 ? 'budget' : d.perNight <= p66 ? 'standard' : 'luxury',
  }));
}
