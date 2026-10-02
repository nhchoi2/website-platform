import { PageIntro, contactUrl } from '@/components/marketing/SiteShell';
import { pricing, formatWon } from '@/components/marketing/content';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '홈페이지 제작 비용과 관리 범위',
  `음식점 홈페이지 기본 제작 ${formatWon(pricing.setup)}부터, 운영·관리 월 ${formatWon(pricing.monthly)}부터. 포함 범위와 별도 비용을 확인하세요.`,
  '/pricing',
);
export default function Pricing() {
  return (
    <main id="main" className="m-container">
      <PageIntro label="PRICING & SCOPE" title="시작 비용도, 운영 비용도 한눈에.">
        처음 만드는 비용과 꾸준히 관리하는 비용을 나누어 안내합니다.
        <br />
        우리 가게에 필요한 범위를 확인하고 시작하세요.
      </PageIntro>
      <p className="m-price-disclosure">
        기본 구성 기준의 예상 비용 · 부가세 포함 · 최종 견적은 상담 후 확정
      </p>
      <div className="m-plan-grid">
        <section className="m-plan m-plan-setup">
          <p className="m-kicker">01 / WEBSITE SETUP</p>
          <h2>기본 홈페이지 제작</h2>
          <p className="m-plan-description">혜화 템플릿으로 가게의 첫 홈페이지를 준비합니다.</p>
          <p className="m-plan-price">
            {formatWon(pricing.setup)}
            <span>부터 / 1회</span>
          </p>
          <ul className="m-checklist">
            <li>혜화 템플릿 기반 원페이지 구성</li>
            <li>매장 소개·사진·메뉴·오시는 길 구성</li>
            <li>제공 자료의 초기 콘텐츠 등록 지원</li>
            <li>모바일·데스크톱 화면 확인</li>
            <li>오픈 전 검수와 고객 도메인 연결 지원</li>
            <li>관리 화면 사용 방법 안내</li>
          </ul>
          <a className="m-button" href={contactUrl}>
            제작 상담하기 ↗
          </a>
        </section>
        <section className="m-plan">
          <p className="m-kicker">02 / ONGOING CARE</p>
          <h2>운영·관리</h2>
          <p className="m-plan-description">공개 이후에도 가게의 소식을 편하게 관리합니다.</p>
          <p className="m-plan-price">
            {formatWon(pricing.monthly)}
            <span>부터 / 월</span>
          </p>
          <ul className="m-checklist">
            <li>기본 홈페이지 호스팅·이미지 보관</li>
            <li>사진·메뉴·매장 정보 직접 편집</li>
            <li>초안 저장과 비공개 미리보기</li>
            <li>게시 요청 내용 검수·보완 안내·승인 게시</li>
            <li>이전 공개 버전 복구 지원</li>
            <li>도메인 연결 상태 확인과 운영 문의</li>
          </ul>
          <a className="m-button m-outline" href={contactUrl}>
            관리 범위 문의하기 ↗
          </a>
        </section>
      </div>
      <aside className="m-year-budget">
        <div>
          <p className="m-kicker">FIRST YEAR, AT A GLANCE</p>
          <h2>기본 구성의 첫 1년 예산</h2>
          <p>
            제작 1회 {formatWon(pricing.setup)} + 운영 12개월 {formatWon(pricing.monthly * 12)}
          </p>
        </div>
        <div>
          <strong>
            {formatWon(pricing.setup + pricing.monthly * 12)}
            <small>부터</small>
          </strong>
          <p>부가세 포함 · 도메인·추가 작업 별도</p>
        </div>
      </aside>
      <p className="m-pricing-note">
        위 금액은 요금 초안입니다. 콘텐츠 양, 초기 입력 지원 범위, 검수 요청량과 추가 작업을 확인한
        뒤 최종 금액·제공 범위·기간을 안내합니다. 홈페이지에서 자동 결제되거나 정기 구독이
        시작되지는 않습니다.
      </p>
      <section className="m-section">
        <h2>포함 범위와 별도 비용을 확인하세요.</h2>
        <div className="m-info-grid">
          <article>
            <span>01</span>
            <h3>고객이 준비하는 자료</h3>
            <p>
              매장 소개 글, 메뉴와 가격, 사용 권한이 있는 사진·로고, 주소와 연락처를 준비해 주세요.
              사진 촬영·로고 디자인·새 원고 작성은 기본 제작에 포함되지 않습니다.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>별도로 확인하는 비용</h3>
            <p>
              도메인 구매·갱신은 고객이 직접 진행하며 별도 비용입니다. 추가 디자인·대량 입력
              대행·기본 범위를 넘는 저장 공간이나 트래픽은 필요 여부와 견적을 먼저 협의합니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>현재 제작 범위</h3>
            <p>
              기본 요금은 혜화 템플릿 1종을 사용하는 음식점 홈페이지 기준입니다. 온라인
              주문·결제·자체 예약 시스템은 포함되지 않으며, 기존 예약 서비스나 SNS는 링크로 연결할
              수 있습니다.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
