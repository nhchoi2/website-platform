import { WorkspaceLink as Link } from './WorkspaceLink';
import type { User } from '@/lib/types';
import { Logout } from './auth/Logout';
import { WorkspaceNavigation } from './WorkspaceNavigation';
export function Shell({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Link href="/" className="wordmark">
          <span className="brand-mark">k</span> 쿠피
        </Link>
        <p className="sidebar-label">WORKSPACE</p>
        <WorkspaceNavigation admin={user.admin} />
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
