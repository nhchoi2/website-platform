import Link from 'next/link';
import type { CSSProperties } from 'react';
import { demoContent, type Template } from './catalog';
import { demoPages, previewHref, type DemoPage, type PreviewOptions } from './options';
import { CommonFeatures } from './CommonFeatures';
import { ContentFeatures } from './ContentFeatures';
import { PreviewBridge } from './PreviewBridge';
import { StandalonePreviewControls } from './StandalonePreviewControls';
import { TemplateHeader } from './TemplateHeader';
import { Visit } from './Visit';
import { Table } from './designs/Table';
import { Editorial } from './designs/Editorial';
import { Atelier } from './designs/Atelier';
import { Motion } from './designs/Motion';
import { Market } from './designs/Market';
import { Partner } from './designs/Partner';
import { Care } from './designs/Care';
import './catalog.css';
import './designs/designs.css';

const designs = {
  hyehwa: Table,
  cafe: Editorial,
  salon: Atelier,
  fitness: Motion,
  market: Market,
  professional: Partner,
  care: Care,
};

export function DemoSite({
  template: design,
  options,
  page,
}: {
  template: Template;
  options: PreviewOptions;
  page: DemoPage;
}) {
  const template = demoContent(design, options.business);
  const one = options.pages === 1;
  const sectionLink = (target: DemoPage) =>
    one ? `#${target}` : previewHref(design.slug, target, options);
  const Design = designs[design.slug as keyof typeof designs];
  return (
    <div
      className={`t-site t-site-${design.slug}`}
      style={
        {
          '--t-accent': design.accent,
          '--t-paper': design.background,
          '--t-ink': design.ink,
        } as CSSProperties
      }
    >
      <PreviewBridge slug={design.slug} page={page} />
      <StandalonePreviewControls template={design} options={options} page={page} />
      <a className="skip-link" href="#demo-main">
        본문으로 이동
      </a>
      <div className="t-demo-disclosure">
        KOOFY 템플릿 예시 · 실제 사업장·상품·의료기관 안내가 아닙니다.
      </div>
      {options.features.includes('notice') && (
        <div className="t-notice">방문 안내 · 휴무나 행사 소식을 이곳에 표시할 수 있습니다.</div>
      )}
      <TemplateHeader brand={template.brand} home={sectionLink('home')} options={options}>
        {one ? (
          <>
            <a href="#about">소개</a>
            <a href="#services">{template.serviceLabel}</a>
            <a href="#visit">방문·문의</a>
          </>
        ) : (
          demoPages(options.pages, template).map((nav) => (
            <Link
              key={nav.id}
              href={sectionLink(nav.id)}
              aria-current={page === nav.id ? 'page' : undefined}
            >
              {nav.label}
            </Link>
          ))
        )}
      </TemplateHeader>
      <main id="demo-main">
        {page !== 'home' && (
          <div className="t-inner-title">
            <p className="t-eyebrow">{template.english}</p>
            <h1>
              {page === 'about'
                ? '우리의 이야기'
                : page === 'services'
                  ? template.serviceLabel
                  : '방문·문의 안내'}
            </h1>
            <p>{template.tagline}</p>
          </div>
        )}
        <Design template={template} options={options} page={page} href={sectionLink} />
        {(one || page === 'visit') && <Visit template={template} options={options} />}
        {!one && page === 'home' && (
          <nav className="t-home-links" aria-label="다른 페이지 둘러보기">
            <p className="t-eyebrow">EXPLORE MORE</p>
            <div>
              {demoPages(options.pages, template)
                .filter((nav) => nav.id !== 'home')
                .map((nav) => (
                  <Link href={sectionLink(nav.id)} key={nav.id}>
                    <span>{nav.label}</span>
                    <b>↗</b>
                  </Link>
                ))}
            </div>
          </nav>
        )}
        <ContentFeatures template={template} options={options} />
        <p className="t-example-note d-width">
          사진은 AI로 제작한 예시입니다. 이름·상품·서비스·가격·운영시간은 실제 사업장 안내가
          아닙니다.
        </p>
      </main>
      <footer className="t-footer">
        <strong>{template.brand}</strong>
        <p>{template.tagline}</p>
        <small>© {template.brand} · KOOFY 제작 상담용 예시</small>
      </footer>
      <CommonFeatures options={options} />
    </div>
  );
}
