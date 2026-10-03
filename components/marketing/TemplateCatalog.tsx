import Link from 'next/link';
import { templateCatalog } from '@/templates/catalog/catalog';
import { TemplateArt } from '@/templates/catalog/TemplateArt';
import { formatWon, pricing } from './content';
import './templates.css';
export function TemplateCatalog({ featured = false }: { featured?: boolean }) {
  const templates = featured
    ? templateCatalog.filter((template) =>
        ['hyehwa', 'salon', 'fitness', 'professional'].includes(template.slug),
      )
    : templateCatalog;
  return (
    <div className="m-catalog-grid">
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
            <TemplateArt template={template} compact />
            <div className="m-catalog-headline">
              <strong>{template.headline.replace('\n', ' ')}</strong>
              <span>소개　{template.serviceLabel}　방문·문의</span>
            </div>
          </Link>
          <div className="m-catalog-caption">
            <p className="m-kicker">
              0{i + 1} / {template.industry}
            </p>
            <h2>{template.name}</h2>
            <p>{template.description}</p>
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
  );
}
