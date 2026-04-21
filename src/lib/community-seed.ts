// Seed posts generated from CELEBRITY_DESTINATIONS, rewritten in the
// voice of anonymous travelers with playful nicknames. Used by the
// admin-only "시드" button to populate the community feed with real
// sample itineraries when it's empty.

import { CELEBRITY_DESTINATIONS } from '@/lib/celebrity-destinations';
import type { Activity, Trip } from '@/components/ItineraryManager';
import type { CommunityPost } from '@/components/Community';

// Country code → default activity currency for cost estimates.
const COUNTRY_CURRENCY: Record<string, string> = {
  JP: 'JPY', KR: 'KRW', TH: 'THB', VN: 'VND', TW: 'TWD', SG: 'SGD',
  HK: 'HKD', CN: 'CNY', PH: 'PHP', ID: 'IDR', IN: 'INR', MY: 'MYR',
  FR: 'EUR', ES: 'EUR', IT: 'EUR', DE: 'EUR', GR: 'EUR', PT: 'EUR',
  NL: 'EUR', AT: 'EUR', BE: 'EUR', CH: 'CHF', GB: 'GBP',
  US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  TR: 'TRY', AE: 'AED', MA: 'MAD', EG: 'EGP',
  MX: 'MXN', BR: 'BRL', CU: 'USD', IS: 'USD',
};

// Playful Korean nicknames paired to each celebrity seed so repeat seeds
// keep the same voice. Keyed by CelebrityDestination.id.
const NICKNAMES: Record<string, string> = {
  'jennie-santorini':    '산토리니홀릭',
  'rm-berlin':           '미테갤러리러',
  'cha-kyoto':           '기온새벽요정',
  'aespa-interlaken':    '융프라우덕후',
  'iu-positano':         '아말피드라이브',
  'jisoo-paris':         '마레카페러',
  'kwaktube-lisbon':     '28번트램장인',
  'hani-iceland':        '오로라헌터',
  'chim-dubai':          '사막파자마러',
  'ana-bali':            '우붓요가소녀',
  'songkang-tokyo':      '시부야스카이러',
  'wonyoung-paris':      '몽마르뜨산책자',
  'gcoo-newyork':        '브루클린새벽러',
  'tae-bangkok':         '루프탑러버',
  'lisa-phuket':         '마야베이첫배',
  'winter-hongkong':     '피크트램막차',
  'hyun-marrakech':      '메디나길치',
  'joo-queenstown':      '번지데뷔러',
  'yumi-havana':         '살사초보러',
  'tiffany-seoul-day':   '부산원데이러',
};

// Intro body text templates keyed by vibe tag.
const BODY_TEMPLATES: { tag: string; body: string }[] = [
  { tag: '📸 화보', body: '사진 찍으러 갔다가 진짜 반해서 돌아옴. 새벽~이른 아침이 포인트 ⭐️\n\n' },
  { tag: '🎨 아트', body: '갤러리 호핑 위주로 짰는데 로컬 밥집이 생각보다 훨씬 좋았어요.\n\n' },
  { tag: '🎬 콘텐츠', body: '브이로그처럼 돌려봤는데 루트가 편해서 다시 가고 싶을 정도.\n\n' },
  { tag: '🎵 MV', body: '풍경이 말도 안 돼요. 트레킹 체력 좀 필요했지만 후회 없음.\n\n' },
  { tag: '👗 패션', body: '사복 기준으로 포토존 위주. 동선 짧고 실패가 없어요.\n\n' },
  { tag: '🎬 유튜브', body: '예산 타이트하게 잡고 다녔는데 꽤 알찼어요. 트램 타는 거 자체가 관광.\n\n' },
  { tag: '🌿 리트리트', body: '아침은 요가 / 점심부터 돌아다니기 루틴으로. 체력 무리 없이 힐링.\n\n' },
  { tag: '🎬 예능', body: '친구들이랑 가면 진짜 재밌게 챌린지 가능한 루트. 도전 각\n\n' },
  { tag: '🎵 음악', body: '재즈바 위주로 도는 야행성 루트. 올드카 렌탈이 하이라이트.\n\n' },
];

function pickBodyIntro(tag?: string): string {
  if (!tag) return '';
  const match = BODY_TEMPLATES.find(t => tag.includes(t.tag.replace(/^\S+\s/, '')) || tag.includes(t.tag));
  return match?.body ?? '';
}

// ID generator — deterministic per celeb so re-seeding overwrites in place
// instead of duplicating in Redis.
const stableId = (prefix: string, seed: string) => `${prefix}-${seed}`;

function startDateOffset(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function endDateFromStart(start: string, nights: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + nights);
  return d.toISOString().split('T')[0];
}

