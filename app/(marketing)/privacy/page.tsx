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
      <PageIntro label="PRIVACY" title="개인정보 처리 안내">
        문서 버전 {PRIVACY_VERSION}
      </PageIntro>
      {!legalPublished() && (
        <p className="notice">
          운영자 검토용 초안입니다. 사업자 정보, 처리 위탁·국외이전 조건과 보유기간을 확인하기
          전에는 실제 고객의 새 가입·동의를 활성화하지 않습니다.
        </p>
      )}
      <section>
        <h2>1. 필수 계정 정보 수집·이용</h2>
        <p>
          목적: 로그인, 계정 복구, 고객별 접근 제한, 서비스 안내 및 동의 이력 관리. 항목: 이메일,
          계정 식별자, 비밀번호 인증 정보(이메일 가입), 동의한 문서 버전과 동의 시각. 구글 로그인 시
          Google이 제공하는 계정 식별자·이메일·기본 프로필 정보가 인증 서비스에서 처리됩니다.
        </p>
        <p>
          보유: 계정 이용 기간 동안 처리하며, 이용 종료·삭제 요청 시 삭제 대상으로 처리합니다.
          법령상 별도 보관이 필요한 기록은 해당 의무와 기간을 확인해 분리 보관합니다. 필수 정보
          수집·이용을 거부할 수 있으나 계정 서비스 이용은 어렵습니다.
        </p>
      </section>
      <section>
        <h2>2. 선택 담당자 정보 수집·이용</h2>
        <p>
          항목: 담당자 이름과 연락받을 전화번호. 목적: 제작 상담과 운영 연락. 보유: 계정 이용 중
          또는 동의 철회 시까지. 내 정보에서 이름과 번호를 비워 삭제·철회할 수 있습니다. 거부해도
          홈페이지 초안 편집은 가능합니다. 연락처는 홈페이지에 자동 공개하지 않습니다.
        </p>
      </section>
      <section>
        <h2>3. 공개할 매장 콘텐츠</h2>
        <p>
          매장명·주소·연락처·메뉴·사진·외부 링크는 고객이 홈페이지에 제공하는 콘텐츠입니다. 초안과
          제출본은 비공개이며 승인된 공개본만 홈페이지 방문자에게 제공됩니다. 사진에는 사용 권한을
          확인하고 불필요한 개인정보를 넣지 마세요.
        </p>
      </section>
      <section>
        <h2>4. 처리 서비스와 전송</h2>
        <p>
          인증·DB·이미지 저장에는 Supabase, 서비스 실행에는 Vercel, 인증 메일 발송에는 Resend를
          이용합니다. 선택한 구글 로그인에는 Google이 관여합니다. Supabase 프로젝트 DB 리전은
          서울입니다. 서비스별 처리 위탁 범위, 실제 처리 위치, 국외이전의
          수령자·국가·항목·목적·시점·방식·보유기간 및 거부 절차는 운영자가 공급자 설정과 계약을
          확인해 확정해야 합니다.
        </p>
      </section>
      <section>
        <h2>5. 보호와 요청</h2>
        <p>
          계정별 서버·DB·이미지 저장소 접근 권한을 구분하며 비밀번호 인증은 인증 서비스가
          처리합니다. 열람·정정·삭제·처리 정지나 계정 삭제 요청은 {operator.email}로 접수할 수
          있습니다. 공개 콘텐츠의 정보는 홈페이지 편집 후 게시 요청으로 변경합니다.
        </p>
      </section>
      <section>
        <h2>6. 문의 담당자</h2>
        <p>
          운영자: {operator.name}. 개인정보 문의 담당자: {operator.privacyContact}. 이메일:{' '}
          {operator.email}. 사업장 주소: {operator.address}.
        </p>
      </section>
    </main>
  );
}
