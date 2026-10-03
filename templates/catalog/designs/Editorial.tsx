import { TemplateArt } from '../TemplateArt';
import type { DesignProps } from './types';

export function Editorial({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-editorial" data-design="editorial">
      {home && (
        <section id="home" className="d-editorial-cover">
          <div className="d-width">
            <p className="t-eyebrow">A MOMENT WITH {t.english}</p>
            <h1>{t.headline}</h1>
            <p>{t.tagline}</p>
          </div>
          <div className="d-editorial-image">
            <TemplateArt template={t} />
            <a href={href('about')}>OUR STORY ↓</a>
          </div>
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-editorial-story">
          <span className="d-issue">01 / JOURNAL</span>
          <h2>{t.storyTitle}</h2>
          <div>
            <p>{t.story}</p>
            <p className="d-editorial-caption">{t.highlights.join(' · ')}</p>
          </div>
        </section>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section d-editorial-collection">
          <div className="d-section-title">
            <p className="t-eyebrow">THE COLLECTION</p>
            <h2>{t.serviceLabel}</h2>
          </div>
          {t.items.map((item, i) => (
            <article key={item.name}>
              <span className="d-collection-number">0{i + 1}</span>
              <div>
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
              </div>
              <strong>{item.price}</strong>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
