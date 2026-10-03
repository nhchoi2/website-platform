import Link from 'next/link';
import { PageIntro, contactUrl } from '@/components/marketing/SiteShell';
import { pricing, formatWon } from '@/components/marketing/content';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '홈페이지 제작 비용과 관리 범위',
  `소상공인 홈페이지 기본 제작 ${formatWon(pricing.setup)}부터, 운영·관리 월 ${formatWon(pricing.monthly)}부터. 포함 범위와 별도 비용을 확인하세요.`,
  '/pricing',
);
export default function Pricing() {
  return (
    <main id="main" className="m-container m-pricing-page">
      <PageIntro
        label="PRICING & SCOPE"
        title="우리 가게에 필요한 만큼,
비용은 명확하게."
      >
        처음 만드는 비용과 꾸준히 관리하는 비용을 나누어 안내합니다.
        <br />
        우리 가게에 필요한 범위를 확인하고 시작하세요.
      </PageIntro>
      <nav className="m-pricing-nav" aria-label="비용 안내 목차">
        <a href="#plans">제작·관리 비용</a>
        <a href="#scope">기본 포함·추가 옵션</a>
        <a href="#pages">페이지 구성</a>
        <a href="#questions">자주 묻는 질문</a>
      </nav>
      <p className="m-price-disclosure">
        기본 구성 기준의 예상 비용 · 부가세 포함 · 최종 견적은 상담 후 확정
      </p>
      <div className="m-plan-grid" id="plans">
        <section className="m-plan m-plan-setup">
          <p className="m-kicker">01 / WEBSITE SETUP</p>
          <h2>기본 홈페이지 제작</h2>
          <p className="m-plan-description">기본 원페이지 홈페이지의 제작비 기준입니다.</p>
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
          <p className="m-plan-description">
            기본 호스팅·이미지 보관 비용이 포함되어 별도 호스팅비를 더하지 않습니다.
          </p>
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
      <section className="m-section" id="scope">
        <p className="m-kicker">INCLUDED & EXTRAS</p>
        <h2>기본은 충분하게. 추가는 필요한 것만.</h2>
        <p>기본 제작비에 포함되는 콘텐츠와 별도 개발이 필요한 기능을 구분했습니다.</p>
        <div className="m-scope-grid">
          <article className="m-scope-card">
            <span className="m-cost-tag">기본 제작비 포함</span>
            <h3>가게를 소개하는 기본 구성</h3>
            <ul className="m-checklist">
              <li>매장 소개·사진·주소·연락처·영업시간</li>
              <li>업종에 맞는 메뉴·가격 또는 서비스 소개</li>
              <li>담당자 소개·일정 안내·이용 절차·FAQ 선택</li>
              <li>정해진 메뉴 위치와 모바일 메뉴 방식 선택</li>
            </ul>
            <p>
              제공한 로고·브라우저 탭 아이콘은 제작 시 적용 범위를 확인합니다. 새 로고 디자인은
              별도입니다.
            </p>
          </article>
          <article className="m-scope-card">
            <span className="m-cost-tag m-cost-tag-paid">유료 추가 · 상담 후 견적</span>
            <h3>운영에 맞춰 더하는 기능</h3>
            <ul className="m-checklist">
              <li>3·4페이지 구성 또는 추가 페이지 제작</li>
              <li>사진 갤러리·공지 게시판 개발 및 관리 연동</li>
              <li>화면에 고정되는 상담·예약·카카오·플레이스 버튼</li>
              <li>안내 배너·지도 API 등 외부 서비스 연결</li>
            </ul>
            <p>
              링크 연결과 자체 예약·결제 시스템은 서로 다릅니다. 외부 서비스 이용료는 별도로
              확인합니다.
            </p>
          </article>
        </div>
        <p className="m-pricing-note">
          모바일·데스크톱 기본 화면 확인은 제작 범위에 포함합니다. 템플릿 예시는 기능 시연이며 실제
          게시판 관리나 지도 API 연결이 완료된 상품을 뜻하지 않습니다. 추가 개발 범위는 계약 전에
          정합니다.
        </p>
        <Link className="m-text-link" href="/templates">
          템플릿에서 기본 구성·추가 옵션 확인하기 ↗
        </Link>
      </section>
      <section className="m-section" id="pages">
        <h2>페이지 구성에 따라 견적이 달라집니다.</h2>
        <div className="m-info-grid">
          <article>
            <span>01</span>
            <h3>원페이지 · 메뉴 포함</h3>
            <p>
              한 페이지 안에 소개·메뉴 또는 서비스·위치를 구성합니다. 메뉴를 누르면 해당 섹션으로
              이동합니다. 기본 제작 {formatWon(pricing.setup)}부터(부가세 포함).
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>3페이지</h3>
            <p>
              홈·소개 / 메뉴 또는 서비스 / 방문·문의로 나눕니다. 페이지마다 별도 주소가 있으며 추가
              제작비는 상담 후 확정합니다.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>4페이지</h3>
            <p>
              홈 / 소개 / 메뉴 또는 서비스 / 방문·문의로 구성합니다. 추가 페이지와 선택 기능 요금은
              아직 미정이며 기본 원페이지 요금과 구분합니다.
            </p>
          </article>
        </div>
        <p>
          플로팅 상담·예약·플레이스·카카오 링크, 안내 배너, FAQ 등을 미리 적용해 볼 수 있습니다.
          기능을 선택했다고 계약이나 결제가 진행되지는 않습니다.
        </p>
        <Link className="m-text-link" href="/templates">
          구성·기능별 템플릿 미리보기 ↗
        </Link>
      </section>
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
              기본 요금의 기준은 기존 혜화 원페이지 구성입니다. 업종별 7종 예시와 3·4페이지 구성은
              템플릿 안내에서 비교할 수 있으며 실제 제작·관리 범위는 상담 후 확정합니다. 온라인
              주문·결제·자체 예약 시스템은 포함되지 않으며, 기존 예약 서비스나 SNS는 링크로 연결할
              수 있습니다.
            </p>
          </article>
        </div>
      </section>
      <section className="m-section m-pricing-faq" id="questions">
        <p className="m-kicker">QUESTIONS, ANSWERED</p>
        <h2>시작 전에 궁금한 것들.</h2>
        {[
          [
            '홈페이지 제작 비용은 얼마인가요?',
            '기본 원페이지 제작은 부가세 포함 39만 원부터입니다. 운영·관리는 월 4만 4천 원부터이며 기본 호스팅과 이미지 보관을 포함합니다. 페이지 수, 기능, 초기 자료 등록 범위를 확인해 최종 견적을 안내합니다.',
          ],
          [
            '원페이지와 여러 페이지는 무엇이 다른가요?',
            '원페이지는 한 화면을 내려보며 내용을 확인하고, 메뉴를 누르면 해당 부분으로 이동합니다. 여러 페이지 구성은 소개·서비스·문의 등을 각각 별도 주소로 나눕니다. 3·4페이지 구성과 추가 기능 비용은 상담 후 견적으로 안내합니다.',
          ],
          [
            '표시한 가격에 부가세가 포함되어 있나요?',
            '네. 기본 제작 39만 원부터, 월 운영·관리 4만 4천 원부터는 부가세 포함 금액입니다. 최종 범위와 금액은 상담 후 견적으로 확정합니다.',
          ],
          [
            '호스팅 비용을 따로 내나요?',
            '기본 호스팅과 이미지 보관은 월 운영·관리비에 포함됩니다. 기본 범위를 넘는 저장 공간이나 트래픽이 필요하면 비용을 먼저 협의합니다.',
          ],
          [
            '도메인은 누구 소유인가요?',
            '고객이 직접 구매하고 소유합니다. 구매·갱신 비용은 별도이며 연결에 필요한 DNS 관리 권한만 위임받습니다. 도메인 업체 비밀번호를 요구하지 않습니다.',
          ],
          [
            '옵션을 선택하면 바로 비용이 발생하나요?',
            '아니요. 미리보기와 상담 요청만으로 결제나 정기 구독이 시작되지 않습니다. 유료 옵션은 견적과 계약을 확인한 뒤 진행합니다.',
          ],
          [
            '제작 취소와 환불은 어떻게 정하나요?',
            '작업 시작 전에 제작 범위, 기간, 수정 범위, 취소·환불 조건을 별도 견적과 계약으로 안내합니다. 현재 사이트에서 자동 결제하지 않습니다.',
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
        <p className="m-faq-contact">
          준비 자료·제작 일정·수정·게시 방법은 <Link href="/guide#faq">제작·관리 FAQ ↗</Link>에서
          확인하세요.
        </p>
      </section>
      <aside className="m-pricing-cta">
        <div>
          <p className="m-kicker">LET’S TALK</p>
          <h2>어떤 구성이 맞을지 함께 정해요.</h2>
          <p>업종과 필요한 기능을 알려주시면 제작 범위부터 안내하겠습니다.</p>
        </div>
        <a className="m-button" href={contactUrl}>
          제작 상담하기 ↗
        </a>
      </aside>
    </main>
  );
}
