'use client';
import { useState } from 'react';
import { post } from '@/lib/client';
export function Logout() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="text-button"
      disabled={busy}
      onClick={async () => {
        if (!confirm('로그아웃할까요? 저장되지 않은 편집 내용이 있다면 먼저 저장하세요.')) return;
        setBusy(true);
        try {
          await post('/api/auth/logout', {});
          window.location.assign(new URL('/login', window.location.origin).href);
        } catch {
          alert('로그아웃하지 못했습니다. 다시 시도하세요.');
          setBusy(false);
        }
      }}
    >
      로그아웃
    </button>
  );
}
