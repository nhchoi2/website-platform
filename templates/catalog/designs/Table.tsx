import { TemplateArt } from '../TemplateArt';
import type { DesignProps } from './types';

export function Table({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-table" data-design="table">
      {home && (
        <section id="home" className="d-table-cover d-width">
          <div className="d-table-sign">
            <p className="t-eyebrow">{t.english}</p>
            <h1>{t.headline}</h1>
            <p>{t.tagline}</p>
            <a className="d-link" href={href('services')}>
              {t.serviceLabel} 확인하기 ↗
            </a>
          </div>
          <TemplateArt template={t} />
          <div className="d-table-stamp">
            {t.brand}
            <span>정성을 담아</span>
          </div>
        </section>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section d-table-menu">
          <div>
            <p className="t-eyebrow">ON THE TABLE</p>
            <h2>{t.serviceLabel}</h2>
            <p>한눈에 보는 우리의 선택.</p>
          </div>
          <div>
            {t.items.map((item, i) => (
              <article key={item.name} className="d-menu-row">
                <TemplateArt template={t} compact photoIndex={i} />
                <div>
                  <small>{item.category}</small>
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </div>
                <strong>{item.price}</strong>
              </article>
            ))}
          </div>
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-table-story">
          <span aria-hidden="true">✳</span>
          <h2>{t.storyTitle}</h2>
          <p>{t.story}</p>
          <div className="d-tag-row">
            {t.highlights.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
