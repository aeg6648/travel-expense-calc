// Editorially-curated "popular traveler courses" used when the community
// hasn't produced enough highly-liked posts yet. Once real data is rich,
// community top posts take precedence in HotCoursesPanel.

import type { CountryPhoto } from '@/lib/country-photos';
import { getCountryPhoto } from '@/lib/country-photos';

export interface HotCourse {
  id: string;
  title: string;
  countryCode: string;
  days: number;
  stops: string[];       // 3-5 stop names
  vibe: string;          // "포토제닉", "미식", "감성" 등
  hype: number;          // simulated like count — sorting key
  perDayKRW?: number;    // ballpark daily spend
}

export const HOT_COURSES: HotCourse[] = [
  {
    id: 'jp-kansai-4n',
    title: '간사이 감성 4박5일',
    countryCode: 'JP',
    days: 5,
    stops: ['오사카 도톤보리', '교토 기온', '아라시야마', '우메다 야경', '나라 사슴공원'],
    vibe: '📸 포토제닉 · 🍜 미식',
    hype: 342,
    perDayKRW: 140000,
  },
  {
    id: 'vn-central-5n',
    title: '다낭·호이안 불빛 5박6일',
    countryCode: 'VN',
    days: 6,
    stops: ['다낭 미케비치', '바나힐', '호이안 올드타운', '호이안 야시장', '후에 왕궁'],
    vibe: '🌿 힐링 · 🌃 야경',
    hype: 287,
    perDayKRW: 90000,
  },
  {
    id: 'th-bkk-3n',
    title: '방콕·아유타야 3박4일',
    countryCode: 'TH',
    days: 4,
    stops: ['왕궁·왓포', '짜뚜짝 마켓', '아이콘시암', '아유타야 일일투어', '루프탑 바'],
    vibe: '🛍️ 쇼핑 · 🍜 미식',
    hype: 256,
    perDayKRW: 110000,
  },
  {
    id: 'fr-paris-5n',
    title: '파리·몽생미셸 5박7일',
    countryCode: 'FR',
    days: 7,
    stops: ['에펠·트로카데로', '마레 지구', '루브르', '베르사유', '몽생미셸 1박'],
    vibe: '🎨 예술 · 📸 포토제닉',
    hype: 241,
    perDayKRW: 270000,
  },
  {
    id: 'tw-taipei-3n',
    title: '타이베이·지우펀 3박4일',
    countryCode: 'TW',
    days: 4,
    stops: ['스린 야시장', '지우펀 옛거리', '단수이 해질녘', '융캉제 소롱포', '베이터우 온천'],
    vibe: '🍜 미식 · 🌃 야경',
    hype: 228,
    perDayKRW: 100000,
  },
  {
    id: 'gr-santorini-4n',
    title: '산토리니 선셋 4박5일',
    countryCode: 'GR',
    days: 5,
    stops: ['이아 선셋 포인트', '피라 캘데라', '레드비치', '아크로티리 유적', '와이너리 투어'],
    vibe: '📸 포토제닉 · 🌿 힐링',
    hype: 214,
    perDayKRW: 230000,
  },
  {
    id: 'id-bali-5n',
    title: '우붓·짱구 요가 트립 5박6일',
    countryCode: 'ID',
    days: 6,
    stops: ['우붓 몽키포레스트', '떠갈랄랑 라이스테라스', '짱구 비치', '울루와뚜 클라팝 선셋', '수상 사원 울룬다누'],
    vibe: '🌿 힐링 · 🏄 액티비티',
    hype: 198,
    perDayKRW: 130000,
  },
  {
    id: 'tr-istanbul-cap-6n',
    title: '이스탄불·카파도키아 6박8일',
    countryCode: 'TR',
    days: 8,
    stops: ['블루모스크', '그랜드 바자르', '보스포러스 크루즈', '괴레메 벌룬', '데린쿠유 지하도시'],
    vibe: '📸 포토제닉 · 🎨 문화',
    hype: 187,
    perDayKRW: 140000,
  },
  {
    id: 'it-rome-nap-5n',
    title: '로마·피렌체·아말피 5박6일',
    countryCode: 'IT',
    days: 6,
    stops: ['콜로세움', '바티칸', '우피치 미술관', '두오모', '포지타노 드라이브'],
    vibe: '🎨 예술 · 🍜 미식',
    hype: 176,
    perDayKRW: 250000,
  },
  {
    id: 'us-nyc-4n',
    title: '뉴욕 힙스터 4박6일',
    countryCode: 'US',
    days: 6,
    stops: ['소호·그리니치빌리지', '브루클린 덤보', '메트로폴리탄', '센트럴파크 자전거', '하이라인·첼시마켓'],
    vibe: '🛍️ 쇼핑 · 🎨 예술',
    hype: 165,
    perDayKRW: 310000,
  },
];

export function getCoverPhoto(course: HotCourse): CountryPhoto | undefined {
  return getCountryPhoto(course.countryCode);
}
