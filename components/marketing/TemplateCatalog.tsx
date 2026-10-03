'use client';
import { useState } from 'react';
import Link from 'next/link';
import { templateCatalog } from '@/templates/catalog/catalog';
import { DesignThumbnail } from '@/templates/catalog/DesignThumbnail';
import { designDetails } from '@/templates/catalog/designs/details';
import { formatWon, pricing } from './content';
import './templates.css';
export function TemplateCatalog({ featured = false }: { featured?: boolean }) {
  const [industry, setIndustry] = useState('all');
  const templates = featured
    ? templateCatalog.filter((template) =>
        ['hyehwa', 'salon', 'fitness', 'professional'].includes(template.slug),
      )
    : templateCatalog.filter(
        (template) =>
          industry === 'all' || designDetails[template.slug].recommended.includes(industry),
      );
  return (
    <>
      {!featured && (
        <div className="m-industry-filters">
          <strong>업종별 추천 보기</strong>
          <div role="group" aria-label="업종별 추천 디자인">
            <button aria-pressed={industry === 'all'} onClick={() => setIndustry('all')}>
              전체 디자인
            </button>
            {templateCatalog.map((t) => (
              <button
                key={t.slug}
                aria-pressed={industry === t.slug}
                onClick={() => setIndustry(t.slug)}
              >
                {t.industry.split(' · ')[0]}
              </button>
            ))}
          </div>
          <p role="status">
            {templates.length}개 디자인 · 업종에 관계없이 모든 디자인을 선택할 수 있습니다.
          </p>
          {industry !== 'all' && (
            <button className="m-text-link" onClick={() => setIndustry('all')}>
              다른 업종의 디자인도 모두 보기 ↗
            </button>
          )}
        </div>
      )}
      <div id="template-designs" className="m-catalog-grid">
        {templates.map((template, i) => (
          <article className="m-catalog-card" key={template.slug}>
            <Link
              className="m-catalog-visual"
              href={`/templates/${template.slug}`}
              aria-label={`${template.name} 템플릿 상세보기`}
            >
              <div className="m-catalog-browser">
                <span>● ● ●</span>
                <small>{template.english}</small>
              </div>
              <DesignThumbnail template={template} />
            </Link>
            <div className="m-catalog-caption">
              <p className="m-kicker">
                0{i + 1} / {template.industry}
              </p>
              <h2>{template.name}</h2>
              <p>{template.description}</p>
              <p className="m-design-flow">{designDetails[template.slug].flow}</p>
              <div className="m-catalog-tags">
                <span>원페이지</span>
                <span>3·4페이지</span>
                <span>기능 선택</span>
              </div>
              <div className="m-catalog-bottom">
                <small>기본 원페이지 {formatWon(pricing.setup)}부터</small>
                <Link href={`/templates/${template.slug}`}>상세보기 ↗</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
