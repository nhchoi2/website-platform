'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Photo } from './Photo';
import type { ProposalDesignProps } from './types';

export function Yongs({ content, photos, base }: ProposalDesignProps) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % content.heroIds.length), 6500);
    return () => clearInterval(timer);
  }, [content.heroIds.length]);
  const featured = content.menus.filter((m) => m.featured).slice(0, 3);
  return (
    <>
      <section className="p-yongs-hero">
        <div className="p-hero-photos">
          {content.heroIds.map((id, i) => (
            <div key={id} className={index === i ? 'is-current' : ''} aria-hidden={index !== i}>
              <Photo photo={photos[id]} full eager={i === 0} />
            </div>
          ))}
        </div>
        <div className="p-yongs-hero-content">
          <p className="p-eyebrow">혜화역 1번 출구 · 도보 약 3분</p>
          <h1>
            대나무에서 완성되는
            <br />한 점의 특별함.
          </h1>
          <p className="p-hero-description">
            대나무 초벌과 숙성으로 만나는 1등급 한돈.
            <br />
            대학로의 저녁을 대통령에서 함께하세요.
          </p>
          <div className="p-tags">
            <span>한돈 1등급</span>
            <span>대나무 초벌·숙성</span>
            <span>단체·대관 가능</span>
          </div>
          <div className="p-actions">
            <Link href={`${base}/menu`} prefetch={false} className="p-button">
              메뉴 보기 →
            </Link>
            <a
              href={content.links.place}
              target="_blank"
              rel="noopener noreferrer"
              className="p-button p-outline"
            >
              플레이스·예약 ↗
            </a>
          </div>
          <div className="p-carousel-dots">
            {content.heroIds.map((id, i) => (
              <button
                type="button"
                key={id}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 대표 사진 보기`}
                aria-pressed={index === i}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="p-story-section p-width">
        <div className="p-section-heading">
          <p className="p-eyebrow">A LITTLE DIFFERENT</p>
          <h2>
            익숙한 삼겹살,
            <br />
            대통령만의 방식으로.
          </h2>
          <p>엄선한 한돈과 대나무. 좋은 한 끼를 준비하는 두 가지 재료.</p>
        </div>
        <div className="p-yongs-stories">
          <Photo photo={photos[content.storyIds[0]]} />
          <div>
            <span className="p-story-number">01</span>
            <h3>
              대나무가 품은
              <br />
              깊은 풍미.
            </h3>
            <p>
              대나무통에서 초벌한 한돈 삼겹살을 돌판에서 구워 즐깁니다. 대통령을 대표하는 특별한 한
              점입니다.
            </p>
          </div>
          <Photo photo={photos[content.storyIds[1]]} />
          <div>
            <span className="p-story-number">02</span>
            <h3>
              함께할수록
              <br />
              풍성한 한 상.
            </h3>
            <p>
              삼겹살부터 한우와 육회까지. 2인부터 여럿이 함께 즐길 수 있는 다양한 세트 메뉴를
              준비했습니다.
            </p>
          </div>
          <div>
            <span className="p-story-number">03</span>
            <h3>
              공연 끝난 뒤,
              <br />
              우리의 이야기가 시작되는 곳.
            </h3>
            <p>
              대학로에서의 데이트, 친구들과의 저녁, 가족과 동료의 모임. 편안한 공간에서 좋은 시간을
              나눠보세요.
            </p>
            <Link href={`${base}/visit`} prefetch={false} className="p-text-link">
              매장 둘러보기 ↗
            </Link>
          </div>
          <Photo photo={photos[content.storyIds[2]]} />
        </div>
      </section>
      <section className="p-featured p-width">
        <div className="p-section-heading">
          <p className="p-eyebrow">SIGNATURE MENU</p>
          <h2>오늘의 한 상을 골라보세요.</h2>
        </div>
        <div className="p-featured-grid">
          {featured.map((menu) => (
            <Link key={menu.id} href={`${base}/menu`} prefetch={false}>
              <Photo photo={photos[menu.imageId]} />
              <div>
                <h3>{menu.name}</h3>
                <span>{menu.price.toLocaleString('ko-KR')}원</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href={`${base}/menu`} prefetch={false} className="p-text-link">
          전체 메뉴와 가격 보기 →
        </Link>
      </section>
    </>
  );
}