// Crude cost estimate per spot type, in the trip currency.
const SPOT_COST_HINT: Record<string, Record<string, number>> = {
  JPY: { activity: 2500, food: 1500, accommodation: 0, transport: 0 },
  EUR: { activity: 20, food: 18, accommodation: 0, transport: 0 },
  USD: { activity: 25, food: 20, accommodation: 0, transport: 0 },
  GBP: { activity: 18, food: 16, accommodation: 0, transport: 0 },
  THB: { activity: 500, food: 200, accommodation: 0, transport: 0 },
  VND: { activity: 200000, food: 80000, accommodation: 0, transport: 0 },
  TWD: { activity: 500, food: 250, accommodation: 0, transport: 0 },
  HKD: { activity: 180, food: 120, accommodation: 0, transport: 0 },
  SGD: { activity: 30, food: 20, accommodation: 0, transport: 0 },
  AED: { activity: 150, food: 80, accommodation: 0, transport: 0 },
  TRY: { activity: 450, food: 220, accommodation: 0, transport: 0 },
  MAD: { activity: 150, food: 80, accommodation: 0, transport: 0 },
  CHF: { activity: 35, food: 25, accommodation: 0, transport: 0 },
  NZD: { activity: 50, food: 25, accommodation: 0, transport: 0 },
  KRW: { activity: 25000, food: 15000, accommodation: 0, transport: 0 },
  MXN: { activity: 300, food: 200, accommodation: 0, transport: 0 },
};

function costFor(type: Activity['type'], currency: string): number {
  const hint = SPOT_COST_HINT[currency] ?? SPOT_COST_HINT.USD;
  return hint[type] ?? hint.activity ?? 0;
}

function activityTypeFromNote(note: string): Activity['type'] {
  const s = note.toLowerCase();
  if (/카페|레스토랑|밥|식당|요거트|커리|메뉴|디너|브런치|lunch|dinner|taco|bar|와인|쑤끼|탁자/i.test(note)) return 'food';
  if (/호텔|스위트|리조트|료칸|캠프|숙소|hotel|resort|ryokan|lodge/i.test(note)) return 'accommodation';
  if (/트램|기차|역|공항|버스|지하철|이동|국제선|국내선|tram|metro|bus|train|station|airport|flight|비행|페리|배/i.test(note)) return 'transport';
  if (!s) return 'activity';
  return 'activity';
}

function buildPostsForSeed(admin: { sub: string; name: string; picture?: string; email?: string }): CommunityPost[] {
  const posts: CommunityPost[] = [];

  CELEBRITY_DESTINATIONS.forEach((celeb, i) => {
    const currency = COUNTRY_CURRENCY[celeb.countryCode ?? ''] ?? 'USD';
    const spots = celeb.spots;
    if (spots.length === 0) return;

    // Distribute spots across days: try to match celeb.duration when it
    // parses, else default to 3 spots per day.
    const days = Math.max(2, Math.min(8, Math.ceil(spots.length / 2.5)));
    const activities: Activity[] = spots.map((spot, si) => {
      const day = Math.min(days, Math.floor((si / spots.length) * days) + 1);
      const timeBase = 10 + (si % 3) * 3; // 10:00, 13:00, 16:00 rotation
      const time = `${String(timeBase).padStart(2, '0')}:00`;
      const type = activityTypeFromNote(spot.note);
      const cost = costFor(type, currency);
      return {
        id: `${celeb.id}-spot-${si}`,
        day,
        time,
        title: spot.name,
        location: spot.name,
        rating: 4.6,
        cost,
        currency,
        type,
        notes: spot.note,
        order: si,
      } as Activity;
    });

    const start = startDateOffset(21 + i * 3);
    const end = endDateFromStart(start, days);
    const tripId = stableId('seed-trip', celeb.id);

    const trip: Trip = {
      id: tripId,
      name: `${celeb.city.split(',')[0]} ${days}박 ${celeb.style ? celeb.style.split(' ')[0] : '여행'}`,
      countryCode: celeb.countryCode ?? 'US',
      startDate: start,
      endDate: end,
      budget: 0,
      currency,
      notes: celeb.tips?.join(' · ') ?? '',
      activities,
      createdAt: new Date().toISOString(),
      theme: { kind: 'photo', url: celeb.photo },
    };

    const postId = stableId('seed-post', celeb.id);
    const nickname = NICKNAMES[celeb.id] ?? '여행러';
    const bodyIntro = pickBodyIntro(celeb.tag);
    const body =
      `${bodyIntro}` +
      `📍 ${celeb.city}\n` +
      `🗓 ${days}박 ${days + 1}일\n` +
      `${celeb.style ? `${celeb.style}\n` : ''}` +
      `\n[이 사람이 다녀왔다고 함: ${celeb.person}] 을 보고 거의 따라 다녀왔어요. ${celeb.summary}\n` +
      `\n팁:\n${(celeb.tips ?? []).map(t => `- ${t}`).join('\n')}`;

    // Use a deterministic author sub ("seed-nick") so admin-seeded posts
    // are distinct from real user posts. Admin email is still attached
    // so the admin can delete any of them from the admin UI.
    posts.push({
      id: postId,
      authorSub: `seed:${celeb.id}`,
      authorName: nickname,
      anonymous: true,
      authorEmail: admin.email,
      countryCode: celeb.countryCode,
      title: `${celeb.city.split(',')[0]} 따라가기 — ${nickname}의 ${days}박 루트`,
      body,
      likes: [],
      comments: [],
      createdAt: new Date(Date.now() - (CELEBRITY_DESTINATIONS.length - i) * 3600_000).toISOString(),
      sharedTrip: trip,
      kind: 'post',
    });
  });

  return posts;
}

export { buildPostsForSeed };
