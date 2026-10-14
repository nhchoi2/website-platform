import { z } from 'zod';

export const proposalStyles = [
  {
    id: 'yongs',
    letter: 'A',
    name: '용스 스타일',
    subtitle: '사진으로 먼저 만나는 우리 가게',
    description:
      '큰 음식 사진, 부드러운 배경과 빨간 포인트. 용스다이닝의 사진 중심 구성과 소개 흐름을 반영했습니다.',
    strength: '음식과 매장 분위기를 함께 보여주기 좋습니다.',
    consideration: '대표 사진의 품질이 첫인상에 큰 영향을 줍니다.',
  },
  {
    id: 'bamboo',
    letter: 'B',
    name: '대나무 정원',
    subtitle: '숙성과 공간의 이야기를 차분하게',
    description:
      '대나무를 닮은 녹색과 따뜻한 종이색. 여백이 있는 화면과 정돈된 메뉴 목록으로 가게의 이야기를 전합니다.',
    strength: '대나무 초벌·숙성이라는 매장의 특징을 강조합니다.',
    consideration: '강한 홍보 느낌보다 차분한 브랜드 소개에 어울립니다.',
  },
  {
    id: 'grill',
    letter: 'C',
    name: '대통령 그릴',
    subtitle: '한눈에 들어오는 메뉴와 가격',
    description:
      '검정과 노란색의 선명한 대비. 큰 제목, 음식 사진과 세트 가격을 중심으로 구성했습니다.',
    strength: '세트 구성과 대표 메뉴를 빠르게 살펴보기 좋습니다.',
    consideration: '다른 두 시안보다 강하고 활기찬 인상을 줍니다.',
  },
] as const;
export type ProposalStyle = (typeof proposalStyles)[number]['id'];
export type ProposalPage = 'home' | 'menu' | 'visit';
export const proposalTokenSchema = z.string().regex(/^[a-f0-9]{48}$/);
export const proposalStyleSchema = z.enum(['yongs', 'bamboo', 'grill']);
export const proposalImageSchema = z.object({
  id: z.uuid(),
  label: z.string().max(200),
  width: z.number().int().positive().max(2400),
  height: z.number().int().positive().max(2400),
});
export const proposalContentSchema = z
  .object({
    name: z.string().min(1).max(120),
    shortName: z.string().min(1).max(80),
    tagline: z.string().max(200),
    introduction: z.string().max(6000),
    address: z.string().max(300),
    phone: z.string().max(60),
    hours: z.string().max(1000),
    parking: z.string().max(1000),
    links: z.object({
      place: z.url().startsWith('https://'),
      instagram: z.url().startsWith('https://'),
      kakao: z.url().startsWith('https://').nullable(),
    }),
    heroIds: z.array(z.uuid()).min(1).max(4),
    interiorIds: z.array(z.uuid()).max(12),
    exteriorIds: z.array(z.uuid()).max(4),
    storyIds: z.array(z.uuid()).min(3).max(6),
    menus: z
      .array(
        z.object({
          id: z.string().max(80),
          name: z.string().max(120),
          category: z.string().max(60),
          price: z.number().int().min(0).max(10000000),
          description: z.string().max(1000),
          featured: z.boolean(),
          imageId: z.uuid(),
        }),
      )
      .min(1)
      .max(100),
    images: z.array(proposalImageSchema).min(1).max(200),
    sourceDate: z.string().max(30),
    notes: z.array(z.string().max(500)).max(10),
  })
  .superRefine((content, ctx) => {
    const ids = new Set(content.images.map((image) => image.id));
    if (ids.size !== content.images.length)
      ctx.addIssue({ code: 'custom', message: '사진 ID가 중복됩니다.' });
    for (const id of [
      ...content.heroIds,
      ...content.interiorIds,
      ...content.exteriorIds,
      ...content.storyIds,
      ...content.menus.map((menu) => menu.imageId),
    ])
      if (!ids.has(id))
        ctx.addIssue({ code: 'custom', message: '등록하지 않은 사진을 참조합니다.' });
  });
export type ProposalContent = z.infer<typeof proposalContentSchema>;
export type ProposalRecord = {
  id: string;
  content: ProposalContent;
  selection: ProposalStyle | null;
};
export type ProposalPhoto = z.infer<typeof proposalImageSchema> & {
  small: string;
  src: string;
  smallFallback: string;
  fullFallback: string;
};
export type ProposalPhotos = Record<string, ProposalPhoto>;

export function proposalRoute(segments: string[] = []) {
  if (!segments.length) return { style: null, page: 'home' as ProposalPage };
  const style = proposalStyleSchema.safeParse(segments[0]);
  const page = segments[1] || 'home';
  if (!style.success || segments.length > 2 || !['home', 'menu', 'visit'].includes(page))
    return null;
  return { style: style.data, page: page as ProposalPage };
}
