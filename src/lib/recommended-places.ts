export interface RecommendedPlace {
  id: string;
  name: string;
  nameLocal: string;
  type: 'food' | 'activity' | 'transport' | 'accommodation';
  city: string;
  costLocal: number;
  currency: string;
  costKRW: number;
  menuItems?: string[];
  transportPreset?: { mode: string; route: string };
  description?: string;
  rating?: number;
}

export const RECOMMENDED_PLACES: Record<string, RecommendedPlace[]> = {
  JP: [
    { id: 'jp-ichiran', name: '이치란 라멘', nameLocal: '一蘭ラーメン', type: 'food', city: '후쿠오카/도쿄', costLocal: 980, currency: 'JPY', costKRW: 9500, menuItems: ['기본 라멘 (¥980)', '반숙달걀 추가 (¥130)', '구운 마늘 추가 (¥110)', '바베큐 포크 추가 (¥350)', '밥 추가 (¥220)'], rating: 4.3 },
    { id: 'jp-sushiro', name: '스시로 회전초밥', nameLocal: 'スシロー', type: 'food', city: '전국', costLocal: 1500, currency: 'JPY', costKRW: 14500, menuItems: ['연어 2개 (¥110)', '참치 2개 (¥110)', '에비 새우 2개 (¥110)', '우니 군함 (¥330)', '차완무시 (¥110)', '된장국 (¥110)'], rating: 4.1 },
    { id: 'jp-gyudon', name: '요시노야 규동', nameLocal: '吉野家 牛丼', type: 'food', city: '전국', costLocal: 490, currency: 'JPY', costKRW: 4800, menuItems: ['미니 규동 (¥380)', '소 규동 (¥490)', '중 규동 (¥590)', '된장국 (¥130)', '반숙달걀 (¥80)', '김치 (¥100)'], rating: 3.8 },
    { id: 'jp-convenience', name: '편의점 식사 (세븐일레븐)', nameLocal: 'セブン-イレブン', type: 'food', city: '전국', costLocal: 600, currency: 'JPY', costKRW: 5800, menuItems: ['おにぎり 삼각김밥 (¥130-180)', 'カップラーメン 컵라면 (¥200)', 'サンドウィッチ 샌드위치 (¥250)', '唐揚げ 닭튀김 (¥300)', 'スイーツ 디저트 (¥200-350)'], rating: 4.4 },
    { id: 'jp-skytree', name: '도쿄 스카이트리', nameLocal: '東京スカイツリー', type: 'activity', city: '도쿄', costLocal: 3100, currency: 'JPY', costKRW: 30000, rating: 4.5 },
    { id: 'jp-teamlab', name: '팀랩 플래닛 도쿄', nameLocal: 'teamLab Planets TOKYO', type: 'activity', city: '도쿄', costLocal: 3200, currency: 'JPY', costKRW: 31000, rating: 4.7 },
    { id: 'jp-fushimi', name: '후시미 이나리 신사', nameLocal: '伏見稲荷大社', type: 'activity', city: '교토', costLocal: 0, currency: 'JPY', costKRW: 0, description: '무료 입장, 새벽~야간 개방', rating: 4.8 },
    { id: 'jp-dotonbori', name: '도톤보리 야경', nameLocal: '道頓堀', type: 'activity', city: '오사카', costLocal: 0, currency: 'JPY', costKRW: 0, description: '무료 관람, 야경 명소', rating: 4.6 },
    { id: 'jp-nara-deer', name: '나라 사슴 공원', nameLocal: '奈良公園', type: 'activity', city: '나라', costLocal: 0, currency: 'JPY', costKRW: 0, description: '무료 입장, 사슴 먹이 ¥200', rating: 4.7 },
    { id: 'jp-jr-pass', name: 'JR 패스 7일권', nameLocal: 'JR Pass 7 Days', type: 'transport', city: '전국', costLocal: 50000, currency: 'JPY', costKRW: 485000, transportPreset: { mode: '신칸센', route: '신칸센 포함 JR 전노선 무제한' }, rating: 4.5 },
    { id: 'jp-suica', name: '스이카 카드 (도쿄)', nameLocal: 'Suica カード', type: 'transport', city: '도쿄', costLocal: 2000, currency: 'JPY', costKRW: 19400, transportPreset: { mode: '지하철·버스', route: '도쿄 메트로, 도에이, JR 야마노테선, 버스' } },
    { id: 'jp-icoca', name: '이코카 카드 (오사카)', nameLocal: 'ICOCA', type: 'transport', city: '오사카/교토', costLocal: 2000, currency: 'JPY', costKRW: 19400, transportPreset: { mode: '지하철·버스', route: '간사이 지하철, 버스, JR 전노선' } },
  ],
  TH: [
    { id: 'th-pad-thai', name: '팟타이 (길거리 노점)', nameLocal: 'Pad Thai (Street Food)', type: 'food', city: '방콕', costLocal: 60, currency: 'THB', costKRW: 2400, menuItems: ['팟타이 새우 (60฿)', '팟타이 닭고기 (50฿)', '팟타이 해물 (80฿)', '스프링롤 (40฿)', '망고 주스 (50฿)'], rating: 4.4 },
    { id: 'th-mango-rice', name: '망고 찹쌀밥', nameLocal: 'Mango Sticky Rice (ข้าวเหนียวมะม่วง)', type: 'food', city: '방콕', costLocal: 80, currency: 'THB', costKRW: 3200, menuItems: ['망고 찹쌀밥 (80฿)', '코코넛 밀크 추가 (20฿)', '블랙 세서미 (90฿)'], rating: 4.5 },
    { id: 'th-tom-yum', name: '톰얌꿍 (레스토랑)', nameLocal: 'Tom Yum Kung', type: 'food', city: '방콕', costLocal: 150, currency: 'THB', costKRW: 6000, menuItems: ['톰얌꿍 새우 (150฿)', '팟카파오 무쌉 (100฿)', '카오팟 새우볶음밥 (120฿)', '타이 아이스티 (50฿)'], rating: 4.5 },
    { id: 'th-grand-palace', name: '왕궁 & 왓 프라깨우', nameLocal: 'Grand Palace & Wat Phra Kaew', type: 'activity', city: '방콕', costLocal: 500, currency: 'THB', costKRW: 20000, rating: 4.6 },
    { id: 'th-phi-phi', name: '피피섬 보트 투어', nameLocal: 'Phi Phi Island Tour', type: 'activity', city: '푸켓', costLocal: 1200, currency: 'THB', costKRW: 48000, rating: 4.7 },
    { id: 'th-thai-massage', name: '타이 전통 마사지 1시간', nameLocal: 'Traditional Thai Massage', type: 'activity', city: '방콕', costLocal: 300, currency: 'THB', costKRW: 12000, rating: 4.5 },
    { id: 'th-chatuchak', name: '짜뚜짝 주말 시장', nameLocal: 'Chatuchak Weekend Market', type: 'activity', city: '방콕', costLocal: 0, currency: 'THB', costKRW: 0, description: '무료 입장 (토-일)', rating: 4.5 },
    { id: 'th-bts', name: '방콕 BTS 스카이트레인', nameLocal: 'BTS Skytrain', type: 'transport', city: '방콕', costLocal: 40, currency: 'THB', costKRW: 1600, transportPreset: { mode: '전철', route: '방콕 수쿰빗·실롬 라인' } },
    { id: 'th-grab', name: '그랩 택시 (앱)', nameLocal: 'Grab Taxi', type: 'transport', city: '방콕/푸켓', costLocal: 150, currency: 'THB', costKRW: 6000, transportPreset: { mode: '택시', route: '시내 5-10km 기준' } },
    { id: 'th-minivan', name: '공항 미니밴 (수완나품)', nameLocal: 'Airport Minivan', type: 'transport', city: '방콕', costLocal: 150, currency: 'THB', costKRW: 6000, transportPreset: { mode: '버스', route: '수완나품 공항↔시내' } },
  ],
  VN: [
    { id: 'vn-pho', name: '쌀국수 (현지 식당)', nameLocal: 'Phở', type: 'food', city: '하노이', costLocal: 40000, currency: 'VND', costKRW: 2200, menuItems: ['쌀국수 소 (40,000₫)', '쌀국수 대 (50,000₫)', '스프링롤 (30,000₫)', '옥수수 주스 (20,000₫)'], rating: 4.5 },
    { id: 'vn-banh-mi', name: '반미 샌드위치', nameLocal: 'Bánh Mì', type: 'food', city: '호이안', costLocal: 25000, currency: 'VND', costKRW: 1400, menuItems: ['반미 돼지고기 (25,000₫)', '반미 닭고기 (30,000₫)', '반미 채식 (20,000₫)'], rating: 4.6 },
    { id: 'vn-cao-lau', name: '까오러우 면요리', nameLocal: 'Cao Lầu (Hội An)', type: 'food', city: '호이안', costLocal: 45000, currency: 'VND', costKRW: 2500, menuItems: ['까오러우 (45,000₫)', '화이트 로즈 만두 (35,000₫)', '반쌔오 (40,000₫)'], rating: 4.6 },
    { id: 'vn-halong', name: '하롱베이 1박 2일 크루즈', nameLocal: 'Hạ Long Bay Cruise', type: 'activity', city: '하롱', costLocal: 2000000, currency: 'VND', costKRW: 110000, rating: 4.8 },
    { id: 'vn-hoan-kiem', name: '호안끼엠 호수 & 옥산사', nameLocal: 'Hồ Hoàn Kiếm', type: 'activity', city: '하노이', costLocal: 30000, currency: 'VND', costKRW: 1700, rating: 4.5 },
    { id: 'vn-cooking', name: '베트남 요리 클래스', nameLocal: 'Vietnamese Cooking Class', type: 'activity', city: '호이안', costLocal: 350000, currency: 'VND', costKRW: 19300, rating: 4.7 },
    { id: 'vn-grab-bike', name: '그랩 오토바이', nameLocal: 'GrabBike', type: 'transport', city: '하노이/호찌민', costLocal: 20000, currency: 'VND', costKRW: 1100, transportPreset: { mode: '오토바이', route: '시내 단거리 이동 (2-5km)' } },
    { id: 'vn-sleeper', name: '침대열차 (하노이↔다낭)', nameLocal: 'Reunification Express', type: 'transport', city: '하노이↔다낭', costLocal: 500000, currency: 'VND', costKRW: 27600, transportPreset: { mode: '기차', route: '하노이→다낭 (15시간, 야간 침대)' } },
  ],
  TW: [
    { id: 'tw-night-market', name: '스린 야시장', nameLocal: '士林夜市', type: 'food', city: '타이베이', costLocal: 300, currency: 'TWD', costKRW: 13000, menuItems: ['굴전 오아짼 (50NT$)', '대왕 치킨 스테이크 다지파이 (75NT$)', '버블티 젠주나이차 (55NT$)', '취두부 (50NT$)', '망고빙수 (100NT$)'], rating: 4.5 },
    { id: 'tw-beef-noodle', name: '대만 우육면', nameLocal: '台灣牛肉麵', type: 'food', city: '타이베이', costLocal: 180, currency: 'TWD', costKRW: 7800, menuItems: ['홍소우육면 (180NT$)', '칭둔우육면 (190NT$)', '반건면 (170NT$)', '절임 배추 (50NT$)'], rating: 4.6 },
    { id: 'tw-jiufen', name: '지우펀 마을', nameLocal: '九份老街', type: 'activity', city: '타이베이 근교', costLocal: 0, currency: 'TWD', costKRW: 0, description: '무료 관람 (교통비 별도)', rating: 4.7 },
    { id: 'tw-taroko', name: '타로코 국립공원', nameLocal: '太魯閣國家公園', type: 'activity', city: '화련', costLocal: 0, currency: 'TWD', costKRW: 0, description: '무료 입장', rating: 4.8 },
    { id: 'tw-elephant-mtn', name: '샹산 (코끼리산) 야경', nameLocal: '象山 夜景', type: 'activity', city: '타이베이', costLocal: 0, currency: 'TWD', costKRW: 0, description: '무료 (타이베이 101 야경)', rating: 4.6 },
    { id: 'tw-easy-card', name: '이지카드 (유유카)', nameLocal: '悠遊卡 Easy Card', type: 'transport', city: '타이베이', costLocal: 500, currency: 'TWD', costKRW: 21700, transportPreset: { mode: 'MRT·버스', route: '타이베이 MRT + 시내버스 전노선' } },
    { id: 'tw-hsr', name: '대만 고속철 (THSR)', nameLocal: '台灣高鐵', type: 'transport', city: '타이베이↔고웅', costLocal: 1490, currency: 'TWD', costKRW: 64700, transportPreset: { mode: '고속철', route: '타이베이↔고웅 (2시간)' } },
  ],
  SG: [
    { id: 'sg-hawker', name: '호커센터 식사', nameLocal: 'Hawker Centre', type: 'food', city: '싱가포르', costLocal: 6, currency: 'SGD', costKRW: 6000, menuItems: ['하이난 치킨 라이스 (4-6S$)', '락사 (5-7S$)', '차퀘이테우 (4-6S$)', '카야 토스트 세트 (4S$)', '타이거 맥주 (8S$)'], rating: 4.6 },
    { id: 'sg-chili-crab', name: '칠리 크랩 (정식 레스토랑)', nameLocal: 'Chilli Crab', type: 'food', city: '싱가포르', costLocal: 60, currency: 'SGD', costKRW: 60000, menuItems: ['칠리 크랩 (시가)', '블랙페퍼 크랩 (시가)', '만터우 튀김 (5S$)', '타이거 맥주 (8S$)'], rating: 4.7 },
    { id: 'sg-gardens', name: '가든스 바이 더 베이', nameLocal: 'Gardens by the Bay', type: 'activity', city: '싱가포르', costLocal: 28, currency: 'SGD', costKRW: 28000, rating: 4.7 },
    { id: 'sg-sentosa', name: '유니버설 스튜디오 싱가포르', nameLocal: 'Universal Studios Singapore', type: 'activity', city: '싱가포르 센토사', costLocal: 88, currency: 'SGD', costKRW: 88000, rating: 4.6 },
    { id: 'sg-marina-bay', name: '마리나베이샌즈 스카이파크', nameLocal: 'Marina Bay Sands SkyPark', type: 'activity', city: '싱가포르', costLocal: 26, currency: 'SGD', costKRW: 26000, rating: 4.5 },
    { id: 'sg-mrt', name: '싱가포르 MRT (이지링크)', nameLocal: 'EZ-Link Card', type: 'transport', city: '싱가포르', costLocal: 15, currency: 'SGD', costKRW: 15000, transportPreset: { mode: 'MRT·버스', route: 'MRT 전노선 + 시내버스 (충전식)' } },
  ],
  FR: [
    { id: 'fr-louvre', name: '루브르 박물관', nameLocal: 'Musée du Louvre', type: 'activity', city: '파리', costLocal: 22, currency: 'EUR', costKRW: 33000, rating: 4.7 },
    { id: 'fr-eiffel', name: '에펠탑 정상 입장', nameLocal: 'Tour Eiffel — Sommet', type: 'activity', city: '파리', costLocal: 29, currency: 'EUR', costKRW: 43500, rating: 4.8 },
    { id: 'fr-versailles', name: '베르사유 궁전', nameLocal: 'Château de Versailles', type: 'activity', city: '파리 근교', costLocal: 21, currency: 'EUR', costKRW: 31500, rating: 4.7 },
    { id: 'fr-musee-orsay', name: '오르세 미술관', nameLocal: "Musée d'Orsay", type: 'activity', city: '파리', costLocal: 16, currency: 'EUR', costKRW: 24000, rating: 4.8 },
    { id: 'fr-brasserie', name: '파리 브라세리 아침식사', nameLocal: 'Brasserie Breakfast', type: 'food', city: '파리', costLocal: 12, currency: 'EUR', costKRW: 18000, menuItems: ['크루아상 (2.5€)', '카페 오 레 (3€)', '오렌지 주스 (4€)', '통밀빵+버터 (3€)', '팽 오 쇼콜라 (2.5€)'], rating: 4.3 },
    { id: 'fr-bistro', name: '파리 비스트로 런치', nameLocal: 'Paris Bistro Lunch', type: 'food', city: '파리', costLocal: 20, currency: 'EUR', costKRW: 30000, menuItems: ['오늘의 플라 Plat du jour (15€)', '수프 (8€)', '크렘 브륄레 (7€)', '하우스 와인 한 잔 (5€)'], rating: 4.4 },
    { id: 'fr-metro', name: '파리 메트로 카르네 10회권', nameLocal: 'Carnet Métro Paris (10 tickets)', type: 'transport', city: '파리', costLocal: 16, currency: 'EUR', costKRW: 24000, transportPreset: { mode: '지하철', route: '파리 메트로 Zone 1-2, RER A·B' } },
  ],
  ES: [
    { id: 'es-sagrada', name: '사그라다 파밀리아', nameLocal: 'Sagrada Família', type: 'activity', city: '바르셀로나', costLocal: 33, currency: 'EUR', costKRW: 49500, rating: 4.8 },
    { id: 'es-park-guell', name: '구엘 공원', nameLocal: 'Park Güell', type: 'activity', city: '바르셀로나', costLocal: 10, currency: 'EUR', costKRW: 15000, rating: 4.6 },
    { id: 'es-alhambra', name: '알람브라 궁전', nameLocal: 'Alhambra de Granada', type: 'activity', city: '그라나다', costLocal: 19, currency: 'EUR', costKRW: 28500, rating: 4.8 },
    { id: 'es-tapas', name: '타파스 바 저녁식사', nameLocal: 'Tapas Bar Dinner', type: 'food', city: '바르셀로나', costLocal: 25, currency: 'EUR', costKRW: 37500, menuItems: ['감바스 알 아히요 (12€)', '파타타스 브라바스 (6€)', '판 콘 토마테 (3€)', '상그리아 피처 (18€)', '초리소 아라 라 시드라 (9€)'], rating: 4.5 },
    { id: 'es-bocadillo', name: '보카디요 (길거리 샌드위치)', nameLocal: 'Bocadillo de Jamón', type: 'food', city: '마드리드', costLocal: 4, currency: 'EUR', costKRW: 6000, menuItems: ['하몬 보카디요 (4€)', '토르티야 보카디요 (3.5€)', '카페 콘 레체 (1.5€)'], rating: 4.4 },
    { id: 'es-metro', name: '바르셀로나 T-Casual 10회권', nameLocal: 'T-Casual Barcelona (10 viajes)', type: 'transport', city: '바르셀로나', costLocal: 12, currency: 'EUR', costKRW: 18000, transportPreset: { mode: '지하철·버스', route: '메트로 + 버스 10회 (Zone 1)' } },
    { id: 'es-ave', name: '스페인 초고속열차 AVE', nameLocal: 'AVE (Alta Velocidad Española)', type: 'transport', city: '마드리드↔바르셀로나', costLocal: 50, currency: 'EUR', costKRW: 75000, transportPreset: { mode: '고속철', route: '마드리드↔바르셀로나 (2시간 30분)' } },
  ],
  TR: [
    { id: 'tr-hagia', name: '아야소피아 (하기아 소피아)', nameLocal: 'Ayasofya', type: 'activity', city: '이스탄불', costLocal: 0, currency: 'TRY', costKRW: 0, description: '무료 입장 (모스크 개방)', rating: 4.8 },
    { id: 'tr-grand-bazaar', name: '그랜드 바자르', nameLocal: 'Kapalıçarşı (Grand Bazaar)', type: 'activity', city: '이스탄불', costLocal: 0, currency: 'TRY', costKRW: 0, description: '무료 입장, 쇼핑 명소', rating: 4.5 },
    { id: 'tr-kebab', name: '케밥 레스토랑', nameLocal: 'Döner & Adana Kebabı', type: 'food', city: '이스탄불', costLocal: 200, currency: 'TRY', costKRW: 8000, menuItems: ['이스켄데르 케밥 (180TL)', '아다나 케밥 (150TL)', '도너 케밥 (120TL)', '메르지메크 수프 (50TL)', '차이 홍차 (15TL)'], rating: 4.6 },
    { id: 'tr-simit', name: '시미트 (길거리 간식)', nameLocal: 'Simit', type: 'food', city: '이스탄불', costLocal: 20, currency: 'TRY', costKRW: 800, menuItems: ['시미트 (20TL)', '차이 (15TL)', '아이란 (25TL)'], rating: 4.3 },
    { id: 'tr-istanbulkart', name: '이스탄불카드 (교통카드)', nameLocal: 'İstanbulkart', type: 'transport', city: '이스탄불', costLocal: 200, currency: 'TRY', costKRW: 8000, transportPreset: { mode: '지하철·버스·페리', route: '메트로, 트램, 페리, 버스 전노선' } },
  ],
  US: [
    { id: 'us-met', name: '메트로폴리탄 미술관', nameLocal: 'The Met (Metropolitan Museum of Art)', type: 'activity', city: '뉴욕', costLocal: 30, currency: 'USD', costKRW: 43500, rating: 4.8 },
    { id: 'us-central-park', name: '센트럴 파크', nameLocal: 'Central Park', type: 'activity', city: '뉴욕', costLocal: 0, currency: 'USD', costKRW: 0, description: '무료 입장', rating: 4.8 },
    { id: 'us-hollywood-walk', name: '할리우드 워크 오브 페임', nameLocal: 'Hollywood Walk of Fame', type: 'activity', city: '로스앤젤레스', costLocal: 0, currency: 'USD', costKRW: 0, description: '무료 관람', rating: 4.3 },
    { id: 'us-shake-shack', name: '쉐이크쉑 버거', nameLocal: 'Shake Shack', type: 'food', city: '뉴욕', costLocal: 18, currency: 'USD', costKRW: 26000, menuItems: ['쉑버거 (9.99$)', '치즈버거 (8.99$)', '쉐이크 (7.49$)', '크링클컷 후라이 (5.29$)', '핫도그 (4.49$)'], rating: 4.4 },
    { id: 'us-in-n-out', name: '인앤아웃 버거', nameLocal: "In-N-Out Burger", type: 'food', city: '로스앤젤레스', costLocal: 12, currency: 'USD', costKRW: 17400, menuItems: ['더블더블 (5.45$)', '애니멀 스타일 패티 추가 (1$)', '밀크쉐이크 (3.65$)', '프라이 (2.45$)'], rating: 4.5 },
    { id: 'us-nyc-subway', name: '뉴욕 지하철 7일권', nameLocal: 'NYC Subway 7-Day MetroCard', type: 'transport', city: '뉴욕', costLocal: 34, currency: 'USD', costKRW: 49300, transportPreset: { mode: '지하철', route: '뉴욕 지하철 24시간 전노선' } },
    { id: 'us-uber', name: '우버 (LA 시내)', nameLocal: 'Uber / Lyft', type: 'transport', city: '로스앤젤레스', costLocal: 20, currency: 'USD', costKRW: 29000, transportPreset: { mode: '택시', route: '시내 5-15km 기준' } },
  ],
  AU: [
    { id: 'au-opera-tour', name: '시드니 오페라 하우스 투어', nameLocal: 'Sydney Opera House Tour', type: 'activity', city: '시드니', costLocal: 40, currency: 'AUD', costKRW: 36000, rating: 4.7 },
    { id: 'au-great-barrier', name: '그레이트 배리어 리프 다이빙', nameLocal: 'Great Barrier Reef Snorkeling Tour', type: 'activity', city: '케언즈', costLocal: 200, currency: 'AUD', costKRW: 180000, rating: 4.8 },
    { id: 'au-bondi', name: '본다이 비치', nameLocal: 'Bondi Beach', type: 'activity', city: '시드니', costLocal: 0, currency: 'AUD', costKRW: 0, description: '무료 입장', rating: 4.7 },
    { id: 'au-flat-white', name: '멜버른 스페셜티 카페', nameLocal: 'Melbourne Specialty Coffee', type: 'food', city: '멜버른', costLocal: 8, currency: 'AUD', costKRW: 7200, menuItems: ['플랫화이트 (5$)', '카푸치노 (4.5$)', '아보카도 토스트 (18$)', '에그 베네딕트 (22$)', '그래놀라 볼 (14$)'], rating: 4.5 },
    { id: 'au-fish-chips', name: '피시앤칩스 (해변)', nameLocal: "Harry's Fish & Chips", type: 'food', city: '시드니', costLocal: 20, currency: 'AUD', costKRW: 18000, menuItems: ['피시앤칩스 (18-22$)', '카라마리 (15$)', '게살 버거 (16$)', '소프트드링크 (3$)'], rating: 4.3 },
    { id: 'au-opal', name: '오팔 카드 (시드니 대중교통)', nameLocal: 'Opal Card (Sydney)', type: 'transport', city: '시드니', costLocal: 20, currency: 'AUD', costKRW: 18000, transportPreset: { mode: '버스·페리·기차', route: '시드니 버스, 페리, 메트로, 기차 전노선' } },
  ],
  IT: [
    { id: 'it-colosseum', name: '콜로세움 (포로로마노 포함)', nameLocal: 'Colosseo + Foro Romano', type: 'activity', city: '로마', costLocal: 18, currency: 'EUR', costKRW: 27000, rating: 4.8 },
    { id: 'it-sistine', name: '바티칸 박물관 & 시스티나 성당', nameLocal: 'Musei Vaticani & Cappella Sistina', type: 'activity', city: '로마', costLocal: 20, currency: 'EUR', costKRW: 30000, rating: 4.8 },
    { id: 'it-uffizi', name: '우피치 미술관', nameLocal: 'Galleria degli Uffizi', type: 'activity', city: '피렌체', costLocal: 25, currency: 'EUR', costKRW: 37500, rating: 4.8 },
    { id: 'it-gelato', name: '젤라테리아 젤라토', nameLocal: 'Gelateria Artigianale', type: 'food', city: '로마/피렌체', costLocal: 3, currency: 'EUR', costKRW: 4500, menuItems: ['1스쿱 젤라토 (2.5€)', '2스쿱 젤라토 (3.5€)', '피스타치오', '스트라치아텔라', '티라미수', '리몬첼로'], rating: 4.6 },
    { id: 'it-pizza', name: '정통 나폴리 피자', nameLocal: 'Pizza Napoletana DOC', type: 'food', city: '나폴리/로마', costLocal: 10, currency: 'EUR', costKRW: 15000, menuItems: ['마르게리타 (8€)', '마리나라 (7€)', '콰트로 포르마지 (12€)', '집으로 옮긴 나폴리 피자 (13€)', '그라파 (4€)'], rating: 4.7 },
    { id: 'it-metro-rome', name: '로마 메트로 48시간권', nameLocal: 'Roma Pass 48h', type: 'transport', city: '로마', costLocal: 32, currency: 'EUR', costKRW: 48000, transportPreset: { mode: '지하철·버스·트램', route: '메트로 A·B·C, 버스, 트램 전노선' } },
  ],
  HK: [
    { id: 'hk-dim-sum', name: '얌차 딤섬 (전통 레스토랑)', nameLocal: '飲茶 點心', type: 'food', city: '홍콩', costLocal: 150, currency: 'HKD', costKRW: 26000, menuItems: ['하가우 새우만두 (52HK$)', '시우마이 (52HK$)', '차슈바오 (48HK$)', '에그타르트 (40HK$)', '보이차 (35HK$)'], rating: 4.6 },
    { id: 'hk-dim-tsum', name: '팀호완 (저렴한 미슐랭)', nameLocal: '添好運 Tim Ho Wan', type: 'food', city: '홍콩', costLocal: 80, currency: 'HKD', costKRW: 14000, menuItems: ['베이크드 차슈바오 (32HK$)', '하가우 (38HK$)', '시우마이 (32HK$)', '망고 푸딩 (28HK$)'], rating: 4.5 },
    { id: 'hk-victoria', name: '빅토리아 피크 트램', nameLocal: 'Peak Tram (山頂纜車)', type: 'activity', city: '홍콩', costLocal: 128, currency: 'HKD', costKRW: 22300, rating: 4.7 },
    { id: 'hk-disneyland', name: '홍콩 디즈니랜드', nameLocal: 'Hong Kong Disneyland', type: 'activity', city: '홍콩', costLocal: 639, currency: 'HKD', costKRW: 111300, rating: 4.5 },
    { id: 'hk-octopus', name: '옥토퍼스 카드', nameLocal: '八達通 Octopus Card', type: 'transport', city: '홍콩', costLocal: 150, currency: 'HKD', costKRW: 26100, transportPreset: { mode: 'MTR·버스·페리·트램', route: 'MTR, 버스, 페리, 트램 전노선 (충전식)' } },
  ],
  PH: [
    { id: 'ph-lechon', name: '레촌 카왈리', nameLocal: 'Lechon Kawali (세부)', type: 'food', city: '세부', costLocal: 300, currency: 'PHP', costKRW: 7500, menuItems: ['레촌 바카이 (300PHP/인분)', '이나솔-아솔 (250PHP)', '신가랑 (200PHP)', '집에서 만든 산도 (150PHP)'], rating: 4.6 },
    { id: 'ph-halo-halo', name: '할로할로 (전통 빙수)', nameLocal: 'Halo-Halo', type: 'food', city: '마닐라', costLocal: 120, currency: 'PHP', costKRW: 3000, menuItems: ['할로할로 스페셜 (120PHP)', '더블 프리미엄 (180PHP)'], rating: 4.4 },
    { id: 'ph-island-hopping', name: '팔라완 아일랜드 호핑', nameLocal: 'Palawan Island Hopping', type: 'activity', city: '엘니도/코론', costLocal: 1200, currency: 'PHP', costKRW: 30000, rating: 4.9 },
    { id: 'ph-intramuros', name: '인트라무로스 & 성 아구스틴 성당', nameLocal: 'Intramuros & San Agustin', type: 'activity', city: '마닐라', costLocal: 100, currency: 'PHP', costKRW: 2500, rating: 4.5 },
    { id: 'ph-grab', name: '그랩 (앱 택시)', nameLocal: 'Grab Philippines', type: 'transport', city: '마닐라/세부', costLocal: 150, currency: 'PHP', costKRW: 3800, transportPreset: { mode: '택시', route: '시내 5-10km 기준' } },
    { id: 'ph-jeepney', name: '지프니 (서민 교통)', nameLocal: 'Jeepney', type: 'transport', city: '마닐라', costLocal: 15, currency: 'PHP', costKRW: 380, transportPreset: { mode: '버스', route: '마닐라 시내 단거리 노선' } },
  ],
  ID: [
    { id: 'id-nasi-goreng', name: '나시고랭 (인도네시아 볶음밥)', nameLocal: 'Nasi Goreng', type: 'food', city: '발리/자카르타', costLocal: 30000, currency: 'IDR', costKRW: 2700, menuItems: ['나시고랭 기본 (30,000Rp)', '나시고랭 프리스탈라 (45,000Rp)', '미고랭 (35,000Rp)', '사테이 꼬치 (40,000Rp)', '클라파 주스 (25,000Rp)'], rating: 4.5 },
    { id: 'id-rendang', name: '렌당 (쇠고기 스파이스 조림)', nameLocal: 'Rendang Sapi', type: 'food', city: '자카르타/욕야카르타', costLocal: 50000, currency: 'IDR', costKRW: 4500, menuItems: ['렌당 박소 (50,000Rp)', '아얌 고렝 (40,000Rp)', '룸피아 (25,000Rp)', '예스 테 (15,000Rp)'], rating: 4.6 },
    { id: 'id-tanah-lot', name: '따나 롯 사원 (일몰)', nameLocal: 'Pura Tanah Lot', type: 'activity', city: '발리', costLocal: 60000, currency: 'IDR', costKRW: 5400, rating: 4.7 },
    { id: 'id-borobudur', name: '보로부두르 사원', nameLocal: 'Candi Borobudur', type: 'activity', city: '욕야카르타', costLocal: 350000, currency: 'IDR', costKRW: 31500, rating: 4.8 },
    { id: 'id-grab', name: '그랩/고젝 (앱 택시)', nameLocal: 'Grab / Gojek', type: 'transport', city: '발리/자카르타', costLocal: 30000, currency: 'IDR', costKRW: 2700, transportPreset: { mode: '택시', route: '시내 5-10km 기준' } },
    { id: 'id-kura-kura', name: '꾸라꾸라 버스 (발리 관광버스)', nameLocal: 'Kura-Kura Bus', type: 'transport', city: '발리', costLocal: 50000, currency: 'IDR', costKRW: 4500, transportPreset: { mode: '버스', route: '꾸타↔누사두아↔우붓 (관광노선)' } },
  ],
};
