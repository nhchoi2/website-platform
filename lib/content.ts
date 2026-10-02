import { z } from 'zod';

const text = (max: number) => z.string().max(max);
const imageId = z.uuid().nullable();
export const contentSchema = z.object({
  template: z.literal('hyehwa'),
  theme: z.enum(['olive', 'charcoal', 'warm']),
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
});
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
    ['links', '외부 링크'],
    ['photos', '사진 / 순서'],
    ['menus', '메뉴 / 대표 메뉴'],
  ];
  return fields
    .filter(([key]) => JSON.stringify(before?.[key] ?? null) !== JSON.stringify(after[key]))
    .map(([key, label]) => ({ key, label, before: before?.[key] ?? null, after: after[key] }));
}
