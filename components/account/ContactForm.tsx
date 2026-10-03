'use client';
import Link from 'next/link';
import { useState } from 'react';
import { post } from '@/lib/client';
import type { AccountDetails } from '@/lib/types';
export function ContactForm({
  details,
  email,
  admin,
}: {
  details: AccountDetails;
  email: string;
  admin: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState('');
  return (
    <main className="account-page">
      <p className="eyebrow">MY ACCOUNT</p>
      <h1>내 정보</h1>
      <p>
        담당자 정보는 상담과 운영 연락에 사용하며, 공개 홈페이지의 매장 연락처와 별도로 보관합니다.
      </p>
      <form
        method="post"
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          setSaved('');
          const data = new FormData(e.currentTarget);
          try {
            await post('/api/account/contact', {
              name: data.get('name'),
              phone: data.get('phone'),
              consent: data.get('consent') === 'on',
            });
            setSaved('저장했습니다. 다시 로그인해도 유지됩니다.');
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          로그인 이메일
          <input value={email} readOnly />
        </label>
        <label>
          담당자 이름 <span className="muted">선택</span>
          <input
            name="name"
            maxLength={80}
            autoComplete="name"
            defaultValue={details.contact?.contact_name || ''}
          />
        </label>
        <label>
          연락받을 전화번호 <span className="muted">선택</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="010-1234-5678"
            defaultValue={details.contact?.contact_phone || ''}
          />
        </label>
        <p className="notice">
          번호 등록 기능입니다. 문자 인증이나 통신사 본인확인은 아직 제공하지 않습니다.
        </p>
        <label className="consent-check">
          <input
            name="consent"
            type="checkbox"
            defaultChecked={!!details.contact?.contact_consent_at}
          />
          <span>
            [선택] 담당자 이름·전화번호를 제작 상담과 운영 연락에 사용하는 데 동의합니다. 계정 이용
            중 보관하며, 여기에서 정보를 지워 철회할 수 있습니다. 동의하지 않아도 홈페이지 편집은
            가능합니다. <Link href="/privacy">자세히 보기</Link>
          </span>
        </label>
        <p className="muted">
          정보를 삭제하려면 이름과 번호를 비우고 저장하세요. 현금영수증·세금계산서 정보는 현재
          수집하지 않습니다.
        </p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="notice">
            {saved}
          </p>
        )}
        <button className="button primary" disabled={busy}>
          {busy ? '저장 중…' : '내 정보 저장'}
        </button>
        <Link href={admin ? '/admin' : '/dashboard'} className="button secondary">
          {admin ? '운영자 관리로' : '홈페이지 만들기·관리 →'}
        </Link>
      </form>
      <section className="panel">
        <h2>서비스 동의 기록</h2>
        {details.consents.map((c) => (
          <p key={c.id}>
            이용약관 {c.terms_version} · 개인정보 {c.privacy_version}
            <br />
            <time dateTime={c.accepted_at}>
              {new Date(c.accepted_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (한국
              시간)
            </time>
          </p>
        ))}
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link>
      </section>
    </main>
  );
}
