import Link from 'next/link';
import { Photo } from './Photo';
import type { ProposalDesignProps } from './types';

export function Grill({ content, photos, base }: ProposalDesignProps) {
  const featured = content.menus.filter((m) => m.category === '세트 메뉴').slice(0, 3);
  return (
    <>
      <section className="p-grill-hero p-width">
        <div className="p-grill-title">
          <p className="p-eyebrow">HYEHWA ORIGINAL · 삼겹살 대통령</p>
          <h1>
            오늘 고기는,
            <br />
            <em>대통령.</em>
          </h1>
          <p>
            대나무 초벌 삼겹살부터 한우 투뿔까지.
            <br />
            먹고 싶은 한 상을 지금 골라보세요.
          </p>
          <Link href={`${base}/menu`} prefetch={false} className="p-button">
            메뉴·가격 바로 보기 ↗
          </Link>
        </div>
        <div className="p-grill-visual">
          <Photo photo={photos[content.heroIds[1] || content.heroIds[0]]} full eager />
          <span className="p-grill-stamp">
            BAMBOO
            <br />
            GRILL
            <br />
            <b>한돈 1등급</b>
          </span>
          <span className="p-grill-image-label">대나무에서 시작되는 특별한 삼겹살</span>
        </div>
      </section>
      <div className="p-grill-strip">
        <span>대나무 초벌</span>
        <span>숙성 한돈</span>
        <span>한우 투뿔</span>
        <span>단체 모임</span>
        <span>혜화역 도보 3분</span>
      </div>
      <section className="p-grill-sets p-width">
        <div className="p-section-heading">
          <p className="p-eyebrow">GOOD FOOD. GOOD COMPANY.</p>
          <h2>
            모이면 더 좋은
            <br />
            대통령의 세트.
          </h2>
          <Link href={`${base}/menu`} prefetch={false} className="p-text-link">
            세트 메뉴 전체 보기 →
          </Link>
        </div>
        <div className="p-grill-set-grid">
          {featured.map((menu, i) => (
            <Link href={`${base}/menu`} prefetch={false} key={menu.id}>
              <Photo photo={photos[menu.imageId]} />
              <div>
                <span className="p-grill-card-no">SET / 0{i + 1}</span>
                <h3>{menu.name}</h3>
                <p>{menu.description}</p>
                <strong>
                  {menu.price.toLocaleString('ko-KR')}
                  <small>원</small>
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="p-grill-story p-width">
        <Photo photo={photos[content.storyIds[0]]} full />
        <div>
          <p className="p-eyebrow">NOT JUST ANOTHER BBQ</p>
          <h2>
            삼겹살에도
            <br />
            대통령만의 방식.
          </h2>
          <p>{content.introduction}</p>
          <div className="p-grill-facts">
            <span>
              <b>1등급</b>엄선한 한돈
            </span>
            <span>
              <b>대나무</b>특별한 초벌·숙성
            </span>
            <span>
              <b>혜화</b>직영 본점
            </span>
          </div>
        </div>
      </section>
      <section className="p-grill-visit p-width">
        <p className="p-eyebrow">YOUR NEXT DINNER</p>
        <h2>
          다음 만남은
          <br />
          대통령에서.
        </h2>
        <div>
          <p>
            {content.address}
            <br />
            {content.phone}
          </p>
          <Link href={`${base}/visit`} prefetch={false} className="p-button">
            매장 소개·찾아오는 길 ↗
          </Link>
        </div>
      </section>
    </>
  );
}
