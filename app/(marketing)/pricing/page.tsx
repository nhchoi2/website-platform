import { PageIntro, contactUrl } from '@/components/marketing/SiteShell';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '홈페이지 제작 비용과 관리 범위',
  '음식점 홈페이지 제작·운영에 포함되는 내용과 별도 확인할 비용을 안내합니다. 제작비와 관리비는 필요한 범위에 따라 상담 후 안내합니다.',
  '/pricing',
);
export default function Pricing() {
  return (
    <main id="main" className="m-container">
      <PageIntro label="PRICING & SCOPE" title="범위를 알고, 시작하세요.">
        가게에 필요한 내용과 운영 방식을 확인한 뒤<br />
        제작비와 관리비를 안내합니다.
      </PageIntro>
      <div className="m-pricing-grid">
        <section className="m-price-card">
          <p className="m-kicker">RESTAURANT WEBSITE</p>
          <h2>템플릿 기반 제작·관리</h2>
          <p className="m-price">상담 후 안내</p>
          <p>
            공개된 정액 요금은 아직 없습니다.
            <br />
            금액과 제공 범위는 작업 시작 전에 확인합니다.
          </p>
          <a className="m-button" href={contactUrl}>
            제작·관리 비용 문의하기 ↗
          </a>
        </section>
        <section className="m-scope">
          <h2>서비스에서 제공하는 기능</h2>
          <ul className="m-checklist">
            <li>음식점 템플릿과 모바일 대응</li>
            <li>사진·메뉴·매장 정보 직접 편집</li>
            <li>초안 저장과 비공개 미리보기</li>
            <li>게시 요청·운영자 검수·승인 게시</li>
            <li>이전 공개 버전 복구</li>
            <li>고객 소유 도메인 연결 지원</li>
          </ul>
        </section>
      </div>
      <section className="m-section">
        <h2>상담할 때 함께 확인해요.</h2>
        <div className="m-info-grid">
          <article>
            <span>01</span>
            <h3>제작과 관리 범위</h3>
            <p>
              초기 콘텐츠 입력 지원, 수정 지원, 검수와 운영 범위 및 일정을 확인합니다. 직접 편집할
              부분과 도움이 필요한 부분을 알려주세요.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>별도 비용</h3>
            <p>
              고객 도메인 구매·갱신 비용은 별도입니다. 사진 촬영·원고 작성 등 추가 작업과 운영
              비용은 필요 여부를 먼저 협의합니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>지원하지 않는 기능</h3>
            <p>
              온라인 주문·결제·자체 예약 시스템은 포함되지 않습니다. 사용 중인 예약 서비스나 SNS는
              외부 링크로 안내할 수 있습니다.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
