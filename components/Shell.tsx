import Link from 'next/link';
import type { User } from '@/lib/types';
import { Logout } from './auth/Logout';
export function Shell({
  user,
  active,
  children,
}: {
  user: User;
  active: 'dashboard' | 'admin' | 'account';
  children: React.ReactNode;
}) {
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link href="/" className="wordmark">
          <span className="brand-mark">k</span> 쿠피
        </Link>
        <p className="sidebar-label">WORKSPACE</p>
        <nav>
          <Link href="/account/settings" aria-current={active === 'account' ? 'page' : undefined}>
            <span>◎</span> 내 정보
          </Link>
          {!user.admin && (
            <Link href="/dashboard" aria-current={active === 'dashboard' ? 'page' : undefined}>
              <span>▤</span> 내 홈페이지
            </Link>
          )}
          {user.admin && (
            <Link href="/admin" aria-current={active === 'admin' ? 'page' : undefined}>
              <span>▦</span> 운영자 관리
            </Link>
          )}
        </nav>
        <nav aria-label="제작·상담 관리">
          {user.admin ? (
            <>
              <Link href="/admin/inquiries">상담 요청</Link>
              <Link href="/admin/projects">제작 진행</Link>
              <Link href="/admin/sites/new">고객 홈페이지 제작</Link>
              <Link href="/admin/evidence">증빙 요청</Link>
              <Link href="/admin/notifications">알림 발송 상태</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/projects">상담·제작 진행</Link>
              <Link href="/dashboard/evidence">증빙 요청</Link>
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">{user.email[0]?.toUpperCase()}</span>
          <div>
            <strong>{user.admin ? '운영자' : '매장 관리자'}</strong>
            <small>{user.email}</small>
          </div>
          <Logout />
        </div>
      </aside>
      <div className="workspace-main">{children}</div>
    </div>
  );
}
