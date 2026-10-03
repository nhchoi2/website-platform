import { pricing } from '@/components/marketing/content';
import { findTemplate, type Template } from './catalog';

export const featureOptions = [
  {
    id: 'gallery',
    cost: 'paid',
    label: '사진 갤러리',
    description: '공간·작업 사진을 크게 열고 넘겨 볼 수 있습니다.',
    floating: false,
  },
  {
    id: 'priceTable',
    cost: 'included',
    label: '가격·서비스 비교표',
    description: '메뉴·상품·서비스 가격과 설명을 한눈에 비교합니다.',
    floating: false,
  },
  {
    id: 'team',
    cost: 'included',
    label: '직원·전문가 소개',
    description: '담당자와 역할을 소개하는 영역을 추가합니다.',
    floating: false,
  },
  {
    id: 'schedule',
    cost: 'included',
    label: '요일별 운영·시간표',
    description: '요일을 선택해 운영시간과 프로그램을 확인합니다.',
    floating: false,
  },
  {
    id: 'news',
    cost: 'paid',
    label: '공지·소식 게시판',
    description:
      '공지 목록을 확인할 수 있습니다. 고객 관리 화면에서 글과 첨부를 편집하고 승인 후 공개합니다.',
    floating: false,
  },
  {
    id: 'process',
    cost: 'included',
    label: '이용·상담 절차',
    description: '처음 문의한 뒤 이용하기까지의 순서를 설명합니다.',
    floating: false,
  },
  {
    id: 'consult',
    cost: 'paid',
    label: '상담 플로팅 버튼',
    description: '화면 하단에 상담 버튼을 고정합니다.',
    floating: true,
  },
  {
    id: 'reserve',
    cost: 'paid',
    label: '예약 플로팅 버튼',
    description: '네이버 예약 등 외부 예약 페이지로 연결합니다.',
    floating: true,
  },
  {
    id: 'place',
    cost: 'paid',
    label: '플레이스·길찾기 버튼',
    description: '매장 플레이스나 지도 페이지로 연결합니다.',
    floating: true,
  },
  {
    id: 'kakao',
    cost: 'paid',
    label: '카카오 상담 버튼',
    description: '고객의 카카오 채널·오픈채팅 링크로 연결합니다.',
    floating: true,
  },
  {
    id: 'notice',
    cost: 'paid',
    label: '상단 안내 배너',
    description: '휴무·행사·방문 안내를 모든 페이지에 표시합니다.',
    floating: false,
  },
  {
    id: 'faq',
    cost: 'included',
    label: '자주 묻는 질문',
    description: '방문 안내에 펼쳐 볼 수 있는 질문을 추가합니다.',
    floating: false,
  },
  {
    id: 'top',
    cost: 'included',
    label: '맨 위로 버튼',
    description: '스크롤 후 화면 위로 돌아가는 버튼입니다.',
    floating: true,
  },
] as const;
export type FeatureId = (typeof featureOptions)[number]['id'];
export type PageCount = 1 | 3 | 4;
export type DemoPage = 'home' | 'about' | 'services' | 'visit';
export type PreviewOptions = {
  pages: PageCount;
  business?: string;
  nav?: 'left' | 'center' | 'right';
  mobileNav?: 'expanded' | 'hamburger';
  features: FeatureId[];
  links: Partial<Record<FeatureId, string>>;
};
export type Query = Record<string, string | string[] | undefined>;
export function safeExternalLink(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || value.length > 500) return '';
    return url.href;
  } catch {
    return '';
  }
}
export function parseOptions(query: Query): PreviewOptions {
  const raw = typeof query.features === 'string' ? query.features.split(',') : [];
  const features = featureOptions
    .filter((option) => raw.includes(option.id))
    .map((option) => option.id);
  const links: PreviewOptions['links'] = {};
  for (const option of featureOptions.filter((option) => option.floating)) {
    const value = query[option.id];
    if (typeof value === 'string' && safeExternalLink(value))
      links[option.id] = safeExternalLink(value);
  }
  const business =
    typeof query.business === 'string' && findTemplate(query.business) ? query.business : undefined;
  return {
    pages: query.pages === '3' ? 3 : query.pages === '4' ? 4 : 1,
    features,
    links,
    ...(business ? { business } : {}),
    ...(['left', 'center', 'right'].includes(String(query.nav))
      ? { nav: query.nav as PreviewOptions['nav'] }
      : {}),
    ...(['expanded', 'hamburger'].includes(String(query.mobileNav))
      ? { mobileNav: query.mobileNav as PreviewOptions['mobileNav'] }
      : {}),
  };
}
export function optionsQuery(options: PreviewOptions) {
  const params = new URLSearchParams({ pages: String(options.pages) });
  if (options.nav) params.set('nav', options.nav);
  if (options.mobileNav) params.set('mobileNav', options.mobileNav);
  if (options.business && findTemplate(options.business)) params.set('business', options.business);
  if (options.features.length) params.set('features', options.features.join(','));
  for (const [key, value] of Object.entries(options.links)) {
    if (options.features.includes(key as FeatureId) && safeExternalLink(value))
      params.set(key, safeExternalLink(value));
  }
  return params.toString();
}
export function demoPages(pages: PageCount, template: Template) {
  const list: { id: DemoPage; label: string }[] = [{ id: 'home', label: '홈' }];
  if (pages === 4) list.push({ id: 'about', label: '소개' });
  list.push({ id: 'services', label: template.serviceLabel }, { id: 'visit', label: '방문·문의' });
  return list;
}
export function previewHref(slug: string, page: DemoPage, options: PreviewOptions) {
  return `/template-preview/${slug}${page === 'home' ? '' : `/${page}`}?${optionsQuery(options)}`;
}
export function quoteSummary(options: PreviewOptions) {
  // Multi-page and option prices have not been approved by the owner.
  return {
    base: pricing.setup,
    needsQuote:
      options.pages !== 1 ||
      featureOptions.some((f) => f.cost === 'paid' && options.features.includes(f.id)),
  };
}
export function inquiryHref(template: Template, options: PreviewOptions) {
  const chosen = featureOptions.filter((f) => options.features.includes(f.id));
  const body = [
    `디자인: ${template.name}`,
    `예시 콘텐츠 업종: ${(options.business && findTemplate(options.business)?.industry) || template.industry} (다른 업종에도 적용 가능)`,
    `페이지 구성: ${options.pages === 1 ? '원페이지 · 메뉴 클릭 시 섹션 이동' : `${options.pages}페이지 · 독립 페이지 이동`}`,
    `기본 포함 선택: ${
      chosen
        .filter((f) => f.cost === 'included')
        .map((f) => f.label)
        .join(', ') || '기본 구성'
    }`,
    `유료 추가 선택: ${
      chosen
        .filter((f) => f.cost === 'paid')
        .map((f) => f.label)
        .join(', ') || '없음'
    }`,
    `메뉴 위치: ${options.nav === 'left' ? '왼쪽' : options.nav === 'center' ? '가운데' : '오른쪽'}`,
    `모바일 메뉴: ${options.mobileNav === 'hamburger' ? '메뉴 버튼' : '펼쳐보기'}`,
    '추가 페이지·기능 비용: 상담 후 확정',
    ...Object.entries(options.links)
      .filter(
        ([key, value]) => options.features.includes(key as FeatureId) && safeExternalLink(value),
      )
      .map(([key, value]) => `${featureOptions.find((f) => f.id === key)?.label}: ${value}`),
    '',
    '업종 / 상호:',
    '필요한 제작 내용:',
  ].join('\n');
  return `mailto:koofylab@gmail.com?subject=${encodeURIComponent(`[홈페이지 제작 문의] ${template.name}`)}&body=${encodeURIComponent(body)}`;
}

export function consultationHref(template: Template, options: PreviewOptions) {
  return `/contact?template=${encodeURIComponent(template.slug)}&${optionsQuery(options)}`;
}
