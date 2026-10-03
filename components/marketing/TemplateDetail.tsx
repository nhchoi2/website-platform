import Link from 'next/link';
import type { Template } from '@/templates/catalog/catalog';
import type { PreviewOptions } from '@/templates/catalog/options';
import { designDetails } from '@/templates/catalog/designs/details';
import { TemplateConfigurator } from './TemplateConfigurator';
import './templates.css';
export function TemplateDetail({
  template,
  initial,
}: {
  template: Template;
  initial: PreviewOptions;
}) {
  return (
    <main id="main" className="m-container m-template-detail">
      <Link className="m-template-back" href="/templates">
        ← 웹페이지 템플릿 안내
      </Link>
      <div className="m-template-detail-intro">
        <div>
          <p className="m-kicker">{template.english}</p>
          <h1>{template.name}</h1>
          <p>{template.description}</p>
          <span>대표 예시 업종: {template.industry} · 다른 업종에도 적용 가능</span>
        </div>
        <p className="m-config-instruction">
          페이지 구성을 고르고 기능을 체크해 보세요.
          <br />
          선택한 모습이 미리보기에 바로 적용됩니다.
        </p>
      </div>
      <div className="m-layout-explanation">
        <strong>이 디자인의 정보 순서</strong>
        <p>{designDetails[template.slug].flow}</p>
        <details>
          <summary>참고한 실제 홈페이지의 정보 구성</summary>
          <p>{designDetails[template.slug].reference.observation}</p>
          <a
            className="m-text-link"
            href={designDetails[template.slug].reference.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {designDetails[template.slug].reference.name} 보기 ↗
          </a>
          <p>
            참고 업체와 제휴된 템플릿이 아닙니다. 사진·상표·문구를 복제하지 않고 별도의 디자인과
            예시 콘텐츠로 구성했습니다.
          </p>
        </details>
      </div>
      <div className="m-template-fit">
        <div>
          <strong>이런 점이 좋아요</strong>
          <p>{template.strength}</p>
        </div>
        <div>
          <strong>준비하면 좋은 것</strong>
          <p>{template.consideration}</p>
        </div>
      </div>
      <TemplateConfigurator template={template} initial={initial} />
      <section className="m-template-basics">
        <h2>모든 제작 구성의 기본</h2>
        <ul>
          <li>모바일·데스크톱 반응형 구성</li>
          <li>페이지 제목·설명·검색 수집 안내 등 기본 SEO 설정</li>
          <li>고객 소유 도메인 연결 지원</li>
          <li>오픈 전 콘텐츠·링크 검수</li>
        </ul>
        <p>
          검색 상위 노출을 보장하지 않습니다. 예약·상담 버튼은 기존 외부 서비스로 연결하며, 자체
          예약·주문·결제 기능은 포함하지 않습니다.
        </p>
        <p>
          현재 이 화면은 제작 상담용 예시입니다. 고객 편집·검수·게시가 연결된 기존 템플릿은 혜화
          1종이며, 새 업종의 고객 관리 항목은 제작 시 연동 범위를 확인합니다.
        </p>
        {template.slug === 'hyehwa' && (
          <Link className="m-text-link" href="/templates/hyehwa/classic">
            기존 혜화 고객 관리 연동 화면 보기 ↗
          </Link>
        )}
      </section>
    </main>
  );
}
