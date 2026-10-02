import type { CSSProperties } from 'react';
import type { Content } from '@/lib/content';
import './hyehwa.css';

const palettes = {
  olive: ['#393a32', '#faf9f6', '#72745f'],
  charcoal: ['#252525', '#fcfcfa', '#5e6263'],
  warm: ['#653c2c', '#fcf7f0', '#966447'],
};
export function Restaurant({
  content,
  siteId,
  privateImages = false,
  sampleImages,
}: {
  content: Content;
  siteId: string;
  privateImages?: boolean;
  // Only the public template demo supplies bundled, non-customer sample assets.
  sampleImages?: Record<string, string>;
}) {
  const colors = palettes[content.theme];
  const image = (id: string) =>
    sampleImages?.[id] || `/api/media/${id}${privateImages ? `?private=1&site=${siteId}` : ''}`;
  const featured = content.menus.filter((m) => m.featured);
  const categories = [...new Set(content.menus.map((m) => m.category || '메뉴'))];
  return (
    <div
      className="restaurant"
      style={
        {
          '--restaurant-primary': colors[0],
          '--restaurant-bg': colors[1],
          '--restaurant-accent': colors[2],
        } as CSSProperties
      }
    >
      <a className="skip-link" href="#restaurant-main">
        본문으로 이동
      </a>
      <header className="r-header">
        <div className="r-container r-header-inner">
          <a className="r-brand" href="#restaurant-main">
            {content.name || '매장 이름'}
          </a>
          <nav aria-label="매장 안내">
            <a href="#about">소개</a>
            <a href="#menu">메뉴</a>
            <a href="#location">오시는 길</a>
          </nav>
        </div>
      </header>
      <main id="restaurant-main" className="r-container">
        <section className="r-hero">
          <div>
            <p className="r-eyebrow">GOOD FOOD, WARM MOMENTS</p>
            <h1>{content.name || '정성으로 차린 한 끼'}</h1>
            <p className="r-tagline">{content.tagline || '소중한 사람과 함께하는 맛있는 시간'}</p>
            <div className="r-actions">
              <a className="r-button r-primary" href="#menu">
                메뉴 보기 ↗
              </a>
              <a className="r-button" href="#location">
                오시는 길 ↗
              </a>
            </div>
          </div>
          <div className="r-hero-image">
            {content.photos[0] ? (
              <img
                src={image(content.photos[0].assetId)}
                alt={content.photos[0].alt || content.name}
              />
            ) : (
              <div className="r-placeholder">
                <span>매장의 첫인상을 담아주세요</span>
              </div>
            )}
          </div>
        </section>
        <section id="about" className="r-section r-intro">
          <div>
            <p className="r-eyebrow">OUR STORY</p>
            <h2>
              맛있는 시간,
              <br />
              우리의 이야기
            </h2>
          </div>
          <p className="r-prose">{content.introduction || '매장 소개를 준비하고 있습니다.'}</p>
        </section>
        {content.photos.length > 1 && (
          <section className="r-gallery" aria-label="매장 사진">
            {content.photos.slice(1).map((p) => (
              <figure key={p.id}>
                <img src={image(p.assetId)} alt={p.alt || content.name} loading="lazy" />
                {p.alt && <figcaption>{p.alt}</figcaption>}
              </figure>
            ))}
          </section>
        )}
        {featured.length > 0 && (
          <section className="r-section">
            <p className="r-eyebrow">SIGNATURE</p>
            <h2>대표 메뉴</h2>
            <div className="r-menu-grid">
              {featured.map((menu) => (
                <article key={menu.id}>
                  {menu.imageId ? (
                    <img
                      className="r-menu-image"
                      src={image(menu.imageId)}
                      alt={menu.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="r-placeholder r-menu-image">{menu.name}</div>
                  )}
                  <span className="r-badge">대표 메뉴</span>
                  <div className="r-menu-title">
                    <h3>{menu.name}</h3>
                    <span>{menu.price}</span>
                  </div>
                  <p>{menu.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        <section id="menu" className="r-section">
          <p className="r-eyebrow">OUR MENU</p>
          <h2>정성껏 준비한 메뉴</h2>
          {categories.length ? (
            categories.map((category) => (
              <div key={category} className="r-category">
                <h3>{category}</h3>
                <div className="r-menu-list">
                  {content.menus
                    .filter((m) => (m.category || '메뉴') === category)
                    .map((m) => (
                      <article key={m.id}>
                        {m.imageId && <img src={image(m.imageId)} alt={m.name} loading="lazy" />}
                        <div>
                          <h4>
                            {m.name} {m.featured && <small>대표</small>}
                          </h4>
                          <p>{m.description}</p>
                        </div>
                        <strong>{m.price}</strong>
                      </article>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <p>메뉴를 준비하고 있습니다.</p>
          )}
        </section>
        <section id="location" className="r-section r-location">
          <div>
            <p className="r-eyebrow">VISIT US</p>
            <h2>편안하게 찾아오세요</h2>
            <p>{content.name}</p>
          </div>
          <div>
            <dl>
              <div>
                <dt>주소</dt>
                <dd>{content.address || '안내 준비 중'}</dd>
              </div>
              <div>
                <dt>연락처</dt>
                <dd>
                  {content.phone ? (
                    <a href={`tel:${content.phone.replace(/[^0-9+]/g, '')}`}>{content.phone}</a>
                  ) : (
                    '안내 준비 중'
                  )}
                </dd>
              </div>
              <div>
                <dt>영업시간</dt>
                <dd>{content.hours || '안내 준비 중'}</dd>
              </div>
            </dl>
            <div className="r-actions">
              {content.links
                .filter((l) => /^https?:\/\//i.test(l.url))
                .map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="r-button"
                  >
                    {l.label} ↗
                  </a>
                ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="r-footer">
        <div className="r-container">
          <strong>{content.name}</strong>
          <p>{content.address}</p>
          <small>© {content.name}. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
}
