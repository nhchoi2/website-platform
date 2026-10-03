import Link from 'next/link';
import { SiteShell, StartCTA, contactUrl } from './SiteShell';
import { TemplateVisual } from './TemplateCard';
import { pricing, formatWon } from './content';
import { TemplateCatalog } from './TemplateCatalog';
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
              업종에 맞게 만들고, 함께 관리하는
              <br className="m-mobile-break" /> 소상공인 홈페이지 제작·관리.
            </p>
            <div className="m-actions">
              <Link className="m-button" href="/templates">
                웹페이지 템플릿 안내 <span>↗</span>
              </Link>
              <Link className="m-text-link" href="/templates">
                템플릿 먼저 보기 <span>→</span>
              </Link>
            </div>
            <p className="m-hero-note">음식점부터 미용실·헬스장·마트·전문 사무실까지.</p>
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
            <span>업종에 맞는 제작 구성</span>
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
                '오픈 후에는 정해진 디자인 안에서 사진과 정보를 관리합니다. 업종별 관리 항목은 제작 상담에서 함께 정합니다.',
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
              <p className="m-kicker">TEMPLATES FOR YOUR BUSINESS</p>
              <h2>
                가게의 개성이
                <br />
                주인공이 되도록.
              </h2>
              <p>
                사진과 메뉴, 시술과 프로그램, 전문성과 상담.
                <br />
                사업에 맞는 디자인과 필요한 기능을
                <br />
                미리 보고 제작을 문의하세요.
              </p>
              <div className="m-swatches" aria-label="올리브, 차콜, 웜 색상 선택 가능">
                <span />
                <span />
                <span />
                <small>7가지 업종별 예시 · 원페이지와 3·4페이지</small>
              </div>
              <Link className="m-text-link" href="/templates">
                웹페이지 템플릿 안내 ↗
              </Link>
            </div>
            <TemplateVisual />
          </div>
        </section>
        <section className="m-container m-section">
          <div className="m-section-heading">
            <div>
              <p className="m-kicker">FIND YOUR FIT</p>
              <h2>필요한 모습부터 골라보세요.</h2>
            </div>
            <Link className="m-text-link" href="/templates">
              7개 템플릿 전체 보기 ↗
            </Link>
          </div>
          <TemplateCatalog featured />
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
              ['템플릿 둘러보기', '회원가입 없이 디자인·페이지 구성·추가 기능을 확인합니다.'],
              ['제작 상담', '선택한 구성과 사업장의 요구를 전달하고 견적을 확인합니다.'],
              [
                '자료 준비와 제작',
                '사진과 소개 자료를 바탕으로 홈페이지를 제작하고 함께 확인합니다.',
              ],
              ['공개와 운영', '도메인을 연결하고 콘텐츠 관리 범위와 사용 방법을 안내합니다.'],
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
