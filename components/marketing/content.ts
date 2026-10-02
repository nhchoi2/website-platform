// Koofy Lab's public project catalogue, verified 2026-10-02.
// Apply owner corrections to brand lettering, names and operating status.
export const projects = [
  {
    slug: 'tax-lab',
    name: "THE KEVIN'S TAX LAB",
    category: '제작 사례',
    description: '세무 회계, 컨설팅, 기업 성장 지원을 전문적으로 보여주는 랜딩 사이트입니다.',
    image: '/marketing/projects/tax-lab.webp',
    alt: "THE KEVIN'S TAX LAB 브랜드 표기를 정정한 소개 이미지",
    href: 'https://www.koofy.co.kr/products/tax-lab',
  },
  {
    slug: 'yongs-dining',
    name: "Yong's Dining",
    category: '제작 사례',
    description:
      '두부요리, 공간 분위기, 메뉴 아이덴티티, 로컬 다이닝 감각을 담은 식당 소개 페이지입니다.',
    image: '/marketing/projects/yongs-dining.webp',
    alt: "Yong's Dining 대표 웹사이트 이미지",
    href: 'https://www.koofy.co.kr/products/yongs-dining',
  },
  {
    slug: 'oren-gym',
    name: 'Oren Gym',
    category: '과거 제작 사례',
    statusNote: '현재 웹사이트 운영은 종료되었으며, 제작 당시 디자인을 소개합니다.',
    description: '트레이닝, 집중, 힘, 결과를 강하게 전달하는 고대비 피트니스 브랜드 페이지입니다.',
    image: '/marketing/projects/oren-gym.webp',
    alt: 'Oren Gym 대표 웹사이트 이미지',
    href: 'https://www.koofy.co.kr/products/oren-gym',
  },
  {
    slug: 'intranet',
    name: 'Intranet System',
    category: '콘셉트',
    description:
      '공지, 일정, 문서, 업무, 리포트를 한 화면에서 관리하는 맞춤형 내부 대시보드 콘셉트입니다.',
    image: '/marketing/projects/intranet.webp',
    alt: 'Intranet System 대표 웹앱 이미지',
    href: 'https://www.koofy.co.kr/products/intranet',
  },
] as const;

// Proposed entry prices, VAT-inclusive. Research and scope: docs/pricing-basis.md.
// This is display content, not payment or subscription configuration.
export const pricing = { setup: 390_000, monthly: 33_000 };
export function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}
