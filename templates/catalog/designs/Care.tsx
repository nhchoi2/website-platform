import { TemplateArt } from '../TemplateArt';
import type { DesignProps } from './types';

export function Care({ template: t, options, page, href }: DesignProps) {
  const home = page === 'home';
  const one = options.pages === 1;
  return (
    <div className="d-care" data-design="care">
      {home && (
        <section id="home" className="d-care-cover d-width">
          <div className="d-care-message">
            <p className="t-eyebrow">{t.english}</p>
            <h1>{t.headline}</h1>
            <p>{t.tagline}</p>
          </div>
          <div className="d-care-quick">
            <a href={href('visit')}>
              <span>01</span>
              <strong>운영시간·휴무</strong>
              <small>방문 전 확인 ↗</small>
            </a>
            <a href={href('services')}>
              <span>02</span>
              <strong>{t.serviceLabel}</strong>
              <small>처음 이용하신다면 ↗</small>
            </a>
            <a href={href('visit')}>
              <span>03</span>
              <strong>오시는 길·문의</strong>
              <small>위치와 연락처 ↗</small>
            </a>
          </div>
        </section>
      )}
      {(one || page === 'services' || home) && (
        <section id="services" className="t-section d-care-directory">
          <div>
            <p className="t-eyebrow">BEFORE YOUR VISIT</p>
            <h2>{t.serviceLabel}</h2>
            <p>
              필요한 항목을 펼쳐
              <br />
              자세히 확인하세요.
            </p>
          </div>
          <div>
            {t.items.map((item, i) => (
              <details key={item.name} open={i === 0}>
                <summary>
                  <span>{item.name}</span>
                  <b>＋</b>
                </summary>
                <small>{item.category}</small>
                <p>{item.detail}</p>
                <strong>{item.price}</strong>
                <p>
                  <a className="d-link" href={href('visit')}>
                    방문·문의 안내 ↗
                  </a>
                </p>
              </details>
            ))}
          </div>
        </section>
      )}
      {(one || page === 'about' || (home && options.pages === 3)) && (
        <section id="about" className="t-section d-care-about">
          <TemplateArt template={t} />
          <div>
            <p className="t-eyebrow">CLOSE TO YOU</p>
            <h2>{t.storyTitle}</h2>
            <p>{t.story}</p>
            <ul>
              {t.highlights.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
