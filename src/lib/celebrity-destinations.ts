// Curated celebrity/creator travel spots. Photos are Unsplash CDN URLs.
// Hand-maintained for now; can be swapped for a real feed later.
// Keep descriptions tight (one line) — they render inside a narrow sidebar.

export interface CelebrityDestination {
  id: string;
  person: string;      // celebrity / creator name
  city: string;        // readable location "도시, 나라"
  photo: string;       // wide landscape Unsplash URL
  caption: string;     // one-line context
  tag?: string;        // optional pill — '🎬 영화', '📸 화보', etc.
}

export const CELEBRITY_DESTINATIONS: CelebrityDestination[] = [
  {
    id: 'bts-santorini',
    person: '제니',
    city: '산토리니, 그리스',
    photo:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&q=80&auto=format&fit=crop',
    caption: '화보 촬영으로 다녀온 에게해의 석양',
    tag: '📸 화보',
  },
  {
    id: 'rm-berlin',
    person: 'RM',
    city: '베를린, 독일',
    photo:
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=900&q=80&auto=format&fit=crop',
    caption: '개인 투어 — 박물관섬과 미테 지구의 갤러리',
    tag: '🎨 아트',
  },
  {
    id: 'cha-kyoto',
    person: '차은우',
    city: '교토, 일본',
    photo:
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=900&q=80&auto=format&fit=crop',
    caption: '아라시야마 대나무숲·기온 거리 브이로그',
    tag: '🎬 콘텐츠',
  },
  {
    id: 'aespa-interlaken',
    person: 'aespa',
    city: '인터라켄, 스위스',
    photo:
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=900&q=80&auto=format&fit=crop',
    caption: '알프스 풍경을 배경으로 한 뮤직비디오 로케',
    tag: '🎵 MV',
  },
  {
    id: 'iu-positano',
    person: '아이유',
    city: '포지타노, 이탈리아',
    photo:
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80&auto=format&fit=crop',
    caption: '아말피 해안 드라이브와 레몬 카페',
    tag: '📸 화보',
  },
  {
    id: 'jennie-paris',
    person: '블랙핑크 지수',
    city: '파리, 프랑스',
    photo:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80&auto=format&fit=crop',
    caption: '디올 하우스 투어와 마레 지구 산책',
    tag: '👗 패션',
  },
  {
    id: 'vlogger-lisbon',
    person: '곽튜브',
    city: '리스본, 포르투갈',
    photo:
      'https://images.unsplash.com/photo-1513735539099-cf6e5c329326?w=900&q=80&auto=format&fit=crop',
    caption: '알파마 언덕·28번 트램 현지 유튜브',
    tag: '🎬 유튜브',
  },
  {
    id: 'newjeans-iceland',
    person: 'NewJeans 하니',
    city: '레이캬비크, 아이슬란드',
    photo:
      'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=900&q=80&auto=format&fit=crop',
    caption: '오로라 · 블루라군 화보 로드트립',
    tag: '📸 화보',
  },
  {
    id: 'streamer-dubai',
    person: '침착맨',
    city: '두바이, UAE',
    photo:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80&auto=format&fit=crop',
    caption: '부르즈 할리파·사막 사파리 현지 방송',
    tag: '🎬 콘텐츠',
  },
  {
    id: 'creator-bali',
    person: '유튜버 아나',
    city: '우붓, 발리',
    photo:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80&auto=format&fit=crop',
    caption: '요가 리트리트·라이스 필드 러닝',
    tag: '🌿 리트리트',
  },
];

// Travel recommendation / advisory banners. Rotates every visit.
export interface TravelAdvisory {
  id: string;
  kind: 'recommend' | 'alert';
  emoji: string;
  title: string;
  body: string;
  cta?: string;
}

export const TRAVEL_ADVISORIES: TravelAdvisory[] = [
  {
    id: 'rec-taiwan-spring',
    kind: 'recommend',
    emoji: '🌸',
    title: '지금 가기 좋은: 대만',
    body: '5월 중순까지 비성수기 항공권 40% 저렴. 지우펀·타이난 날씨가 이상적이에요.',
  },
  {
    id: 'rec-portugal',
    kind: 'recommend',
    emoji: '🍷',
    title: '떠오르는 여행지: 포르투갈',
    body: '유로존 대비 물가 20%↓. 리스본·포르투 중심으로 한국인 방문이 빠르게 늘고 있어요.',
  },
  {
    id: 'alert-holiday-surcharge',
    kind: 'alert',
    emoji: '⚠️',
    title: '황금연휴 주의',
    body: '5월 초·10월 초 연휴 항공권은 평소보다 최대 80% 비싸요. 2주 전까지는 확정하세요.',
  },
  {
    id: 'alert-baht-weak',
    kind: 'alert',
    emoji: '💸',
    title: '환율 변동',
    body: '태국 바트·베트남 동은 최근 약세. 현지 결제가 10~15% 저렴해졌어요.',
  },
  {
    id: 'rec-hidden-gem',
    kind: 'recommend',
    emoji: '💎',
    title: '숨은 명소: 우즈베키스탄',
    body: '사마르칸트 블루 돔과 부하라 올드타운. 비자 면제로 접근성도 좋아요.',
  },
  {
    id: 'alert-peak-season',
    kind: 'alert',
    emoji: '🔥',
    title: '성수기 경고',
    body: '7~8월 일본·유럽 숙박은 평소의 2배 이상. 예산 여유를 30% 더 두세요.',
  },
];
