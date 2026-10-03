import { pricing } from '@/components/marketing/content';
import type { Template } from './catalog';

export const featureOptions = [
  {
    id: 'consult',
    label: '상담 플로팅 버튼',
    description: '화면 하단에 상담 버튼을 고정합니다.',
    floating: true,
  },
  {
    id: 'reserve',
    label: '예약 플로팅 버튼',
    description: '네이버 예약 등 외부 예약 페이지로 연결합니다.',
    floating: true,
  },
  {
    id: 'place',
    label: '플레이스·길찾기 버튼',
    description: '매장 플레이스나 지도 페이지로 연결합니다.',
    floating: true,
  },
  {
    id: 'kakao',
    label: '카카오 상담 버튼',
    description: '고객의 카카오 채널·오픈채팅 링크로 연결합니다.',
    floating: true,
  },
  {
    id: 'notice',
    label: '상단 안내 배너',
    description: '휴무·행사·방문 안내를 모든 페이지에 표시합니다.',
    floating: false,
  },
  {
    id: 'faq',
    label: '자주 묻는 질문',
    description: '방문 안내에 펼쳐 볼 수 있는 질문을 추가합니다.',
    floating: false,
  },
  {
    id: 'top',
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
  return { pages: query.pages === '3' ? 3 : query.pages === '4' ? 4 : 1, features, links };
}
export function optionsQuery(options: PreviewOptions) {
  const params = new URLSearchParams({ pages: String(options.pages) });
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
  return { base: pricing.setup, needsQuote: options.pages !== 1 || options.features.length > 0 };
}
export function inquiryHref(template: Template, options: PreviewOptions) {
  const chosen = featureOptions.filter((f) => options.features.includes(f.id)).map((f) => f.label);
  const body = [
    `템플릿: ${template.name} (${template.industry})`,
    `페이지 구성: ${options.pages === 1 ? '원페이지 · 메뉴 클릭 시 섹션 이동' : `${options.pages}페이지 · 독립 페이지 이동`}`,
    `선택 기능: ${chosen.join(', ') || '기본 구성'}`,
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
  return `mailto:koofylab@gmail.com?${new URLSearchParams({ subject: `[홈페이지 제작 문의] ${template.name}`, body })}`;
}
