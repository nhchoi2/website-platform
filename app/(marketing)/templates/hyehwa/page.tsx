import Link from 'next/link';
import { emptyContent } from '@/lib/content';
import { Restaurant } from '@/templates/hyehwa/Restaurant';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '혜화 음식점 템플릿 미리보기',
  '혜화 음식점 템플릿의 실제 화면을 예시 콘텐츠로 확인하세요. 올리브, 차콜, 웜 색상을 선택해 볼 수 있습니다.',
  '/templates/hyehwa',
);
const photo = '00000000-0000-4000-8000-000000000001';
export default async function HyehwaDemo({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme: requested } = await searchParams;
  const theme = requested === 'charcoal' || requested === 'warm' ? requested : 'olive';
  const content = {
    ...emptyContent(),
    theme,
    name: '담백한 식탁',
    tagline: '좋은 한 끼, 좋은 이야기.',
    introduction:
      '정성껏 준비한 음식과 편안한 공간으로 하루의 작은 쉼을 전합니다.\n이 화면은 템플릿 소개를 위한 예시입니다. 매장 정보와 메뉴는 고객의 실제 정보로 바꿔 사용할 수 있습니다.',
    address: '실제 매장 주소가 들어가는 자리입니다.',
    hours: '실제 영업시간이 들어가는 자리입니다.',
    photos: [{ id: photo, assetId: photo, alt: '삼겹살과 김치 — 템플릿 예시 사진' }],
    menus: [
      {
        id: '00000000-0000-4000-8000-000000000002',
        name: '대표 메뉴 예시',
        price: '가격 입력',
        description: '메뉴의 특징과 구성을 소개하는 문장이 들어갑니다.',
        category: '식사',
        imageId: photo,
        featured: true,
      },
    ],
  } as const;
  return (
    <div id="main">
      <div className="m-container m-demo-toolbar">
        <div>
          <strong>혜화 · 담백한 식탁</strong>
          <p>예시 콘텐츠입니다. 실제 매장 안내가 아닙니다.</p>
        </div>
        <nav aria-label="템플릿 색상">
          {(
            [
              ['olive', '올리브'],
              ['charcoal', '차콜'],
              ['warm', '웜'],
            ] as const
          ).map(([value, label]) => (
            <Link
              key={value}
              href={`/templates/hyehwa?theme=${value}`}
              aria-current={theme === value ? 'true' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/account" className="m-button m-small">
          이 템플릿으로 시작 ↗
        </Link>
      </div>
      <Restaurant
        content={{ ...content, photos: [...content.photos], menus: [...content.menus] }}
        siteId="template-demo"
        sampleImages={{ [photo]: '/marketing/hyehwa-food.jpeg' }}
      />
    </div>
  );
}
