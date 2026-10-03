import type { Template } from './catalog';
type DemoPhoto = { src: string; small: string; alt: string };
type PhotoSet = { hero: DemoPhoto; items: DemoPhoto[] };
function photo(file: string, alt: string): DemoPhoto {
  return {
    src: `/template-images/${file}.webp`,
    small: `/template-images/${file}-small.webp`,
    alt,
  };
}
export const templateImageSets: Record<string, PhotoSet> = {
  hyehwa: {
    hero: photo('hyehwa', '노릇하게 구운 삼겹살과 쌈 채소'),
    items: [
      photo('hyehwa', '숙성 삼겹살 한 접시'),
      photo('hyehwa-1', '두부와 돼지고기가 들어간 김치찌개'),
      photo('hyehwa-2', '생선구이와 계절 반찬 한상'),
    ],
  },
  cafe: {
    hero: photo('cafe', '햇살이 들어오는 카페의 라떼와 크루아상'),
    items: [
      photo('cafe', '라떼 아트가 올라간 시그니처 라떼'),
      photo('cafe-1', '크루아상과 사워도우 베이커리'),
      photo('cafe-2', '감귤을 곁들인 계절 차'),
    ],
  },
  salon: {
    hero: photo('salon', '아치형 거울과 따뜻한 조명의 미용실'),
    items: [
      photo('salon-0', '단정한 단발 커트 스타일'),
      photo('salon-1', '체스트넛 컬러의 웨이브 헤어'),
      photo('salon-2', '헤어 케어 제품과 브러시'),
    ],
  },
  fitness: {
    hero: photo('fitness', '덤벨과 운동 기구가 갖춰진 트레이닝 공간'),
    items: [
      photo('fitness-0', '트레이너와 함께하는 덤벨 운동'),
      photo('fitness-1', '매트에서 함께하는 스트레칭 클래스'),
      photo('fitness', '자유 운동을 위한 웨이트 공간'),
    ],
  },
  market: {
    hero: photo('market', '동네 마트에 진열된 제철 과일'),
    items: [
      photo('market', '사과와 감귤, 배가 담긴 과일 진열대'),
      photo('market-1', '신선한 채소 꾸러미'),
      photo('market-2', '주방 세제와 수건 등 생활용품'),
    ],
  },
  professional: {
    hero: photo('professional', '차분한 분위기의 세무·회계 상담 공간'),
    items: [
      photo('professional', '방문 상담을 위한 회의실'),
      photo('professional-1', '계산기와 서류를 준비한 업무 책상'),
      photo('professional-2', '사업 운영 상담 장면'),
    ],
  },
  care: {
    hero: photo('care', '밝고 편안한 접수·대기 공간'),
    items: [
      photo('care', '방문자를 맞이하는 접수 공간'),
      photo('care-1', '차분한 개별 상담실'),
      photo('care-2', '방문 안내를 준비한 접수대'),
    ],
  },
};
// Content choice determines imagery; design choice determines layout and palette.
export function templatePhotos(template: Template): PhotoSet {
  return templateImageSets[template.artSlug || template.slug] || templateImageSets.hyehwa;
}
