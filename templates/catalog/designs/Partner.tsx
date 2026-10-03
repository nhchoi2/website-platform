import { TemplateArt } from '../TemplateArt';
import type { DesignProps } from './types';

export function Partner({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-partner" data-design="partner">
      {home && (
        <section id="home" className="d-partner-cover d-width">
          <div>
            <p className="t-eyebrow">{t.english}</p>
            <h1>{t.headline}</h1>
            <p>{t.tagline}</p>
            <a className="t-button" href={href('visit')}>
              상담·방문 안내 ↗
            </a>
          </div>
          <aside aria-label="업무 바로가기">
            <p>어떤 도움이 필요하신가요?</p>
            {t.items.map((item, i) => (
              <a
                key={item.name}
                href={
                  options.pages === 1
                    ? `#partner-service-${i}`
                    : `${href('services')}#partner-service-${i}`
                }
              >
                <small>
                  0{i + 1} / {item.category}
                </small>
                <strong>{item.name}</strong>
                <span>↗</span>
              </a>
            ))}
          </aside>
        </section>
      )}
      {home && (
        <div className="d-width d-partner-photo">
          <TemplateArt template={t} />
        </div>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section d-partner-services">
          <div>
            <p className="t-eyebrow">OUR EXPERTISE</p>
            <h2>{t.serviceLabel}</h2>
            <p>
              필요한 업무의 범위부터
              <br />
              차분하게 확인합니다.
            </p>
          </div>
          <div>
            {t.items.map((item, i) => (
              <article key={item.name} id={`partner-service-${i}`}>
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
                <strong>{item.price}</strong>
                <a className="d-link" href={href('visit')}>
                  이 업무 문의하기 ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-partner-principles">
          <p className="t-eyebrow">OUR STANDARD</p>
          <h2>{t.storyTitle}</h2>
          <p>{t.story}</p>
          <div>
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
