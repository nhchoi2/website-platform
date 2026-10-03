'use client';
import Link from 'next/link';
import { useState } from 'react';
import { post } from '@/lib/client';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';
export function ConsentForm() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  return (
    <main className="account-page">
      <p className="eyebrow">WELCOME TO KOOFY</p>
      <h1>시작하기 전에 확인해 주세요.</h1>
      <p>
        가입 방식에 관계없이 처음 이용할 때 서비스 약관을 확인합니다. 기존 고객도 변경된 약관을
        확인할 수 있습니다.
      </p>
      <form
        method="post"
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await post('/api/account/consent', {
              accepted: true,
              termsVersion: TERMS_VERSION,
              privacyVersion: PRIVACY_VERSION,
            });
            window.location.assign(
              new URL('/account/settings?welcome=1', window.location.origin).href,
            );
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
      >
        <label className="consent-check">
          <input type="checkbox" required />
          <span>
            [필수]{' '}
            <Link href="/terms" target="_blank">
              이용약관
            </Link>
            에 동의합니다.
          </span>
        </label>
        <label className="consent-check">
          <input type="checkbox" required />
          <span>
            [필수]{' '}
            <Link href="/privacy" target="_blank">
              개인정보 수집·이용
            </Link>{' '}
            내용을 확인하고 동의합니다. 이메일을 계정 관리·복구·서비스 안내에 사용합니다.
          </span>
        </label>
        <p className="muted">
          버전 {TERMS_VERSION} · 가입과 초안 작성으로 결제가 발생하지 않습니다. 동의하지 않으면
          서비스 관리 기능을 이용할 수 없습니다.
        </p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <button className="button primary" disabled={busy}>
          {busy ? '저장 중…' : '동의하고 계속하기 →'}
        </button>
      </form>
    </main>
  );
}
