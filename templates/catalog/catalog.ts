export type Template = {
  slug: string;
  name: string;
  industry: string;
  english: string;
  brand: string;
  headline: string;
  tagline: string;
  description: string;
  strength: string;
  consideration: string;
  serviceLabel: string;
  story: string;
  storyTitle: string;
  accent: string;
  background: string;
  ink: string;
  artSlug?: string;
  items: { name: string; detail: string; price: string; category: string }[];
  highlights: string[];
};

// Independent example brands and illustrations, not real customer businesses.
// All seven designs share navigation/options; industry content lives here.
export const templateCatalog: Template[] = [
  {
    slug: 'hyehwa',
    name: '테이블 · 메뉴 중심형',
    industry: '음식점 · 치킨 · 분식',
    english: 'THE TABLE',
    brand: '담백한 식탁',
    headline: '좋은 한 끼가\n하루를 바꿉니다.',
    tagline: '매일의 식탁에, 정성을 더하다.',
    description: '음식 사진과 메뉴, 찾아오는 길이 먼저 보이는 따뜻한 매장형 디자인.',
    strength: '메뉴와 가격을 빠르게 확인할 수 있어 동네 식당과 배달 외 방문 고객 안내에 좋습니다.',
    consideration: '대표 음식 사진이 중요합니다. 메뉴가 많다면 별도의 메뉴 페이지를 추천합니다.',
    serviceLabel: '메뉴',
    storyTitle: '익숙한 한 끼를, 조금 더 정성스럽게.',
    story:
      '좋은 재료를 고르고, 매일 손질하고, 주문과 함께 정성껏 준비합니다. 함께 먹는 시간이 편안한 기억으로 남기를 바랍니다.',
    accent: '#59623e',
    background: '#f5f2e9',
    ink: '#293024',
    items: [
      {
        name: '숙성 삼겹살',
        detail: '풍부한 육즙과 고소한 풍미 · 180g',
        price: '16,000원',
        category: '대표 메뉴',
      },
      {
        name: '정성 김치찌개',
        detail: '깊게 우린 국물과 넉넉한 한 그릇',
        price: '9,000원',
        category: '식사',
      },
      {
        name: '계절 한상',
        detail: '제철 반찬을 곁들인 오늘의 식사',
        price: '12,000원',
        category: '식사',
      },
    ],
    highlights: ['매일 준비하는 재료', '편안한 모임 공간', '정성으로 만든 메뉴'],
  },
  {
    slug: 'cafe',
    name: '에디토리얼 · 화보형',
    industry: '카페 · 베이커리 · 꽃집',
    english: 'SLOW AFTERNOON',
    brand: '느린 오후',
    headline: '잠깐의 쉼,\n충분한 취향.',
    tagline: '커피 한 잔에 담은 느린 시간.',
    description: '여백과 감각적인 오브제로 공간의 분위기와 브랜드 이야기를 전하는 디자인.',
    strength: '제품뿐 아니라 공간의 인상을 남기기 좋아 카페·공방·꽃집에 어울립니다.',
    consideration: '사진과 짧은 소개 문구를 함께 준비해야 분위기가 살아납니다.',
    serviceLabel: '메뉴·컬렉션',
    storyTitle: '당신의 오후에 머무는 작은 공간.',
    story:
      '창가로 들어오는 빛, 갓 내린 커피, 계절을 닮은 작은 오브제. 잠시 쉬어 갈 수 있는 편안한 공간을 준비합니다.',
    accent: '#a05437',
    background: '#f7eee3',
    ink: '#513626',
    items: [
      {
        name: '시그니처 라떼',
        detail: '부드러운 크림과 고소한 원두의 조화',
        price: '6,500원',
        category: '커피',
      },
      {
        name: '오늘의 베이커리',
        detail: '매일 아침 구워내는 작은 즐거움',
        price: '4,500원부터',
        category: '베이커리',
      },
      {
        name: '계절의 차',
        detail: '따뜻하게 또는 시원하게 즐기는 향',
        price: '6,000원',
        category: '음료',
      },
    ],
    highlights: ['직접 고른 원두', '계절을 담은 공간', '매일 굽는 베이커리'],
  },
  {
    slug: 'salon',
    name: '아틀리에 · 포트폴리오형',
    industry: '미용실 · 네일 · 피부관리',
    english: 'ONGYEOL STUDIO',
    brand: '온결 살롱',
    headline: '당신다운 아름다움,\n섬세하게.',
    tagline: '나에게 어울리는 스타일을 찾는 시간.',
    description: '시술 메뉴와 가격, 작업 사례, 전문가 소개를 차분하게 보여주는 디자인.',
    strength: '서비스별 가격과 특징을 비교하기 쉽고 외부 예약으로 자연스럽게 연결됩니다.',
    consideration:
      '시술 사진과 직원 소개 자료가 필요합니다. 예약 접수는 기존 예약 서비스로 연결합니다.',
    serviceLabel: '시술 안내',
    storyTitle: '잘 듣고, 세심하게 완성합니다.',
    story:
      '일상과 취향을 먼저 듣고, 각자의 분위기에 어울리는 스타일을 제안합니다. 충분한 상담과 섬세한 손길로 편안한 변화를 만듭니다.',
    accent: '#80636e',
    background: '#f8f0f1',
    ink: '#42323b',
    items: [
      {
        name: '디자인 커트',
        detail: '얼굴형과 일상에 맞춘 스타일 제안',
        price: '35,000원부터',
        category: '헤어',
      },
      {
        name: '퍼스널 컬러',
        detail: '피부 톤과 취향을 고려한 컬러 디자인',
        price: '90,000원부터',
        category: '컬러',
      },
      {
        name: '집중 케어',
        detail: '모발 상태에 맞춘 맞춤 관리',
        price: '60,000원부터',
        category: '케어',
      },
    ],
    highlights: ['충분한 스타일 상담', '가격과 소요시간 안내', '담당 디자이너 소개'],
  },
  {
    slug: 'fitness',
    name: '모션 · 프로그램형',
    industry: '헬스장 · PT · 필라테스 · 요가',
    english: 'MOVE YOUR EVERYDAY',
    brand: 'MOVE STUDIO',
    headline: '오늘의 움직임이\n내일의 나를.',
    tagline: '나의 속도로, 더 단단한 일상.',
    description: '강한 타이포그래피와 시설·프로그램 안내로 체험 상담을 유도하는 디자인.',
    strength: '시설·강사·프로그램을 한눈에 소개하고 체험 문의를 연결하기 좋습니다.',
    consideration:
      '시간표와 이용료를 꾸준히 관리해야 합니다. 회원권 결제와 출입 관리는 포함되지 않습니다.',
    serviceLabel: '프로그램',
    storyTitle: '혼자가 아닌, 함께 만드는 변화.',
    story:
      '운동 경험과 목표를 살펴 나에게 맞는 시작을 제안합니다. 꾸준히 움직일 수 있는 환경과 세심한 안내를 준비합니다.',
    accent: '#d3ef58',
    background: '#191f1b',
    ink: '#f0f3eb',
    items: [
      {
        name: '1:1 퍼스널 트레이닝',
        detail: '개인의 목표와 체력에 맞춘 운동 지도',
        price: '상담 후 안내',
        category: 'PT',
      },
      {
        name: '기초 체력 클래스',
        detail: '처음 시작하는 분을 위한 그룹 프로그램',
        price: '월 120,000원',
        category: '그룹',
      },
      {
        name: '자유 운동',
        detail: '나의 일정에 맞춰 이용하는 운동 공간',
        price: '월 70,000원',
        category: '시설 이용',
      },
    ],
    highlights: ['목표에 맞춘 프로그램', '쾌적한 운동 공간', '체험 상담 안내'],
  },
  {
    slug: 'market',
    name: '마켓 · 상품 안내형',
    industry: '마트 · 정육점 · 식자재 · 소매점',
    english: 'FRESH IN YOUR NEIGHBORHOOD',
    brand: '우리동네 마켓',
    headline: '가까이에서 만나는\n신선한 하루.',
    tagline: '오늘 필요한 좋은 것들을, 가까이.',
    description: '행사와 추천 상품을 카드로 정리하고 매장 방문을 안내하는 상품 소개형 디자인.',
    strength: '행사 상품·가격·행사 기간을 자주 바꾸는 매장에 적합합니다.',
    consideration:
      '상품·가격·행사 기간을 실제 운영에 맞게 갱신해야 합니다. 온라인 장바구니와 결제는 포함되지 않습니다.',
    serviceLabel: '상품·행사',
    storyTitle: '우리 동네의 일상을 채우는 곳.',
    story:
      '매일 필요한 식재료와 생활용품을 편하게 만날 수 있도록 신선함과 합리적인 가격을 생각합니다. 오늘의 추천 상품을 확인하고 방문해 주세요.',
    accent: '#207553',
    background: '#f1f7ef',
    ink: '#193f2d',
    items: [
      {
        name: '제철 과일 한 바구니',
        detail: '예시 행사 · 실제 판매 정보가 아닙니다',
        price: '9,900원',
        category: '신선 식품',
      },
      {
        name: '오늘의 채소 꾸러미',
        detail: '가정의 식탁을 채우는 신선한 구성',
        price: '5,900원',
        category: '신선 식품',
      },
      {
        name: '생활용품 모음',
        detail: '매장에서 만나는 실속 있는 선택',
        price: '매장 문의',
        category: '생활',
      },
    ],
    highlights: ['오늘의 추천 상품', '기간별 행사 안내', '주차·매장 위치 안내'],
  },
  {
    slug: 'professional',
    name: '파트너 · 상담형',
    industry: '세무사 · 회계사 · 노무사 · 전문 사무실',
    english: 'BAREUN PARTNERS',
    brand: '바른 파트너스',
    headline: '복잡한 고민에,\n명확한 방향을.',
    tagline: '사업의 다음 걸음, 함께 정리합니다.',
    description: '업무 분야와 전문가 소개, 진행 절차를 통해 신뢰를 쌓는 상담 중심 디자인.',
    strength: '사진이 많지 않아도 전문성과 업무 범위를 명확하게 전달할 수 있습니다.',
    consideration:
      '업무 설명과 자격·경력 자료가 중요합니다. 문의 단계에서는 필요한 정보만 받습니다.',
    serviceLabel: '업무 분야',
    storyTitle: '사업을 이해하고, 필요한 일을 분명하게.',
    story:
      '현재의 상황을 충분히 듣고 필요한 업무와 진행 순서를 안내합니다. 어려운 용어보다 이해하기 쉬운 설명으로 신뢰를 쌓아갑니다.',
    accent: '#295487',
    background: '#f3f5f9',
    ink: '#172d46',
    items: [
      {
        name: '사업자 세무 안내',
        detail: '신고 일정과 필요한 자료를 함께 확인',
        price: '상담 후 안내',
        category: '세무',
      },
      {
        name: '기장·회계 관리',
        detail: '사업 규모와 업무 범위에 맞춘 관리',
        price: '상담 후 안내',
        category: '회계',
      },
      {
        name: '사업 운영 상담',
        detail: '현재 상황과 다음 단계의 과제 정리',
        price: '상담 후 안내',
        category: '상담',
      },
    ],
    highlights: ['업무 범위 안내', '전문가 소개', '명확한 진행 절차'],
  },
  {
    slug: 'care',
    name: '케어 · 방문 안내형',
    industry: '병원 · 의원 · 약국',
    english: 'CARE, CLOSE TO YOU',
    brand: '이음 케어',
    headline: '가까이에서,\n편안하게 만나요.',
    tagline: '필요한 안내를 쉽고 명확하게.',
    description: '운영시간과 위치, 의료진 또는 약사 소개를 쉽게 찾을 수 있는 방문 안내형 디자인.',
    strength: '큰 글씨와 명확한 정보 순서로 방문 전 필요한 내용을 빠르게 전달합니다.',
    consideration:
      '병원과 약국의 실제 서비스에 맞게 항목을 구성합니다. 예시는 병원형이며 실제 의료기관 안내가 아닙니다.',
    serviceLabel: '이용 안내',
    storyTitle: '방문 전부터, 편안한 안내.',
    story:
      '운영시간과 위치, 이용 방법을 분명하게 안내합니다. 궁금한 사항은 전화로 확인해 주세요. 약국형으로 제작할 때는 약사 소개와 운영 안내 중심으로 구성합니다.',
    accent: '#287a85',
    background: '#edf7f6',
    ink: '#183e43',
    items: [
      {
        name: '이용시간 확인',
        detail: '방문 전 운영시간과 휴무를 확인하세요',
        price: '전화 문의',
        category: '방문 준비',
      },
      {
        name: '담당자 소개',
        detail: '의료진 또는 약사 소개가 들어가는 자리',
        price: '소개 안내',
        category: '소개',
      },
      {
        name: '첫 방문 안내',
        detail: '준비할 사항과 이용 절차를 안내합니다',
        price: '전화 문의',
        category: '이용 안내',
      },
    ],
    highlights: ['운영·휴무 안내', '의료진·약사 소개', '쉬운 위치 확인'],
  },
];

export function findTemplate(slug: string) {
  return templateCatalog.find((template) => template.slug === slug);
}

// Design identity and sample business content are independent. No industry lock.
export function demoContent(design: Template, business?: string): Template {
  const content = (business && findTemplate(business)) || design;
  return {
    ...content,
    slug: design.slug,
    name: design.name,
    accent: design.accent,
    background: design.background,
    ink: design.ink,
    artSlug: content.slug,
  };
}
