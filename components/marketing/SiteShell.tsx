import Link from 'next/link';
import './marketing.css';

export const contactUrl = 'mailto:koofylab@gmail.com?subject=쿠피%20사이트%20제작%20상담';
export function Brand() {
  return (
    <Link href="/" className="m-brand" aria-label="쿠피 사이트 홈">
      koofy<span className="m-brand-dot">✳</span>
      <span className="m-brand-sub">
        소상공인
        <br />
        웹사이트 제작
      </span>
    </Link>
  );
}
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing">
      <a className="skip-link" href="#main">
        본문으로 이동
      </a>
      <header className="m-header">
        <div className="m-container m-header-inner">
          <Brand />
          <nav aria-label="서비스 안내" className="m-nav">
            <Link href="/templates">템플릿</Link>
            <Link href="/#projects">제작 사례</Link>
            <Link href="/pricing">비용 안내</Link>
            <Link href="/guide">이용 방법</Link>
          </nav>
          <div className="m-header-actions">
            <Link href="/login">로그인</Link>
            <Link className="m-button m-small" href="/account">
              내 홈페이지 만들기 <span>↗</span>
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="m-footer">
        <div className="m-container">
          <div className="m-footer-top">
            <div>
              <Brand />
              <p>
                작은 가게의 더 넓은 시작.
                <br />
                쿠피가 만드는 홈페이지 제작·관리 서비스.
              </p>
            </div>
            <div>
              <a href="https://www.koofy.co.kr/" target="_blank" rel="noopener noreferrer">
                KOOFY LAB ↗
              </a>
              <a href={contactUrl}>제작 상담</a>
              <Link href="/guide#faq">자주 묻는 질문</Link>
              <Link href="/account">홈페이지 관리</Link>
            </div>
          </div>
          <div className="m-footer-bottom">
            <span>© {new Date().getFullYear()} KOOFY LAB</span>
            <a href="mailto:koofylab@gmail.com">koofylab@gmail.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="m-page-intro">
      <p className="m-kicker">{label}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
export function StartCTA() {
  return (
    <section className="m-cta">
      <div>
        <p className="m-kicker">YOUR NEXT CHAPTER</p>
        <h2>
          우리 가게의 다음 이야기,
          <br />
          홈페이지에서 시작하세요.
        </h2>
      </div>
      <div>
        <Link className="m-button m-white" href="/account">
          내 홈페이지 만들기 ↗
        </Link>
        <a className="m-text-link" href={contactUrl}>
          먼저 상담하고 싶어요 ↗
        </a>
      </div>
    </section>
  );
}
