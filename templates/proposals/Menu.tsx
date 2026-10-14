'use client';
import { useState } from 'react';
import type { ProposalContent, ProposalPhotos } from '@/lib/proposals';
import { Photo } from './Photo';

export function Menus({ content, photos }: { content: ProposalContent; photos: ProposalPhotos }) {
  const [category, setCategory] = useState('전체');
  const [detail, setDetail] = useState<string | null>(null);
  const categories = ['전체', ...new Set(content.menus.map((m) => m.category))];
  const menus = content.menus.filter((menu) => category === '전체' || menu.category === category);
  return (
    <section className="p-menu-section p-width">
      <div className="p-page-title">
        <p className="p-eyebrow">OUR MENU</p>
        <h1>한 점부터 한 상까지.</h1>
        <p>대나무 초벌 삼겹살과 숙성 한돈, 함께 즐기는 한우와 식사.</p>
      </div>
      <nav className="p-categories" aria-label="메뉴 종류">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            aria-pressed={category === cat}
            onClick={() => {
              setCategory(cat);
              setDetail(null);
            }}
          >
            {cat}
          </button>
        ))}
      </nav>
      <div className="p-menu-grid">
        {menus.map((menu) => (
          <article
            key={menu.id}
            className={`p-menu-card ${detail === menu.id ? 'is-expanded' : ''}`}
          >
            <Photo photo={photos[menu.imageId]} />
            <div className="p-menu-copy">
              <div>
                {menu.featured && <span className="p-menu-badge">대표 메뉴</span>}
                <h2>{menu.name}</h2>
                <strong className="p-price">
                  {menu.price.toLocaleString('ko-KR')}
                  <small>원</small>
                </strong>
              </div>
              {menu.description && (
                <>
                  <p id={`menu-detail-${menu.id}`} className="p-menu-description">
                    {menu.description}
                  </p>
                  <button
                    type="button"
                    className="p-menu-detail"
                    aria-expanded={detail === menu.id}
                    aria-controls={`menu-detail-${menu.id}`}
                    onClick={() => setDetail(detail === menu.id ? null : menu.id)}
                  >
                    {detail === menu.id ? '설명 접기 −' : '메뉴 설명 +'}
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className="p-source-note">
        플레이스 메뉴 기준 · {content.sourceDate} 확인. 최종 메뉴·가격·중량은 공개 전 매장 확인 후
        확정합니다.
      </p>
    </section>
  );
}
