import { TemplateArt } from '../TemplateArt';
import { CategoryItems } from './CategoryItems';
import type { DesignProps } from './types';

export function Atelier({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-atelier" data-design="atelier">
      {home && (
        <section id="home" className="d-atelier-cover d-width">
          <div className="d-atelier-title">
            <p className="t-eyebrow">{t.english} / COLLECTION</p>
            <h1>{t.headline}</h1>
          </div>
          <div className="d-atelier-main-art">
            <TemplateArt template={t} />
          </div>
          <div className="d-atelier-side">
            <div className="d-atelier-mark" aria-hidden="true">
              a.
            </div>
            <p>{t.tagline}</p>
            <a className="d-link" href={href('services')}>
              {t.serviceLabel} 둘러보기 ↗
            </a>
          </div>
        </section>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section">
          <div className="d-section-title">
            <p className="t-eyebrow">WORK & DETAILS</p>
            <h2>{t.serviceLabel}</h2>
            <p>관심 있는 분류를 선택해 살펴보세요.</p>
          </div>
          <CategoryItems template={t} presentation="portfolio" />
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-atelier-manifesto">
          <p className="t-eyebrow">THE WAY WE WORK</p>
          <h2>{t.storyTitle}</h2>
          <p>{t.story}</p>
          <ol>
            {t.highlights.map((x, i) => (
              <li key={x}>
                <span>0{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
