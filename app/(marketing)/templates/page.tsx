import { PageIntro } from '@/components/marketing/SiteShell';
import { TemplateCatalog } from '@/components/marketing/TemplateCatalog';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '웹페이지 템플릿 안내',
  '음식점, 카페, 미용실, 헬스장, 마트, 전문 사무실, 병원·약국을 위한 7가지 제작 예시. 원페이지·3페이지·4페이지와 추가 기능을 직접 비교하세요.',
  '/templates',
);
export default function Templates() {
  return (
    <main id="main" className="m-container">
      <PageIntro label="TEMPLATES / 07" title="내 사업에 어울리는 홈페이지.">
        업종에 맞는 디자인을 고르고, 필요한 페이지와 기능을 직접 확인하세요.
        <br />
        회원가입 없이 둘러보고 선택한 구성으로 제작을 문의할 수 있습니다.
      </PageIntro>
      <aside className="m-catalog-note">
        <p>
          <strong>원페이지도 메뉴가 있습니다.</strong> 메뉴를 누르면 같은 화면 안의
          소개·서비스·위치로 이동합니다. 3·4페이지 구성은 각각의 주소로 이동합니다.
        </p>
        <p>
          7종의 제작 상담용 예시입니다. 기본 원페이지 39만 원부터(부가세 포함), 추가 페이지·기능
          비용은 상담 후 확정합니다.
        </p>
      </aside>
      <TemplateCatalog />
    </main>
  );
}
