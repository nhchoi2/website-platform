import Link from 'next/link';
import { Photo } from './Photo';
import type { ProposalDesignProps } from './types';

export function Bamboo({ content, photos, base }: ProposalDesignProps) {
  const featured = content.menus.filter((m) => m.featured).slice(0, 4);
  return (
    <>
      <section className="p-bamboo-hero p-width">
        <div className="p-bamboo-intro">
          <p className="p-eyebrow">HYEHWA · BAMBOO & PORK</p>
          <h1>
            시간을 담고,
            <br />
            풍미를 열다.
          </h1>
          <p>
            대나무의 향과 숙성의 깊이.
            <br />
            대학로에서 만나는 대통령의 한 점.
          </p>
          <Link href={`${base}/menu`} prefetch={false} className="p-button">
            대통령의 메뉴 →
          </Link>
          <span className="p-bamboo-scroll">SCROLL TO DISCOVER ↓</span>
        </div>
        <div className="p-bamboo-visual">
          <Photo photo={photos[content.heroIds[0]]} full eager />
          <Photo photo={photos[content.storyIds[1]]} />
          <span>竹 / 대나무에서 시작된 이야기</span>
        </div>
      </section>
      <section className="p-bamboo-message">
        <div className="p-width">
          <span>竹</span>
          <div>
            <p className="p-eyebrow">OUR WAY</p>
            <h2>
              좋은 재료에
              <br />
              우리만의 시간을 더합니다.
            </h2>
            <p>{content.introduction}</p>
          </div>
        </div>
      </section>
      <section className="p-bamboo-signature p-width">
        <div className="p-section-heading">
          <p className="p-eyebrow">THE TABLE</p>
          <h2>
            한 점의 정성,
            <br />한 상의 즐거움.
          </h2>
          <Link href={`${base}/menu`} prefetch={false} className="p-text-link">
            전체 메뉴 보기 ↗
          </Link>
        </div>
        <div>
          {featured.map((menu, i) => (
            <Link key={menu.id} href={`${base}/menu`} prefetch={false}>
              <span className="p-bamboo-menu-index">0{i + 1}</span>
              <Photo photo={photos[menu.imageId]} />
              <div>
                <h3>{menu.name}</h3>
                <p>{menu.description}</p>
              </div>
              <strong>
                {menu.price.toLocaleString('ko-KR')}
                <small>원</small>
              </strong>
            </Link>
          ))}
        </div>
      </section>
      <section className="p-bamboo-space">
        <Photo photo={photos[content.storyIds[2]]} full />
        <div>
          <p className="p-eyebrow">A PLACE TO GATHER</p>
          <h2>
            좋은 만남이
            <br />
            머무는 자리.
          </h2>
          <p>
            공연의 여운과 식사의 즐거움이 이어지는 대학로.
            <br />
            소중한 사람들과 편안한 한 끼를 나누세요.
          </p>
          <Link href={`${base}/visit`} prefetch={false} className="p-button p-outline">
            공간과 방문 안내 →
          </Link>
        </div>
      </section>
    </>
  );
}
