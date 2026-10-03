import { PageIntro } from '@/components/marketing/SiteShell';
import { PRIVACY_VERSION } from '@/lib/legal';
import { legalOperator, legalPublished } from '@/lib/server/legal';
export const metadata = {
  title: '개인정보처리방침 및 수집·이용 안내',
  robots: { index: false, follow: true },
};
export default function Privacy() {
  const operator = legalOperator();
  return (
    <main id="main" className="m-container legal-document">
      <PageIntro label="PRIVACY" title="개인정보 처리방침">
        문서 버전 {PRIVACY_VERSION}
      </PageIntro>
      {!legalPublished() && (
        <p className="notice">
          운영자 검토용 초안입니다. 사업자 정보, 처리 위탁·국외이전 조건과 보유기간을 확인하기
          전에는 실제 고객의 새 가입·동의를 활성화하지 않습니다.
        </p>
      )}
      <aside className="legal-summary">
        <h2>먼저 확인하세요</h2>
        <p>
          로그인에 필요한 계정 정보와 선택 연락처를 구분합니다. 담당자 연락처는 홈페이지에 자동
          공개하지 않으며, 승인된 매장 콘텐츠만 방문자에게 공개됩니다.
        </p>
      </aside>
      <nav className="legal-toc" aria-label="문서 목차">
        <strong>목차</strong>
        <a href="#legal-1">1. 필수 계정 정보 수집·이용</a>
        <a href="#legal-2">2. 선택 담당자 정보 수집·이용</a>
        <a href="#legal-3">3. 공개할 매장 콘텐츠</a>
        <a href="#legal-4">4. 처리 서비스와 전송</a>
        <a href="#legal-5">5. 보호와 요청</a>
        <a href="#legal-6">6. 문의 담당자</a>
      </nav>
      <section id="legal-1">
        <h2>1. 필수 계정 정보 수집·이용</h2>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <caption>계정 정보의 수집 항목과 이용 목적</caption>
            <thead>
              <tr>
                <th scope="col">구분</th>
                <th scope="col">처리하는 정보</th>
                <th scope="col">이용 목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">이메일 가입</th>
                <td>이메일, 계정 식별자, 비밀번호 인증 정보</td>
                <td>로그인, 계정 복구, 고객별 접근 제한, 서비스 안내</td>
              </tr>
              <tr>
                <th scope="row">구글 로그인 선택 시</th>
                <td>Google이 제공하는 계정 식별자·이메일·기본 프로필 정보</td>
                <td>인증 서비스의 계정 인증 및 로그인</td>
              </tr>
              <tr>
                <th scope="row">동의 이력</th>
                <td>동의한 문서 버전, 동의 시각</td>
                <td>동의 이력 관리</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          보유: 계정 이용 기간 동안 처리하며, 이용 종료·삭제 요청 시 삭제 대상으로 처리합니다.
          법령상 별도 보관이 필요한 기록은 해당 의무와 기간을 확인해 분리 보관합니다. 필수 정보
          수집·이용을 거부할 수 있으나 계정 서비스 이용은 어렵습니다.
        </p>
      </section>
      <section id="legal-2">
        <h2>2. 선택 담당자 정보 수집·이용</h2>
        <p>
          항목: 담당자 이름과 연락받을 전화번호. 목적: 제작 상담과 운영 연락. 보유: 계정 이용 중
          또는 동의 철회 시까지. 내 정보에서 이름과 번호를 비워 삭제·철회할 수 있습니다. 거부해도
          홈페이지 초안 편집은 가능합니다. 연락처는 홈페이지에 자동 공개하지 않습니다.
        </p>
      </section>
      <section id="legal-3">
        <h2>3. 공개할 매장 콘텐츠</h2>
        <p>
          매장명·주소·연락처·메뉴·사진·외부 링크는 고객이 홈페이지에 제공하는 콘텐츠입니다. 초안과
          제출본은 비공개이며 승인된 공개본만 홈페이지 방문자에게 제공됩니다. 사진에는 사용 권한을
          확인하고 불필요한 개인정보를 넣지 마세요.
        </p>
      </section>
      <section id="legal-4">
        <h2>4. 처리 서비스와 전송</h2>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <caption>현재 사용하는 외부 서비스</caption>
            <thead>
              <tr>
                <th scope="col">서비스</th>
                <th scope="col">사용 용도</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Supabase</th>
                <td>인증·DB·이미지 저장 (프로젝트 DB 리전: 서울)</td>
              </tr>
              <tr>
                <th scope="row">Vercel</th>
                <td>웹사이트 실행·호스팅</td>
              </tr>
              <tr>
                <th scope="row">Resend</th>
                <td>인증 이메일 발송</td>
              </tr>
              <tr>
                <th scope="row">Google</th>
                <td>고객이 선택하는 구글 로그인</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          서비스별 처리 위탁 범위, 실제 처리 위치, 국외이전의
          수령자·국가·항목·목적·시점·방식·보유기간 및 거부 절차는 운영자가 공급자 설정과 계약을
          확인해 확정해야 합니다.
        </p>
      </section>
      <section id="legal-5">
        <h2>5. 보호와 요청</h2>
        <p>
          계정별 서버·DB·이미지 저장소 접근 권한을 구분하며 비밀번호 인증은 인증 서비스가
          처리합니다. 열람·정정·삭제·처리 정지나 계정 삭제 요청은 {operator.email}로 접수할 수
          있습니다. 공개 콘텐츠의 정보는 홈페이지 편집 후 게시 요청으로 변경합니다.
        </p>
      </section>
      <section id="legal-6">
        <h2>6. 문의 담당자</h2>
        <p>
          운영자: {operator.name}. 개인정보 문의 담당자: {operator.privacyContact}. 이메일:{' '}
          {operator.email}. 사업장 주소: {operator.address}.
        </p>
      </section>
      <section id="consultation-privacy">
        <h2>온라인 제작 상담 접수 안내</h2>
        <p>
          온라인 상담에서는 이름, 업종 또는 상호, 선택한 연락 방법과 연락처, 요청 내용, 선택 구성,
          동의 버전과 시각을 상담 접수 및 후속 연락 목적으로 처리합니다. 회원가입과 별도로 상담
          화면에서 수집·이용 안내를 확인하고 동의할 수 있습니다. 상담 연락처와 요청 내용은 공개
          홈페이지에 표시하지 않습니다.
        </p>
        <p>
          상담 목적 달성 시 또는 삭제 요청 시 파기하며 계약으로 이어지는 정보는 별도 안내합니다.
          삭제·열람 요청은 {operator.email}로 접수할 수 있습니다. 운영자가 삭제 절차를 수행하며,
          백업에 남은 정보의 보관·삭제는 공급자의 실제 정책을 확인해 안내합니다. 운영 환경의 접수는
          이 수집 범위와 외부 서비스 처리 조건을 확인한 뒤 별도로 활성화합니다.
        </p>
      </section>
      <section id="production-privacy">
        <h2>제작 진행·자료·증빙 요청</h2>
        <p>
          상담이 제작으로 이어지면 운영자가 고객 계정과 연결합니다. 고객과 운영자에게만 제작 단계,
          견적, 고객에게 보이는 안내와 변경 이력을 제공합니다. 운영자 전용 상담 메모는 고객에게
          공개하지 않습니다.
        </p>
        <p>
          제작 자료는 별도의 제공 안내 확인 후 비공개로 저장하며, 사용 권한이 있는 사진·문서만
          전달해 주세요. 파일 식별자, 업로더, 이름, 형식, 크기와 제공 동의 시각을 제작·수정 목적으로
          처리합니다. 자료를 전달해도 홈페이지에 자동 공개되지 않습니다. 고객과 운영자는 자료를
          삭제할 수 있습니다. 제출본·공개 이력의 사진과 첨부는 복구 목적으로 별도 보관되며, 삭제
          요청 시 공개 이력·백업을 함께 확인해야 합니다.
        </p>
        <p>
          증빙 요청은 별도 동의를 받고 증빙 종류, 신청인 또는 상호, 휴대폰번호·현금영수증 카드번호
          또는 사업자등록번호, 수신 이메일, 동의 시각과 외부 발행 결과를 비공개로 처리합니다. 발행
          전 요청을 철회하면 입력한 식별번호·신청인·이메일을 제거합니다. 자동 발행·자동 결제를 하지
          않으며 실제 계약·세무 보관 대상과 기간은 발행 전에 별도 안내해야 합니다. 주민등록번호를
          입력하지 마세요.
        </p>
        <p>
          메일 알림을 활성화하면 Resend를 통해 접수 확인과 제작 진행 안내를 보냅니다. 메일에는 상세
          상담 내용·증빙 식별번호·파일을 넣지 않고 관리 화면 링크와 접수 번호를 안내합니다. 외부
          메일 제공자의 처리·전송 조건을 확정한 뒤 활성화하며 발송 결과 기록은 상담·제작 처리에
          사용합니다.
        </p>
      </section>
      <aside className="legal-summary">
        <h2>처리방침 확정 시 확인할 사항</h2>
        <p>
          외부 서비스의 이름만으로 위탁·국외이전 고지가 완성되지는 않습니다. 운영자는 실제 계약과
          설정에 맞춰 수령자, 처리 항목, 국가, 보유기간 및 권리 행사 절차를 확인해야 합니다.
          개인정보 처리방침과 개별 수집·이용 동의 안내는 구분해 제공합니다.
        </p>
      </aside>
    </main>
  );
}
