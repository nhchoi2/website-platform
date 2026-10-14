import Link from 'next/link';
import { proposalStyles, type ProposalRecord, type ProposalPhotos } from '@/lib/proposals';
import { Photo } from './Photo';
import { ProposalPageTop } from './Navigation';
import './proposals.css';

export function Chooser({
  proposal,
  photos,
  token,
}: {
  proposal: ProposalRecord;
  photos: ProposalPhotos;
  token: string;
}) {
  const { content } = proposal;
  return (
    <div className="proposal-chooser">
      <ProposalPageTop />
      <header className="p-chooser-header">
        <span>대통령 × KOOFY</span>
        <span>WEBSITE DESIGN PROPOSAL / 01</span>
      </header>
      <main className="p-chooser-main">
        <div className="p-chooser-title">
          <p className="p-eyebrow">혜화 삼겹살 대통령 직영 본점</p>
          <h1>
            우리 가게를 만나는
            <br />
            <em>세 가지 첫인상.</em>
          </h1>
          <p>
            같은 음식, 같은 공간. 홈페이지의 분위기를 골라보세요.
            <br />각 시안은 메인 · 메뉴 소개 · 매장 소개, 총 3페이지입니다.
          </p>
        </div>
        <div className="p-proposal-cards">
          {proposalStyles.map((style, i) => (
            <article key={style.id}>
              <Link
                className={`p-mini p-mini-${style.id}`}
                href={`/proposals/${token}/${style.id}`}
                prefetch={false}
                aria-label={`${style.name} 홈페이지 둘러보기`}
              >
                <div className="p-mini-header">
                  <strong>대통령</strong>
                  <span>메뉴　매장 소개</span>
                </div>
                <Photo photo={photos[content.heroIds[i % content.heroIds.length]]} />
                <div className="p-mini-copy">
                  <small>
                    {style.id === 'yongs'
                      ? '혜화역에서 만나는 특별한 한 점'
                      : style.id === 'bamboo'
                        ? 'BAMBOO & PORK'
                        : 'HYEHWA ORIGINAL'}
                  </small>
                  <b>
                    {style.id === 'yongs' ? (
                      <>
                        대나무에서 완성되는
                        <br />한 점의 특별함.
                      </>
                    ) : style.id === 'bamboo' ? (
                      <>
                        시간을 담고,
                        <br />
                        풍미를 열다.
                      </>
                    ) : (
                      <>
                        오늘 고기는,
                        <br />
                        대통령.
                      </>
                    )}
                  </b>
                  <span>메뉴 보기 →</span>
                </div>
              </Link>
              <div className="p-proposal-card-copy">
                <span className="p-proposal-letter">{style.letter}</span>
                <h2>{style.name}</h2>
                <p className="p-proposal-subtitle">{style.subtitle}</p>
                <p>{style.description}</p>
                <dl>
                  <div>
                    <dt>이런 점이 좋아요</dt>
                    <dd>{style.strength}</dd>
                  </div>
                  <div>
                    <dt>고를 때 참고하세요</dt>
                    <dd>{style.consideration}</dd>
                  </div>
                </dl>
                <Link
                  className="p-button"
                  href={`/proposals/${token}/${style.id}`}
                  prefetch={false}
                >
                  홈페이지 직접 둘러보기 ↗
                </Link>
              </div>
            </article>
          ))}
        </div>
        <section className="p-chooser-guidance">
          <div>
            <p className="p-eyebrow">HOW TO REVIEW</p>
            <h2>
              실제 홈페이지처럼
              <br />
              둘러보실 수 있어요.
            </h2>
          </div>
          <ol>
            <li>
              <b>01</b>
              <span>
                각 시안의 메뉴를 눌러
                <br />세 페이지를 이동해 보세요.
              </span>
            </li>
            <li>
              <b>02</b>
              <span>
                음식 종류를 선택하고
                <br />
                사진·가격·설명을 살펴보세요.
              </span>
            </li>
            <li>
              <b>03</b>
              <span>
                휴대폰에서도 열어 보고
                <br />
                마음에 드는 시안 번호를 문자로 알려주세요.
              </span>
            </li>
          </ol>
        </section>
        <section className="p-chooser-notes">
          <h2>시안 확인 안내</h2>
          <ul>
            {content.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p>이 링크를 가진 분은 시안을 볼 수 있습니다. 공유할 때는 전달 대상을 확인해 주세요.</p>
        </section>
      </main>
      <footer className="p-chooser-footer">KOOFY · 혜화동 삼겹살 홈페이지 디자인 제안</footer>
    </div>
  );
}
