import type { ProposalContent, ProposalPhotos } from '@/lib/proposals';
import { Photo } from './Photo';
import { Gallery } from './Gallery';

export function Visit({ content, photos }: { content: ProposalContent; photos: ProposalPhotos }) {
  return (
    <>
      <section className="p-visit-intro p-width">
        <div className="p-page-title">
          <p className="p-eyebrow">COME TO HYEHWA</p>
          <h1>
            대학로의 만남,
            <br />
            대통령에서.
          </h1>
          <p>공연 전후의 한 끼부터 친구와의 저녁, 함께하는 모임까지.</p>
        </div>
        <Photo photo={photos[content.exteriorIds[0] || content.interiorIds[0]]} full />
      </section>
      <section className="p-visit-details p-width">
        <div>
          <p className="p-eyebrow">VISIT US</p>
          <h2>
            혜화역 1번 출구에서
            <br />
            걸어서 약 3분.
          </h2>
          <p>버거킹을 지나 GS25 편의점 골목으로 들어오시면 매장을 만날 수 있습니다.</p>
          <a
            className="p-button"
            href={content.links.place}
            target="_blank"
            rel="noopener noreferrer"
          >
            네이버 플레이스로 길찾기 ↗
          </a>
        </div>
        <dl>
          <div>
            <dt>주소</dt>
            <dd>{content.address}</dd>
          </div>
          <div>
            <dt>전화·예약</dt>
            <dd>
              <a href={`tel:${content.phone.replace(/[^+0-9]/g, '')}`}>{content.phone}</a>
            </dd>
          </div>
          <div>
            <dt>영업시간</dt>
            <dd>{content.hours}</dd>
          </div>
          <div>
            <dt>주차</dt>
            <dd>{content.parking}</dd>
          </div>
          <div>
            <dt>단체·대관</dt>
            <dd>단체 예약과 대관 가능 · 인원과 일정은 전화로 문의해 주세요.</dd>
          </div>
          <div>
            <dt>콜키지</dt>
            <dd>주류 제한 없이 무료 · 최대 1병으로 안내되어 있습니다. 예약 시 확인해 주세요.</dd>
          </div>
        </dl>
      </section>
      <section className="p-space-section p-width">
        <div className="p-section-heading">
          <p className="p-eyebrow">OUR SPACE</p>
          <h2>
            좋은 사람들과,
            <br />
            편안한 한 상.
          </h2>
          <p>사진을 누르면 매장 내부를 크게 볼 수 있습니다.</p>
        </div>
        <Gallery photos={content.interiorIds.map((id) => photos[id])} />
      </section>
      <section className="p-faq p-width">
        <h2>방문 전 궁금한 점</h2>
        <details>
          <summary>예약은 어떻게 하나요?</summary>
          <p>매장 전화 {content.phone} 또는 네이버 플레이스에서 예약 가능 여부를 확인해 주세요.</p>
        </details>
        <details>
          <summary>브레이크타임이 있나요?</summary>
          <p>
            평일에는 오후 3시부터 4시까지 브레이크타임이 안내되어 있습니다. 주말 시간표에는
            브레이크타임 표기가 없습니다.
          </p>
        </details>
        <details>
          <summary>주차가 가능한가요?</summary>
          <p>{content.parking}</p>
        </details>
        <details>
          <summary>단체 모임이나 대관도 가능한가요?</summary>
          <p>
            단체 이용과 대관을 안내하고 있습니다. 인원·메뉴·주말 단독 대관은 매장에 미리 문의해
            주세요.
          </p>
        </details>
      </section>
    </>
  );
}
