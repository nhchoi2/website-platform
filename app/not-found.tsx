import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="error-page">
      <p className="eyebrow">404</p>
      <h1>아직 문을 열지 않은 페이지입니다</h1>
      <p>주소를 확인하거나 홈페이지 관리자에게 문의해 주세요.</p>
      <Link href="/" className="button secondary">
        처음으로
      </Link>
    </main>
  );
}
