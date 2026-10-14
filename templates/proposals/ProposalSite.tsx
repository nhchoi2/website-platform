import Link from 'next/link';
import type { ProposalRecord, ProposalPhotos, ProposalStyle, ProposalPage } from '@/lib/proposals';
import { Navigation, FloatingActions, ProposalPageTop } from './Navigation';
import { Yongs } from './Yongs';
import { Bamboo } from './Bamboo';
import { Grill } from './Grill';
import { Menus } from './Menu';
import { Visit } from './Visit';
import './proposals.css';

export function ProposalSite({
  proposal,
  photos,
  token,
  style,
  page,
}: {
  proposal: ProposalRecord;
  photos: ProposalPhotos;
  token: string;
  style: ProposalStyle;
  page: ProposalPage;
}) {
  const { content } = proposal;
  const base = `/proposals/${token}/${style}`;
  const Design = { yongs: Yongs, bamboo: Bamboo, grill: Grill }[style];
  return (
    <div className={`proposal-site p-style-${style}`}>
      <ProposalPageTop />
      <a className="skip-link" href="#proposal-main">
        본문으로 이동
      </a>
      <Navigation token={token} style={style} content={content} />
      <main id="proposal-main">
        {page === 'home' ? (
          <Design content={content} photos={photos} base={base} />
        ) : page === 'menu' ? (
          <Menus content={content} photos={photos} />
        ) : (
          <Visit content={content} photos={photos} />
        )}
      </main>
      <section className="p-decision p-width">
        <div>
          <p className="p-eyebrow">DESIGN PROPOSAL</p>
          <h2>이 분위기는 어떠세요?</h2>
          <p>같은 사진과 메뉴로 비교한 뒤, 마음에 드는 시안 번호를 문자로 알려주세요.</p>
          <Link href={`/proposals/${token}`} prefetch={false} className="p-text-link">
            다른 시안과 비교하기 ↗
          </Link>
        </div>
      </section>
      <footer className="p-footer p-width">
        <div>
          <strong>{content.shortName}</strong>
          <p>
            {content.address}
            <br />
            {content.phone}
          </p>
        </div>
        <div>
          <a href={content.links.instagram} target="_blank" rel="noopener noreferrer">
            인스타그램 ↗
          </a>
          <a href={content.links.place} target="_blank" rel="noopener noreferrer">
            네이버 플레이스 ↗
          </a>
        </div>
        <small>
          혜화동 삼겹살 홈페이지 디자인 제안 · 최종 메뉴·가격·운영 정보 확인 전 시안입니다.
        </small>
      </footer>
      <FloatingActions content={content} />
    </div>
  );
}
