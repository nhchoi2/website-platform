import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import type { Content } from '@/lib/content';
import { Restaurant } from '../hyehwa/Restaurant';
import { findTemplate, type Template } from '../catalog/catalog';
import { demoPages, type DemoPage, type PreviewOptions } from '../catalog/options';
import { TemplateHeader } from '../catalog/TemplateHeader';
import { CommonFeatures } from '../catalog/CommonFeatures';
import { Table } from '../catalog/designs/Table';
import { Editorial } from '../catalog/designs/Editorial';
import { Atelier } from '../catalog/designs/Atelier';
import { Motion } from '../catalog/designs/Motion';
import { Market } from '../catalog/designs/Market';
import { Partner } from '../catalog/designs/Partner';
import { Care } from '../catalog/designs/Care';
import { CustomerFeatures } from './CustomerFeatures';
import '../catalog/catalog.css';
import '../catalog/designs/designs.css';
import './customer.css';
const designs = {
  hyehwa: Table,
  cafe: Editorial,
  salon: Atelier,
  fitness: Motion,
  market: Market,
  professional: Partner,
  care: Care,
};
export function sitePage(content: Content, section?: string[]): DemoPage {
  const page = section?.[0] || 'home';
  if (
    (section?.length || 0) > 1 ||
    !['home', 'about', 'services', 'visit'].includes(page) ||
    (section?.length &&
      (!content.options ||
        content.options.pages === 1 ||
        (page === 'about' && content.options.pages !== 4)))
  )
    notFound();
  return page as DemoPage;
}
export function SiteRenderer({
  content: c,
  siteId,
  privateImages = false,
  page = 'home',
  base = '',
  suffix = '',
}: {
  content: Content;
  siteId: string;
  privateImages?: boolean;
  page?: DemoPage;
  base?: string;
  suffix?: string;
}) {
  const url = (id: string) => `/api/media/${id}${privateImages ? `?private=1&site=${siteId}` : ''}`;
  if (c.template === 'hyehwa' && c.layout !== 'catalog' && !c.options) {
    return (
      <>
        <Restaurant content={c} siteId={siteId} privateImages={privateImages} />
        <CustomerFeatures content={c} siteId={siteId} privateImages={privateImages} />
      </>
    );
  }
  const baseDesign = findTemplate(c.template)!;
  const design = c.customTheme
    ? { ...baseDesign, accent: { olive: '#4c6840', charcoal: '#303837', warm: '#956344' }[c.theme] }
    : baseDesign;
  const options: PreviewOptions = c.options || {
    pages: 1,
    nav: 'right',
    mobileNav: 'hamburger',
    features: [],
    links: {},
  };
  const photo = (id: string, alt: string) => ({
    src: id ? url(id) : '',
    small: id ? url(id) : '',
    alt,
  });
  const t: Template = {
    ...design,
    live: true,
    brand: c.name,
    english: c.name,
    headline: c.tagline || c.name,
    tagline: c.tagline,
    story: c.introduction,
    storyTitle: c.name,
    serviceLabel: c.serviceLabel || '메뉴·서비스',
    items: c.menus.map((m) => ({
      name: m.name,
      detail: m.description,
      price: m.price,
      category: m.category,
    })),
    highlights: c.menus.filter((m) => m.featured).map((m) => m.name),
    customPhotos: {
      hero: photo(c.photos[0]?.assetId || '', c.photos[0]?.alt || c.name),
      items: c.menus.map((m) => photo(m.imageId || '', m.name)),
    },
  };
  const one = options.pages === 1;
  const href = (p: DemoPage) => (one ? `#${p}` : `${base}${p === 'home' ? '' : `/${p}`}${suffix}`);
  const Design = designs[c.template];
  const mapKey = process.env.GOOGLE_MAPS_EMBED_KEY;
  return (
    <div
      className={`t-site t-site-${c.template} customer-site`}
      style={
        {
          '--t-accent': design.accent,
          '--t-paper': design.background,
          '--t-ink': design.ink,
        } as CSSProperties
      }
    >
      <a href="#customer-main" className="skip-link">
        본문으로 이동
      </a>
      {options.features.includes('notice') && c.notice && (
        <div className="t-notice">{c.notice}</div>
      )}
      <TemplateHeader
        brand={c.name}
        home={href('home')}
        options={options}
        logo={c.logoId ? url(c.logoId) : undefined}
        live
      >
        {one ? (
          <>
            <a href="#about">소개</a>
            <a href="#services">{t.serviceLabel}</a>
            <a href="#visit">방문·문의</a>
          </>
        ) : (
          demoPages(options.pages, t).map((n) => (
            <a key={n.id} href={href(n.id)} aria-current={page === n.id ? 'page' : undefined}>
              {n.label}
            </a>
          ))
        )}
      </TemplateHeader>
      <main id="customer-main">
        {page !== 'home' && (
          <header className="t-inner-title">
            <h1>
              {page === 'about' ? '소개' : page === 'services' ? t.serviceLabel : '방문·문의'}
            </h1>
            <p>{c.tagline}</p>
          </header>
        )}
        <Design template={t} options={options} page={page} href={href} />
        {(one || page === 'visit') && (
          <section id="visit" className="t-section">
            <h2>방문·문의 안내</h2>
            <div className="t-visit-grid">
              <div>
                {c.map?.enabled && mapKey ? (
                  <iframe
                    title={`${c.name} 위치 지도`}
                    width="100%"
                    height="320"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapKey)}&q=${encodeURIComponent(c.map.query || c.address)}`}
                    allowFullScreen
                  />
                ) : (
                  <p>{c.address}</p>
                )}
              </div>
              <dl>
                <div>
                  <dt>주소</dt>
                  <dd>{c.address}</dd>
                </div>
                <div>
                  <dt>연락처</dt>
                  <dd>
                    <a href={`tel:${c.phone.replace(/[^+0-9]/g, '')}`}>{c.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>운영시간</dt>
                  <dd style={{ whiteSpace: 'pre-wrap' }}>{c.hours}</dd>
                </div>
                {c.parking && (
                  <div>
                    <dt>휴무·주차</dt>
                    <dd>{c.parking}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="d-tag-row">
              {c.links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
            {options.features.includes('faq') &&
              c.faq?.map((f) => (
                <details key={f.id} className="t-faq">
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
          </section>
        )}
        {(one || page === 'home' || page === 'services') && (
          <CustomerFeatures content={c} siteId={siteId} privateImages={privateImages} />
        )}
      </main>
      <footer className="t-footer">
        <strong>{c.name}</strong>
        <p>
          {c.address} · {c.phone}
        </p>
        <small>© {c.name}</small>
      </footer>
      <CommonFeatures options={options} live />
    </div>
  );
}
