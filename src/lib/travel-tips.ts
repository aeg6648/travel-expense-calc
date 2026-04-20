// Rotating travel info / tips shown on the sidebar. Pick a handful at
// random per visit so repeat views feel fresh.

export interface TravelTip {
  id: string;
  emoji: string;
  category: string; // 준비 · 현지 · 돈 · 교통 · 안전 · 문화 · 감성
  title: string;
  body: string;
}

export const TRAVEL_TIPS: TravelTip[] = [
  { id: 'esim',       emoji: '📱', category: '준비', title: 'eSIM이 훨씬 싸다',          body: 'Airalo·Ubigi로 10분 만에 설치. 현지 통신사 로밍 대비 30~50% 저렴.' },
  { id: 'customs',    emoji: '🛃', category: '현지', title: '입국 신고는 앱으로 먼저',   body: '일본 Visit Japan Web, 호주 DAC, 싱가포르 SG Arrival — 미리 작성하면 줄 덜 서요.' },
  { id: 'cash',       emoji: '💳', category: '돈',   title: '트래블카드 2개 챙기기',     body: '하나로 안되면 다른 하나. 여권 분실 대비 모바일 백업도 필수.' },
  { id: 'rainy',      emoji: '☔️', category: '준비', title: '우기엔 한나절만 걷자',      body: '오후 스콜 지역은 오전 투어 + 오후 호텔·카페 분산이 실패 확률 낮아요.' },
  { id: 'taxi',       emoji: '🚖', category: '교통', title: '택시는 앱으로',             body: 'Grab(동남아) · DiDi(중국) · Uber · Bolt. 미터기·바가지 스트레스 제로.' },
  { id: 'peak',       emoji: '📆', category: '돈',   title: '항공은 화·수 새벽 예약',    body: '같은 노선도 요일·시간에 따라 20~40% 차이. 회사 월급날 주말은 비싼 편.' },
  { id: 'scam',       emoji: '🛡️', category: '안전', title: '「무료」는 절대 무료 아님', body: '팔찌·사진·지도 도와준다며 따라붙는 손 = 유료. 단호하게 No thanks.' },
  { id: 'water',      emoji: '💧', category: '현지', title: '빈속에 길거리 음식 피하기', body: '장이 적응되기 전엔 생수·탄산수부터. 탈이 나면 하루를 날려요.' },
  { id: 'metro',      emoji: '🚇', category: '교통', title: '지하철 IC카드는 공항에서',  body: 'Suica·EasyCard·옥토퍼스 — 공항 셀프 키오스크가 가장 빠르고 언어 지원도 좋음.' },
  { id: 'snap',       emoji: '📸', category: '감성', title: '아침 7시가 골든타임',       body: '관광객 없는 사진은 해 뜨고 30분. 밤은 블루아워 30분 — 하늘이 가장 진해요.' },
  { id: 'tip',        emoji: '🍴', category: '문화', title: '팁 문화는 나라별로',        body: '미국 18~22%, 유럽 5~10% 혹은 반올림, 일본·한국·호주는 기본 0.' },
  { id: 'lounge',     emoji: '🛋️', category: '돈',   title: 'PP카드 한 장이면 공항이 집', body: '경유·연착시 샤워·식사 무료. 연회비가 라운지 한 번으로 회수됨.' },
  { id: 'walk',       emoji: '👟', category: '준비', title: '첫날 신발은 익숙한 걸로',   body: '새 운동화는 물집 제조기. 현지에서 하루만 신어보고 평가하세요.' },
  { id: 'docs',       emoji: '🗂️', category: '준비', title: '여권 사진을 4곳에 분산',    body: '클라우드·이메일·메신저·오프라인. 잃어버려도 영사관 처리가 빨라져요.' },
  { id: 'earlycheck', emoji: '🏨', category: '현지', title: '얼리 체크인 요청은 아침에', body: '도착 당일 9~11시에 이메일·전화로 미리. 빈 방 있으면 무료로 내주는 호텔 많음.' },
  { id: 'season',     emoji: '🌸', category: '감성', title: '벚꽃·단풍은 일주일 오차',   body: '예보 사이트 평균값만 믿지 말고, 전년도 동일주차 블로그를 함께 보세요.' },
  { id: 'nightbus',   emoji: '🚌', category: '교통', title: '야간 이동으로 숙박비 절약', body: '유럽 FlixBus·베트남 슬리핑버스·일본 윌러. 8시간 이동 = 하루 숙박비 세이브.' },
  { id: 'lostcard',   emoji: '📞', category: '안전', title: '카드사 분실번호 즉시 저장', body: '해외 분실시 현지 통화는 비싸고 대기 김. 국내번호 국제전화로 거는 게 제일 빠름.' },
  { id: 'offline',    emoji: '🗺️', category: '준비', title: '오프라인 지도 받아두기',    body: 'Google Maps 도시 전체 오프라인 다운. 와이파이 끊겨도 경로는 살아있어요.' },
  { id: 'vibe',       emoji: '🎧', category: '감성', title: '플레이리스트 먼저 만들기',  body: '현지 BGM·영화 OST를 미리 들어두면 도착했을 때 몰입도 2배. 사소하지만 진짜.' },
];
