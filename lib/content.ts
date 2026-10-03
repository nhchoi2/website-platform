import { z } from 'zod';

const text = (max: number) => z.string().max(max);
const imageId = z.uuid().nullable();
export const contentSchema = z
  .object({
    template: z.enum(['hyehwa', 'cafe', 'salon', 'fitness', 'market', 'professional', 'care']),
    layout: z.enum(['classic', 'catalog']).optional(),
    options: z
      .object({
        pages: z.union([z.literal(1), z.literal(3), z.literal(4)]),
        nav: z.enum(['left', 'center', 'right']),
        mobileNav: z.enum(['expanded', 'hamburger']),
        features: z
          .array(
            z.enum([
              'gallery',
              'priceTable',
              'team',
              'schedule',
              'news',
              'process',
              'consult',
              'reserve',
              'place',
              'kakao',
              'notice',
              'faq',
              'top',
            ]),
          )
          .max(13),
        links: z
          .object({
            consult: z.url().max(500).optional(),
            reserve: z.url().max(500).optional(),
            place: z.url().max(500).optional(),
            kakao: z.url().max(500).optional(),
          })
          .refine(
            (v) => Object.values(v).every((x) => /^https:\/\//.test(x)),
            'HTTPS 주소만 사용할 수 있습니다.',
          ),
      })
      .optional(),
    logoId: imageId.optional(),
    iconId: imageId.optional(),
    serviceLabel: text(60).optional(),
    parking: text(500).optional(),
    notice: text(300).optional(),
    team: z
      .array(z.object({ id: z.uuid(), name: text(80), role: text(200), imageId }))
      .max(20)
      .optional(),
    schedule: z
      .array(z.object({ day: text(20), hours: text(200) }))
      .max(7)
      .optional(),
    faq: z
      .array(z.object({ id: z.uuid(), question: text(200), answer: text(2000) }))
      .max(30)
      .optional(),
    process: z
      .array(z.object({ id: z.uuid(), title: text(80), description: text(500) }))
      .max(10)
      .optional(),
    posts: z
      .array(
        z.object({
          id: z.uuid(),
          title: text(120),
          body: text(6000),
          date: z.iso.date(),
          attachments: z.array(z.uuid()).max(5),
        }),
      )
      .max(50)
      .optional(),
    map: z.object({ enabled: z.boolean(), query: text(500) }).optional(),
    theme: z.enum(['olive', 'charcoal', 'warm']),
    customTheme: z.boolean().optional(),
    name: text(80),
    tagline: text(160),
    introduction: text(4000),
    address: text(300),
    phone: text(60),
    hours: text(1000),
    links: z
      .array(
        z.object({
          id: z.uuid(),
          label: text(50),
          url: z
            .url()
            .max(1000)
            .refine((v) => /^https?:\/\//i.test(v), 'http 또는 https 주소를 입력하세요.'),
        }),
      )
      .max(10),
    photos: z.array(z.object({ id: z.uuid(), assetId: z.uuid(), alt: text(200) })).max(30),
    menus: z
      .array(
        z.object({
          id: z.uuid(),
          name: text(100),
          price: text(50),
          description: text(500),
          category: text(80),
          imageId,
          featured: z.boolean(),
        }),
      )
      .max(100),
  })
  .refine(
    (v) => new TextEncoder().encode(JSON.stringify(v)).length <= 150000,
    '콘텐츠 전체 용량이 너무 큽니다. 공지 내용이나 항목 수를 줄여 주세요.',
  );
export type Content = z.infer<typeof contentSchema>;
export const emptyContent = (): Content => ({
  template: 'hyehwa',
  theme: 'olive',
  name: '',
  tagline: '',
  introduction: '',
  address: '',
  phone: '',
  hours: '',
  links: [],
  photos: [],
  menus: [],
});
export function assetIds(content: Content): string[] {
  return [
    ...new Set([
      ...content.photos.map((p) => p.assetId),
      ...content.menus.flatMap((m) => (m.imageId ? [m.imageId] : [])),
      ...[content.logoId, content.iconId].filter((x): x is string => !!x),
      ...(content.team || []).flatMap((x) => (x.imageId ? [x.imageId] : [])),
      ...(content.posts || []).flatMap((x) => x.attachments),
    ]),
  ];
}
export const statusLabels: Record<string, string> = {
  pending: '검수 대기',
  changes_requested: '보완 요청',
  published: '게시 완료',
};
export function contentDiff(before: Content | null, after: Content) {
  const fields: [keyof Content, string][] = [
    ['name', '매장명'],
    ['tagline', '한 줄 소개'],
    ['introduction', '매장 소개'],
    ['address', '주소'],
    ['phone', '연락처'],
    ['hours', '영업시간'],
    ['theme', '색상'],
    ['customTheme', '사용자 색상 적용'],
    ['template', '템플릿'],
    ['layout', '디자인 구성'],
    ['options', '페이지·기능 설정'],
    ['logoId', '로고'],
    ['iconId', '브라우저 탭 아이콘'],
    ['serviceLabel', '메뉴 제목'],
    ['parking', '휴무·주차'],
    ['notice', '상단 안내'],
    ['team', '담당자 소개'],
    ['schedule', '시간표'],
    ['faq', '자주 묻는 질문'],
    ['process', '이용 절차'],
    ['posts', '공지·첨부'],
    ['map', '지도'],
    ['links', '외부 링크'],
    ['photos', '사진 / 순서'],
    ['menus', '메뉴 / 대표 메뉴'],
  ];
  return fields
    .filter(([key]) => JSON.stringify(before?.[key] ?? null) !== JSON.stringify(after[key] ?? null))
    .map(([key, label]) => ({ key, label, before: before?.[key] ?? null, after: after[key] }));
}
