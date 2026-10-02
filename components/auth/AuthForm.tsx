'use client';
import Link from 'next/link';
import { useState } from 'react';
import { post } from '@/lib/client';
export function AuthForm({
  initialMode,
  token,
  expired,
}: {
  initialMode: string;
  token: string;
  expired: boolean;
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
          <p className="muted">
            {mode === 'login'
              ? '로그인하고 홈페이지 관리를 이어가세요.'
              : mode === 'signup'
                ? '계정 하나로 매장 하나를 관리할 수 있습니다.'
                : '안전하게 계정 접근을 되찾으세요.'}
          </p>
          <form
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
            <button className="button primary full" disabled={busy}>
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
