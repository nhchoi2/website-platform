import Link from 'next/link';
import { selectionPrices, type Selection } from '@/lib/inquiries';
export function SelectionSummary({ selection }: { selection: Selection }) {
  return (
    <aside className="m-selection-summary">
      <p className="m-kicker">YOUR SELECTION</p>
      <h2>선택한 구성</h2>
      <dl>
        <dt>디자인</dt>
        <dd>{selection.templateName}</dd>
        {selection.industry && (
          <>
            <dt>예시 업종</dt>
            <dd>{selection.industry}</dd>
          </>
        )}
        <dt>페이지</dt>
        <dd>{selection.pages === 1 ? '원페이지' : `${selection.pages}페이지`}</dd>
        <dt>기본 포함 선택</dt>
        <dd>{selection.included.join(', ') || '기본 구성'}</dd>
        <dt>유료 추가 선택</dt>
        <dd>{selection.paid.join(', ') || '없음'}</dd>
        <dt>메뉴 위치</dt>
        <dd>{selection.navigation}</dd>
        <dt>모바일 메뉴</dt>
        <dd>{selection.mobileNavigation}</dd>
      </dl>
      <p>{selectionPrices(selection)}</p>
      <small>
        표시 금액은 시작 가격입니다. 선택한 옵션만으로 계약·결제가 진행되지 않으며 최종 범위와
        금액은 상담 후 확정합니다.
      </small>
      {selection.template && (
        <Link className="m-text-link" href={`/templates/${selection.template}?${selection.query}`}>
          구성 수정하기 ↗
        </Link>
      )}
    </aside>
  );
}
