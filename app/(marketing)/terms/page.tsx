import { PageIntro } from '@/components/marketing/SiteShell';
import { TERMS_VERSION } from '@/lib/legal';
import { legalOperator, legalPublished } from '@/lib/server/legal';
export const metadata = { title: '이용약관', robots: { index: false, follow: true } };
export default function Terms() {
  const operator = legalOperator();
  return (
    <main id="main" className="m-container legal-document">
      <PageIntro label="TERMS OF SERVICE" title="서비스 이용약관">
        문서 버전 {TERMS_VERSION}
      </PageIntro>
      {!legalPublished() && (
        <p className="notice">
          운영자 확인 전 안내 초안입니다. 사업자 정보와 개인정보 처리 세부사항을 확정한 뒤 실제 고객
          가입에 적용합니다.
        </p>
      )}
      <aside className="legal-summary">
        <h2>먼저 확인하세요</h2>
        <p>
          가입·초안 작성만으로 비용이 청구되지 않습니다. 고객이 저장한 초안은 비공개이며 운영자가
          승인한 제출본만 공개됩니다. 제작과 월 관리는 별도 견적·계약으로 범위를 정합니다.
        </p>
      </aside>
      <nav className="legal-toc" aria-label="문서 목차">
        <strong>목차</strong>
        <a href="#legal-1">1. 서비스와 운영자</a>
        <a href="#legal-2">2. 가입과 계정 관리</a>
        <a href="#legal-3">3. 초안·검수·공개</a>
        <a href="#legal-4">4. 콘텐츠와 도메인</a>
        <a href="#legal-5">5. 비용과 제작 계약</a>
        <a href="#legal-6">6. 운영 지원과 이용 종료</a>
        <a href="#legal-7">7. 약관 변경과 문의</a>
      </nav>
      <section id="legal-1">
        <h2>1. 서비스와 운영자</h2>
        <p>
          {operator.name}은 쿠피 소상공인 웹사이트 제작·관리 서비스를 제공합니다. 사업장 주소:{' '}
          {operator.address}. 사업자등록번호: {operator.number}. 문의: {operator.email}.
        </p>
      </section>
      <section id="legal-2">
        <h2>2. 가입과 계정 관리</h2>
        <p>
          이메일·비밀번호 또는 구글 계정으로 가입할 수 있으며 계정 하나당 매장 하나를 관리합니다.
          고객은 본인의 계정과 연락 정보를 정확하게 관리해야 합니다. 계정 접근 문제가 생기면 복구
          기능 또는 운영자 문의를 이용할 수 있습니다.
        </p>
      </section>
      <section id="legal-3">
        <h2>3. 초안·검수·공개</h2>
        <p>
          고객이 저장한 초안은 자동으로 공개되지 않습니다. 게시 요청한 제출본은 고정되며 이후 편집은
          별도 초안에 저장됩니다. 운영자가 승인한 제출본만 공개합니다. 보완이 필요한 경우 의견을
          전달하며, 공개 이력을 이용해 이전 공개 버전으로 복구할 수 있습니다.
        </p>
      </section>
      <section id="legal-4">
        <h2>4. 콘텐츠와 도메인</h2>
        <p>
          고객은 사진·문구·로고 등 제공 콘텐츠의 사용 권한과 매장 정보를 확인해야 합니다. 타인의
          권리를 침해하거나 불법적인 콘텐츠는 게시를 거절하거나 게시 후 조치할 수 있습니다. 도메인은
          고객이 구매·소유하며 연결에 필요한 DNS 관리 권한만 위임합니다.
        </p>
      </section>
      <section id="legal-5">
        <h2>5. 비용과 제작 계약</h2>
        <p>
          회원가입과 초안 작성만으로 비용이 청구되지 않습니다. 공개 가격은 기본 범위의 안내 금액이며
          실제 제작·운영 범위, 대금, 기간과 취소·환불 조건은 작업 시작 전에 별도 견적과 계약으로
          확정합니다. 현재 사이트에는 자동 결제·정기 구독 기능이 없습니다.
        </p>
      </section>
      <section id="legal-6">
        <h2>6. 운영 지원과 이용 종료</h2>
        <p>
          지원 범위는 별도 계약으로 정합니다. 점검이나 장애 시 서비스 제공이 일시적으로 제한될 수
          있으며 확인된 문제는 안내하고 복구합니다. 이용 종료, 계정 삭제 또는 고객 데이터 내보내기는{' '}
          {operator.email}로 요청할 수 있습니다. 유료 서비스 계약 종료와 계정 삭제는 각각
          처리합니다.
        </p>
      </section>
      <section id="legal-7">
        <h2>7. 약관 변경과 문의</h2>
        <p>
          변경된 문서의 적용 시점과 내용을 서비스 화면이나 계정 이메일로 안내합니다. 새 동의가
          필요한 경우 이용 전에 확인 절차를 제공합니다. 문의는 {operator.email}로 보내 주세요.
        </p>
      </section>
      <aside className="legal-summary">
        <h2>제작 계약 전에 확인하는 항목</h2>
        <p>
          제작 페이지 수와 기능, 고객이 제공할 자료, 수정 범위와 횟수, 제작 일정, 제작비와 월
          관리비, 추가 작업 견적, 취소·환불 조건, 도메인 소유권, 이용 종료 시 데이터 인계 범위를
          별도 견적·계약으로 확인합니다. 이 목록은 계약 확인 안내이며 새로운 요금이나 환불 기준을
          정한 것이 아닙니다.
        </p>
      </aside>
    </main>
  );
}
