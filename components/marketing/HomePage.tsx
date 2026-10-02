import Link from 'next/link';
import { SiteShell, StartCTA, contactUrl } from './SiteShell';
import { TemplateVisual } from './TemplateCard';
import { pricing, formatWon } from './content';
export function HomePage() {
  return (
    <SiteShell>
      <main id="main">
        <section className="m-container m-hero">
          <div className="m-hero-copy">
            <p className="m-kicker">
              <span className="m-live-dot" /> 소상공인 웹사이트 제작 · 관리
            </p>
            <h1>
              가게는 작아도,
              <br />
              이야기는 <span>크니까.</span>
            </h1>
            <p className="m-hero-description">
              손님이 궁금해하는 우리 가게의 모든 것.
              <br />
              직접 고치고, 함께 확인하는
              <br className="m-mobile-break" /> 소상공인 홈페이지 제작·관리.
            </p>
            <div className="m-actions">
              <Link className="m-button" href="/account">
                내 홈페이지 만들기 <span>↗</span>
              </Link>
              <Link className="m-text-link" href="/templates">
                템플릿 먼저 보기 <span>→</span>
              </Link>
            </div>
            <p className="m-hero-note">지금은 음식점 홈페이지부터 시작합니다.</p>
          </div>
          <div className="m-hero-stage">
            <div className="m-orbit-label">
              A LITTLE PLACE.
              <br />A BIG FIRST IMPRESSION.
            </div>
            <TemplateVisual />
            <div className="m-floating-note">
              <span>✓</span>
              <div>
                <strong>사장님이 직접 수정</strong>
                <small>공개 전에는 쿠피가 한 번 더 확인</small>
              </div>
            </div>
            <p className="m-sample-label">혜화 템플릿을 바탕으로 구성한 예시 화면</p>
          </div>
        </section>
        <div className="m-feature-strip">
          <div className="m-container">
            <span>사진과 메뉴를 직접 편집</span>
            <i>✳</i>
            <span>모바일에서도 편하게</span>
            <i>✳</i>
            <span>검수 후 안심하고 공개</span>
            <i>✳</i>
            <span>내 도메인으로 연결</span>
          </div>
        </div>
        <section className="m-container m-section">
          <div className="m-section-heading">
            <div>
              <p className="m-kicker">MADE FOR YOUR EVERYDAY</p>
              <h2>
                만드는 날보다,
                <br />
                운영하는 날이 더 많으니까.
              </h2>
            </div>
            <p>
              메뉴가 바뀌고, 계절이 바뀌어도.
              <br />
              우리 가게의 소식은 사장님 손으로 관리하세요.
            </p>
          </div>
          <div className="m-benefits">
            {[
              [
                '01',
                '블로그처럼 쉽게',
                '사진을 올리고 메뉴와 매장 정보를 입력하세요. 정해진 디자인 안에서 콘텐츠만 바꾸면 됩니다.',
                '사진 · 메뉴 · 매장 정보',
              ],
              [
                '02',
                '공개는 신중하게',
                '작성 중인 내용은 손님에게 보이지 않습니다. 게시를 요청하면 운영자가 제출한 내용을 검수합니다.',
                '초안 → 검수 → 공개',
              ],
              [
                '03',
                '가게의 주소는 내 것으로',
                '고객이 소유한 도메인을 홈페이지에 연결합니다. 도메인 연결과 운영은 쿠피가 함께 돕습니다.',
                '고객 소유 도메인 연결',
              ],
            ].map(([n, t, d, tag]) => (
              <article key={n}>
                <span className="m-number">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
                <span className="m-benefit-tag">{tag}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="m-template-section">
          <div className="m-container m-template-grid">
            <div>
              <p className="m-kicker">THE FIRST TEMPLATE</p>
              <h2>
                가게의 개성이
                <br />
                주인공이 되도록.
              </h2>
              <p>
                복잡한 장식 대신 사진, 메뉴, 그리고 이야기.
                <br />
                혜화의 간결한 디자인에서 출발한
                <br />첫 번째 음식점 템플릿을 만나보세요.
              </p>
              <div className="m-swatches" aria-label="올리브, 차콜, 웜 색상 선택 가능">
                <span />
                <span />
                <span />
                <small>세 가지 색상 · 하나의 정돈된 구성</small>
              </div>
              <Link className="m-text-link" href="/templates/hyehwa">
                혜화 템플릿 전체 보기 ↗
              </Link>
            </div>
            <TemplateVisual />
          </div>
        </section>
        <section className="m-container m-section m-process-section">
          <div className="m-section-heading">
            <div>
              <p className="m-kicker">HOW IT WORKS</p>
              <h2>시작부터 공개까지, 네 걸음.</h2>
            </div>
            <Link className="m-text-link" href="/guide">
              자세한 이용 방법 ↗
            </Link>
          </div>
          <ol className="m-steps">
            {[
              ['템플릿 선택', '회원가입 후 가게에 어울리는 디자인을 고릅니다.'],
              ['우리 가게 채우기', '사진과 메뉴, 찾아오는 길을 입력하고 미리 봅니다.'],
              ['게시 요청과 검수', '제출한 내용을 쿠피가 확인하고 보완을 안내합니다.'],
              ['홈페이지 공개', '승인한 내용을 게시하고 도메인을 연결합니다.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <span>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="m-container m-price-teaser">
          <div>
            <p className="m-kicker">CLEAR FROM THE START</p>
            <h2>필요한 범위부터 함께 정합니다.</h2>
            <p>
              기본 제작 {formatWon(pricing.setup)}부터 · 운영·관리 월 {formatWon(pricing.monthly)}
              부터.
            </p>
          </div>
          <Link className="m-button m-outline" href="/pricing">
            비용과 포함 범위 보기 ↗
          </Link>
        </section>
        <div className="m-container">
          <StartCTA />
        </div>
        <section className="m-container m-contact-note">
          <p>
            아직 준비된 사진이나 메뉴가 없어도 괜찮아요. <a href={contactUrl}>제작 상담하기 ↗</a>
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
