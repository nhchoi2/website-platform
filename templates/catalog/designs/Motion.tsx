import { TemplateArt } from '../TemplateArt';
import type { DesignProps } from './types';

export function Motion({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-motion" data-design="motion">
      {home && (
        <section id="home" className="d-motion-cover d-width">
          <p className="t-eyebrow">{t.english}</p>
          <h1>{t.headline}</h1>
          <div className="d-motion-bottom">
            <div>
              <p>{t.tagline}</p>
              <a className="t-button" href={href('services')}>
                {t.serviceLabel} 찾아보기 ↗
              </a>
            </div>
            <TemplateArt template={t} />
          </div>
          <div className="d-motion-strip">
            {t.highlights.map((x) => (
              <span key={x}>＋ {x}</span>
            ))}
          </div>
        </section>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section d-motion-programs">
          <p className="t-eyebrow">FIND YOUR ROUTINE</p>
          <h2>{t.serviceLabel}</h2>
          <div>
            {t.items.map((item, i) => (
              <article key={item.name}>
                <span className="d-motion-index">0{i + 1}</span>
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <p>{item.detail}</p>
                <strong>{item.price}</strong>
                <a href={href('visit')}>이용 문의 ↗</a>
              </article>
            ))}
          </div>
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-motion-start">
          <div>
            <p className="t-eyebrow">START HERE</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.story}</p>
          </div>
          <ol>
            {['목적과 관심 항목 확인', '방문 일정·운영시간 확인', '담당자와 이용 방법 상담'].map(
              (x, i) => (
                <li key={x}>
                  <span>0{i + 1}</span>
                  {x}
                </li>
              ),
            )}
          </ol>
        </section>
      )}
    </div>
  );
}
