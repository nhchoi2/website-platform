import type { CSSProperties } from 'react';
import type { Template } from './catalog';
import { TemplateArt } from './TemplateArt';
import './thumbnails.css';

// Miniature compositions match each demo's hierarchy; no interactive controls here.
export function DesignThumbnail({ template: t }: { template: Template }) {
  const items = t.items.map((x) => (
    <div key={x.name}>
      <small>{x.category}</small>
      <strong>{x.name}</strong>
      <span>{x.price}</span>
    </div>
  ));
  const title = <strong className="dt-title">{t.headline}</strong>;
  const art = <TemplateArt template={t} compact />;
  return (
    <div
      aria-hidden="true"
      className={`dt dt-${t.slug}`}
      style={
        { '--t-accent': t.accent, '--t-paper': t.background, '--t-ink': t.ink } as CSSProperties
      }
    >
      <div className="dt-nav">
        <strong>{t.brand}</strong>
        <span>소개　{t.serviceLabel}　방문·문의</span>
      </div>
      {t.slug === 'hyehwa' && (
        <>
          <div className="dt-table-cover">
            {title}
            {art}
          </div>
          <div className="dt-table-menu">
            <b>{t.serviceLabel}</b>
            <div>{items}</div>
          </div>
        </>
      )}
      {t.slug === 'cafe' && (
        <>
          <div className="dt-editorial-cover">
            {title}
            {art}
          </div>
          <div className="dt-editorial-journal">
            <small>01 / JOURNAL</small>
            <strong>{t.storyTitle}</strong>
          </div>
        </>
      )}
      {t.slug === 'salon' && (
        <>
          {title}
          <div className="dt-atelier-art">
            {art}
            <span>a.</span>
          </div>
          <div className="dt-atelier-index">
            COLLECTION / {t.items.map((x) => x.category).join(' · ')}
          </div>
        </>
      )}
      {t.slug === 'fitness' && (
        <>
          {title}
          <div className="dt-motion-photo">{art}</div>
          <div className="dt-motion-strip">{t.highlights.join(' / ')}</div>
          <div className="dt-motion-programs">{items}</div>
        </>
      )}
      {t.slug === 'market' && (
        <>
          <div className="dt-market-board">
            <div>
              <small>이번 주 추천</small>
              {title}
            </div>
            {art}
          </div>
          <div className="dt-market-categories">전체　신선 식품　생활</div>
          <div className="dt-market-products">{items}</div>
        </>
      )}
      {t.slug === 'professional' && (
        <>
          <div className="dt-partner-cover">
            {title}
            <div>{items}</div>
          </div>
          <div className="dt-partner-photo">{art}</div>
          <div className="dt-partner-standard">OUR STANDARD / {t.highlights[0]}</div>
        </>
      )}
      {t.slug === 'care' && (
        <>
          {title}
          <div className="dt-care-photo">{art}</div>
          <div className="dt-care-quick">
            <span>운영시간</span>
            <span>이용 안내</span>
            <span>오시는 길</span>
          </div>
          <div className="dt-care-directory">{items}</div>
        </>
      )}
    </div>
  );
}
