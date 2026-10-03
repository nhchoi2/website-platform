import { TemplateArt } from '../TemplateArt';
import { CategoryItems } from './CategoryItems';
import type { DesignProps } from './types';

export function Market({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-market" data-design="market">
      {home && (
        <section id="home" className="d-market-cover d-width">
          <div>
            <span className="d-market-label">이번 주 추천 · 예시</span>
            <h1>{t.headline}</h1>
            <p>{t.tagline}</p>
            <a className="t-button" href={href('services')}>
              {t.serviceLabel} 보기 ↗
            </a>
            <small>판매·주문은 매장에서 안내합니다.</small>
          </div>
          <TemplateArt template={t} />
        </section>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section">
          <div className="d-section-title">
            <p className="t-eyebrow">TODAY’S PICKS</p>
            <h2>{t.serviceLabel}</h2>
            <p>분류별로 보고, 방문 전 확인하세요.</p>
          </div>
          <CategoryItems template={t} presentation="products" />
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-market-info">
          <div>
            <p className="t-eyebrow">YOUR NEIGHBORHOOD</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.story}</p>
          </div>
          <div className="d-market-perks">
            {t.highlights.map((x, i) => (
              <article key={x}>
                <span>0{i + 1}</span>
                <h3>{x}</h3>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
