import Link from 'next/link';
import { PageIntro, StartCTA } from '@/components/marketing/SiteShell';
import { TemplateCard } from '@/components/marketing/TemplateCard';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '음식점 홈페이지 템플릿',
  '혜화의 간결한 디자인을 바탕으로 만든 음식점 홈페이지 템플릿. 메뉴, 매장 사진, 영업시간과 위치를 한 페이지에 담으세요.',
  '/templates',
);
export default function Templates() {
  return (
    <main id="main" className="m-container">
      <PageIntro label="TEMPLATES / 01" title="좋은 시작이 되는 디자인.">
        현재 선택할 수 있는 템플릿은 혜화 1종입니다.
        <br />
        사진과 글, 세 가지 색상으로 우리 가게의 분위기를 담아보세요.
      </PageIntro>
      <div className="m-template-list">
        <TemplateCard />
        <div className="m-template-info">
          <p className="m-kicker">WHAT YOU CAN EDIT</p>
          <h2>
            내용은 자유롭게,
            <br />
            구성은 깔끔하게.
          </h2>
          <ul className="m-checklist">
            <li>매장명·소개·사진·영업시간·위치</li>
            <li>메뉴 사진·이름·가격·카테고리</li>
            <li>대표 메뉴와 외부 링크</li>
            <li>올리브·차콜·웜 색상</li>
          </ul>
          <p>
            사진 순서를 바꾸고 메뉴를 추가할 수 있습니다. 화면의 섹션 배치는 템플릿에 맞춰
            유지됩니다.
          </p>
          <Link className="m-button" href="/account">
            이 템플릿으로 시작하기 ↗
          </Link>
        </div>
      </div>
      <StartCTA />
    </main>
  );
}
