import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Template } from './catalog';
import { demoPages, previewHref, type DemoPage, type PreviewOptions } from './options';
import { TemplateArt } from './TemplateArt';
import { CommonFeatures } from './CommonFeatures';
import { PreviewBridge } from './PreviewBridge';
import './catalog.css';

export function DemoSite({
  template,
  options,
  page,
}: {
  template: Template;
  options: PreviewOptions;
  page: DemoPage;
}) {
  const one = options.pages === 1;
  const sectionLink = (target: DemoPage) =>
    one ? `#${target}` : previewHref(template.slug, target, options);
  const story = (
    <section id="about" className="t-section t-story">
      <div>
        <p className="t-eyebrow">OUR STORY</p>
        <h2>{template.storyTitle}</h2>
      </div>
      <div>
        <p>{template.story}</p>
        <ul className="t-highlights">
          {template.highlights.map((item, i) => (
            <li key={item}>
              <span>0{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
  const services = (
    <section id="services" className="t-section">
      <div className="t-section-heading">
        <div>
          <p className="t-eyebrow">WHAT WE OFFER</p>
          <h2>{template.serviceLabel}</h2>
        </div>
        <p>우리 매장을 만나는 다양한 방법.</p>
      </div>
      <div className="t-services">
        {template.items.map((item, i) => (
          <article key={item.name}>
            <div className={`t-item-art t-item-${i}`} aria-hidden="true">
              <span>0{i + 1}</span>
              <b>{item.category}</b>
            </div>
            <small>{item.category}</small>
            <h3>{item.name}</h3>
            <p>{item.detail}</p>
            <strong>{item.price}</strong>
          </article>
        ))}
      </div>
      <p className="t-example-note">이름·상품·서비스·가격은 디자인 확인을 위한 예시입니다.</p>
    </section>
  );
  const visit = (
    <section id="visit" className="t-section">
      <div className="t-section-heading">
        <div>
          <p className="t-eyebrow">COME SAY HELLO</p>
          <h2>방문·문의 안내</h2>
        </div>
        <p>방문 전 필요한 정보를 한곳에서.</p>
      </div>
      <div className="t-visit-grid">
        <div className="t-map-art" role="img" aria-label="실제 위치가 아닌 예시 지도">
          <span>⌖</span>
          <strong>{template.brand}</strong>
          <small>실제 위치를 표시하지 않는 예시 지도</small>
        </div>
        <dl>
          <div>
            <dt>주소</dt>
            <dd>실제 매장 주소가 들어갑니다.</dd>
          </div>
          <div>
            <dt>연락처</dt>
            <dd>실제 연락처가 들어갑니다.</dd>
          </div>
          <div>
            <dt>운영시간</dt>
            <dd>평일 10:00–19:00 · 예시 운영시간</dd>
          </div>
          <div>
            <dt>휴무·주차</dt>
            <dd>정기 휴무와 주차 안내를 입력합니다.</dd>
          </div>
        </dl>
      </div>
      {options.features.includes('faq') && (
        <div className="t-faq">
          <h3>자주 묻는 질문</h3>
          {[
            [
              '방문 전에 확인할 내용이 있나요?',
              '운영시간과 휴무를 확인하고 필요한 경우 전화나 외부 예약 서비스를 이용해 주세요.',
            ],
            [
              '주차 안내는 어디서 확인하나요?',
              '실제 제작 시 매장의 주차 위치와 이용 조건을 안내합니다.',
            ],
            [
              '이 화면에서 예약할 수 있나요?',
              '템플릿 예시입니다. 실제 예약은 접수되지 않으며, 고객의 예약 서비스 링크를 연결할 수 있습니다.',
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>＋</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
  return (
    <div
      className={`t-site t-site-${template.slug}`}
      style={
        {
          '--t-accent': template.accent,
          '--t-paper': template.background,
          '--t-ink': template.ink,
        } as CSSProperties
      }
    >
      <PreviewBridge slug={template.slug} page={page} />
      <a className="skip-link" href="#demo-main">
        본문으로 이동
      </a>
      <div className="t-demo-disclosure">
        KOOFY 템플릿 예시 · 실제 사업장·상품·의료기관 안내가 아닙니다.
      </div>
      {options.features.includes('notice') && (
        <div className="t-notice">방문 안내 · 휴무나 행사 소식을 이곳에 표시할 수 있습니다.</div>
      )}
      <header className="t-header">
        <a className="t-brand" href={sectionLink('home')}>
          {template.brand}
          <span>✳</span>
        </a>
        <nav aria-label="예시 사이트 메뉴">
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
        </nav>
      </header>
      <main id="demo-main">
        {page === 'home' && (
          <section id="home" className="t-hero">
            <div className="t-hero-copy">
              <p className="t-eyebrow">{template.english}</p>
              <h1>
                {template.headline.split('\n').map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p>{template.tagline}</p>
              <a className="t-button" href={sectionLink('services')}>
                {template.serviceLabel} 살펴보기 <span>↗</span>
              </a>
              <small>LOCAL BUSINESS / MADE WITH CARE</small>
            </div>
            <TemplateArt template={template} />
          </section>
        )}
        {page !== 'home' && (
          <div className="t-inner-title">
            <p className="t-eyebrow">{template.english}</p>
            <h1>
              {page === 'about'
                ? '우리의 이야기'
                : page === 'services'
                  ? template.serviceLabel
                  : '가까이에서 만나요.'}
            </h1>
            <p>{template.tagline}</p>
          </div>
        )}
        {(one || page === 'about' || (page === 'home' && options.pages === 3)) && story}
        {(one || page === 'services') && services}
        {(one || page === 'visit') && visit}
        {!one && page === 'home' && (
          <section className="t-home-links">
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
          </section>
        )}
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
