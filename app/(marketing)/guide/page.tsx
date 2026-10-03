import Link from 'next/link';
import { PageIntro, StartCTA, contactUrl } from '@/components/marketing/SiteShell';
import { marketingMetadata } from '@/lib/server/marketing';
export const metadata = marketingMetadata(
  '홈페이지 만드는 방법과 자주 묻는 질문',
  '템플릿 선택부터 사진·메뉴 입력, 게시 요청, 검수와 도메인 연결까지. 쿠피 사이트의 홈페이지 제작·관리 방법을 알아보세요.',
  '/guide',
);
const faqs = [
  [
    '음식점 외 다른 업종도 가능한가요?',
    '네. 템플릿 안내에서 음식점·카페·미용실·헬스장·마트·전문 사무실·병원 및 약국의 7종 제작 예시를 볼 수 있습니다. 현재 고객 편집·게시가 연결된 기존 구성은 혜화 1종이며, 다른 업종의 관리 항목은 제작 상담에서 범위를 정합니다.',
  ],
  [
    '저장하면 바로 홈페이지에 바뀐 내용이 나오나요?',
    '아니요. 초안 저장과 공개는 별개입니다. 게시를 요청하면 그 시점의 내용이 제출본으로 고정되고, 운영자가 승인한 제출본만 공개됩니다.',
  ],
  [
    '검수 중에도 내용을 수정할 수 있나요?',
    '네. 제출 후에도 초안을 계속 편집할 수 있습니다. 이후 수정한 내용이 이미 제출한 버전에 자동으로 섞이지는 않습니다. 관리 화면에서 요청 상태와 보완 의견을 확인하세요.',
  ],
  [
    '도메인을 새로 사야 하나요?',
    '이미 소유한 도메인이 있으면 연결 가능 여부를 확인해 드립니다. 새 도메인이 필요하면 고객이 직접 구매·소유하고, 연결에 필요한 DNS 관리 권한만 위임합니다. 도메인 업체 비밀번호를 수집하지 않습니다.',
  ],
  [
    '휴대폰에서도 편집할 수 있나요?',
    '네. 휴대폰에서 사진과 매장 정보를 수정하고 저장할 수 있습니다. 게시 전 모바일·데스크톱 미리보기로 화면을 확인하세요.',
  ],
  [
    '사진이나 자료를 나중에 받을 수 있나요?',
    '운영자에게 요청하면 고객별 콘텐츠 데이터와 업로드 이미지를 내보낼 수 있습니다. 이전에 공개한 버전으로 복구하는 기능도 제공합니다.',
  ],
];
export default function Guide() {
  return (
    <main id="main" className="m-container">
      <PageIntro label="GETTING STARTED" title="가게에 집중할 수 있도록.">
        홈페이지 준비부터 공개 이후의 수정까지,
        <br />
        어떻게 진행되는지 안내합니다.
      </PageIntro>
      <div className="m-guide-steps">
        {[
          [
            '템플릿과 기능 둘러보기',
            '회원가입 없이 업종별 예시를 확인합니다. 원페이지 또는 3·4페이지를 고르고 기능을 체크하면 미리보기에 적용됩니다.',
          ],
          [
            '선택한 구성으로 제작 상담하기',
            '제작 문의 버튼을 누르면 메일 앱에 선택 내용이 입력됩니다. 메일을 직접 발송하고 필요한 제작·관리 범위와 견적을 확인합니다. 이후 사진과 소개 자료를 준비합니다.',
          ],
          [
            '제작 내용을 함께 확인하기',
            '사업장의 요구에 맞게 제작하고 화면과 콘텐츠를 함께 확인합니다. 관리 계정과 고객이 수정할 항목은 확정된 제작 범위에 맞춰 안내합니다.',
          ],
          [
            '공개하고, 꾸준히 관리하기',
            '테스트 주소로 공개 내용을 확인한 뒤 고객 도메인을 연결합니다. 새로운 메뉴와 소식은 같은 관리 화면에서 수정·제출하세요.',
          ],
        ].map(([t, d], i) => (
          <section key={t}>
            <span>0{i + 1}</span>
            <div>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          </section>
        ))}
      </div>
      <aside className="m-preparation">
        <h2>미리 준비하면 좋은 것</h2>
        <p>
          상호 · 소개 글 · 메뉴·상품·서비스와 가격 · 매장·시설·작업 사진 · 주소 · 연락처 · 운영시간
          · 연결할 외부 링크
        </p>
        <Link href="/pricing" className="m-text-link">
          제작·관리 범위 확인하기 ↗
        </Link>
      </aside>
      <section id="faq" className="m-section m-faq">
        <p className="m-kicker">FREQUENTLY ASKED</p>
        <h2>자주 묻는 질문</h2>
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
        <p className="m-faq-contact">
          다른 궁금한 점이 있나요? <a href={contactUrl}>쿠피에 문의하기 ↗</a>
        </p>
      </section>
      <StartCTA />
    </main>
  );
}
