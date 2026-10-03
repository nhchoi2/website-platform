export const designDetails: Record<
  string,
  {
    flow: string;
    recommended: string[];
    reference: { name: string; url: string; observation: string };
  }
> = {
  hyehwa: {
    flow: '음식과 한 줄 소개 → 메뉴·가격 목록 → 매장 이야기 → 방문 안내',
    recommended: ['hyehwa', 'cafe', 'market'],
    reference: {
      name: '기존 혜화 프로젝트',
      url: '/templates/hyehwa/classic',
      observation: '음식 사진, 메뉴, 위치를 쉽게 찾는 기존 고객 사이트의 구성을 바탕으로 합니다.',
    },
  },
  cafe: {
    flow: '넓은 화보 → 브랜드 이야기 → 컬렉션 목록 → 공간·방문 안내',
    recommended: ['cafe', 'salon', 'hyehwa'],
    reference: {
      name: '테라로사',
      url: 'https://terarosa.com/',
      observation:
        '큰 비주얼과 컬렉션, 브랜드 이야기와 매장 안내를 분리하는 정보 구성을 참고했습니다.',
    },
  },
  salon: {
    flow: '스타일 화보 → 분류별 작업·시술 → 상담 원칙 → 방문 안내',
    recommended: ['salon', 'cafe', 'fitness'],
    reference: {
      name: '차홍 살롱',
      url: 'https://chahongsalon.com/',
      observation: '스타일 화보와 스타일별 분류, 외부 예약 경로를 참고했습니다.',
    },
  },
  fitness: {
    flow: '큰 타이포그래피 → 프로그램 비교 → 이용 시작 순서 → 시설·방문 안내',
    recommended: ['fitness', 'salon', 'care'],
    reference: {
      name: '스포애니',
      url: 'https://www.spoany.co.kr/',
      observation:
        '운동 프로그램, 시설과 지점 정보, 운영 공지의 구분을 단일 매장 규모로 적용했습니다.',
    },
  },
  market: {
    flow: '행사 안내판 → 카테고리 필터·상품 카드 → 매장 정보 → 방문 안내',
    recommended: ['market', 'hyehwa', 'cafe'],
    reference: {
      name: '마트킹',
      url: 'https://www.martking.co.kr/',
      observation:
        '기간별 행사와 매장 운영·주차 안내를 참고했습니다. 온라인 쇼핑몰 기능은 포함하지 않습니다.',
    },
  },
  professional: {
    flow: '상담 주제와 업무 바로가기 → 분야별 상세 설명 → 업무 원칙 → 상담·방문 안내',
    recommended: ['professional', 'care', 'fitness'],
    reference: {
      name: '세무법인 한영 신우지점',
      url: 'https://www.shinwootax.com/',
      observation: '필요한 상담 주제, 업무 범위, 전문가 소개와 상담 절차의 순서를 참고했습니다.',
    },
  },
  care: {
    flow: '운영시간·방문 준비 바로가기 → 이용 안내 펼치기 → 소개 → 위치·문의',
    recommended: ['care', 'professional', 'salon'],
    reference: {
      name: '서울아이앤여성의원',
      url: 'https://www.in-fertilityclinic.com/index.do',
      observation:
        '의료진 소개, 진료시간·접수 마감·위치 안내의 분리를 참고했습니다. 예시에는 의료 효능이나 실제 의료진 정보를 넣지 않았습니다.',
    },
  },
};
