'use client';
import Link from 'next/link';
import { useState } from 'react';
import { post } from '@/lib/client';
export function AuthForm({
  initialMode,
  token,
  expired,
  googleEnabled,
  signupEnabled,
  localDemo,
}: {
  initialMode: string;
  token: string;
  expired: boolean;
  googleEnabled: boolean;
  signupEnabled: boolean;
  localDemo: boolean;
}) {
  const [mode, setMode] = useState(initialMode);
  const [message, setMessage] = useState(
    expired ? '인증 링크가 만료되었습니다. 다시 요청하세요.' : '',
  );
  const [error, setError] = useState('');
  const [recovery, setRecovery] = useState('');
  const [busy, setBusy] = useState(false);
  const titles: Record<string, string> = {
    login: '반갑습니다',
    signup: '우리 가게의 첫 페이지',
    recover: '계정 복구',
    reset: '새 비밀번호 설정',
  };
  return (
    <div className="auth-page">
      <div className="auth-story">
        <Link className="wordmark" href="/">
          쿠피<span className="tiny-tag">소상공인 웹사이트 제작</span>
        </Link>
        <div>
          <p className="eyebrow">A PLACE FOR YOUR PLACE</p>
          <h1>
            가게의 이야기를
            <br />한 페이지에 담다.
          </h1>
          <p>
            사진 한 장, 정성 담은 메뉴 하나.
            <br />
            우리 가게다운 홈페이지를 시작하세요.
          </p>
          <div className="auth-art">
            <span>가게의 문을 열고</span>
            <strong>
              좋은 한 끼,
              <br />
              좋은 이야기.
            </strong>
            <div className="art-lines" />
          </div>
        </div>
        <small>콘텐츠는 직접 편집하고, 공개 전에는 함께 확인합니다.</small>
      </div>
      <main className="auth-panel">
        <div className="auth-box">
          <p className="eyebrow">YOUR RESTAURANT, ONLINE</p>
          <h2>{titles[mode] || titles.login}</h2>
          {localDemo && (
            <p className="notice">
              로컬 시연 환경입니다. 이메일·문자 발송과 구글 로그인은 연결하지 않으며, 입력한 정보는
              이 컴퓨터의 시연 DB에 저장됩니다.
            </p>
          )}
          <p className="muted">
            {mode === 'login'
              ? '로그인하고 홈페이지 관리를 이어가세요.'
              : mode === 'signup'
                ? '계정 하나로 매장 하나를 관리할 수 있습니다.'
                : '안전하게 계정 접근을 되찾으세요.'}
          </p>
          {mode === 'signup' && !signupEnabled && (
            <p className="notice">
              새로운 가입 안내와 약관을 준비 중입니다. 기존 고객은 로그인할 수 있습니다.
            </p>
          )}
          {(mode === 'login' || mode === 'signup') && (
            <div className="google-auth">
              <button
                type="button"
                className="button secondary full"
                disabled={busy || !googleEnabled}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    const result = await post<{ url: string }>('/api/auth/google', {});
                    window.location.assign(result.url);
                  } catch (err) {
                    setError((err as Error).message);
                    setBusy(false);
                  }
                }}
              >
                Google로 계속하기
              </button>
              {!googleEnabled && (
                <small className="muted">
                  {signupEnabled
                    ? '구글 로그인 연결 준비 중 · 이메일 가입을 이용할 수 있습니다.'
                    : '새 가입을 준비 중입니다. 기존 고객은 이메일로 로그인할 수 있습니다.'}
                </small>
              )}
              <p className="muted">또는 이메일로 계속하기</p>
            </div>
          )}
          <form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setMessage('');
              setError('');
              setRecovery('');
              const data = new FormData(e.currentTarget);
              try {
                const result = await post<{
                  ok?: boolean;
                  message?: string;
                  localRecoveryUrl?: string;
                }>(`/api/auth/${mode}`, {
                  email: data.get('email'),
                  password: data.get('password'),
                  token,
                  acceptedTerms: data.get('acceptedTerms') === 'on',
                });
                if (result.ok)
                  window.location.assign(new URL('/account', window.location.origin).href);
                else {
                  setMessage(result.message || '처리되었습니다.');
                  setRecovery(result.localRecoveryUrl || '');
                  if (mode === 'reset') setMode('login');
                }
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {mode !== 'reset' && (
              <label>
                이메일
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="hello@myrestaurant.kr"
                />
              </label>
            )}
            {mode !== 'recover' && (
              <label>
                비밀번호
                <input
                  type="password"
                  name="password"
                  minLength={10}
                  maxLength={128}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  placeholder="10자 이상 입력하세요"
                />
              </label>
            )}
            {mode === 'signup' && (
              <>
                <label className="consent-check">
                  <input type="checkbox" name="acceptedTerms" required />
                  <span>
                    [필수]{' '}
                    <Link href="/terms" target="_blank">
                      이용약관
                    </Link>{' '}
                    및{' '}
                    <Link href="/privacy" target="_blank">
                      필수 개인정보 수집·이용
                    </Link>{' '}
                    내용을 확인하고 동의합니다.
                  </span>
                </label>
                <p className="muted">
                  가입·초안 작성만으로 비용이 청구되지 않습니다. 제작 진행과 비용은 상담 후
                  확정합니다.
                </p>
              </>
            )}
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="notice">
                {message}
              </p>
            )}
            {recovery && (
              <a className="button secondary" href={recovery}>
                로컬 복구 링크 열기 ↗
              </a>
            )}
            <button
              className="button primary full"
              disabled={busy || (mode === 'signup' && !signupEnabled)}
            >
              {busy
                ? '처리 중…'
                : {
                    login: '로그인 →',
                    signup: '회원가입 →',
                    recover: '복구 링크 받기',
                    reset: '비밀번호 변경',
                  }[mode]}
            </button>
          </form>
          <noscript>가입과 로그인을 이용하려면 브라우저에서 JavaScript를 허용해 주세요.</noscript>
          <div className="auth-switch">
            {mode === 'login' ? (
              <>
                <button
                  onClick={() => {
                    setMode('signup');
                    setMessage('');
                  }}
                >
                  회원가입
                </button>
                <button
                  onClick={() => {
                    setMode('recover');
                    setMessage('');
                  }}
                >
                  비밀번호를 잊으셨나요?
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMode('login');
                  setMessage('');
                }}
              >
                로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
