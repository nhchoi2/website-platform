import { WorkspaceLink as Link } from '@/components/WorkspaceLink';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/auth';
import { listSites, rpc } from '@/lib/server/data';
import { Shell } from '@/components/Shell';
export const metadata: Metadata = { title: '운영자 관리', robots: { index: false, follow: false } };
export default async function Admin() {
  const user = await requireUser(true);
  const [sites, customers] = await Promise.all([
    listSites(user),
    rpc<{ id: string; email: string; site_id: string | null; slug: string | null }[]>(
      user,
      'list_customers',
    ),
  ]);
  return (
    <Shell user={user}>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">ADMIN WORKSPACE</p>
          <h1>가게들의 이야기를 살펴보세요</h1>
          <p className="muted">제출된 내용을 확인하고, 준비된 홈페이지를 공개합니다.</p>
        </div>
      </header>
      <div className="page-body">
        <div className="stats-grid">
          <div className="panel">
            <span>관리 중인 매장</span>
            <strong>
              {sites.length}
              <small>곳</small>
            </strong>
          </div>
          <div className="panel">
            <span>검수를 기다리는 요청</span>
            <strong>
              {sites.filter((s) => s.pending).length}
              <small>건</small>
            </strong>
          </div>
          <div className="panel">
            <span>공개 중인 홈페이지</span>
            <strong>
              {sites.filter((s) => s.published_revision).length}
              <small>개</small>
            </strong>
          </div>
        </div>
        <div className="section-title">
          <h2>고객 및 사이트</h2>
          <Link className="button primary" href="/admin/sites/new">
            고객 홈페이지 제작 시작
          </Link>
          <Link className="text-link" href="/admin/inquiries">
            제작 상담 요청 관리 ↗
          </Link>
          <span className="muted">최근 편집 순</span>
        </div>
        <details className="panel customer-directory">
          <summary>가입 고객 전체 ({customers.length}명)</summary>
          {customers.map((customer) => (
            <div className="library-row" key={customer.id}>
              <span>{customer.email}</span>
              {customer.site_id ? (
                <Link className="text-link" href={`/admin/${customer.site_id}`}>
                  /{customer.slug} ↗
                </Link>
              ) : (
                <span className="pill">홈페이지 생성 전</span>
              )}
            </div>
          ))}
        </details>
        <div className="site-list">
          {sites.map((site) => (
            <Link className="site-row" href={`/admin/${site.id}`} key={site.id}>
              <span className="site-avatar">{(site.name || site.slug)[0]}</span>
              <div>
                <h3>{site.name || '이름 없는 매장'}</h3>
                <p>
                  {site.email} <span>· /s/{site.slug}</span>
                </p>
              </div>
              <span
                className={`pill ${site.pending ? 'amber' : site.published_revision ? 'green' : ''}`}
              >
                {site.pending ? '검수 대기' : site.published_revision ? '공개 중' : '작성 중'}
              </span>
              <time>{new Date(site.updated_at).toLocaleDateString('ko-KR')}</time>
              <span>↗</span>
            </Link>
          ))}
          {!sites.length && (
            <div className="panel empty-state">고객이 홈페이지를 생성하면 이곳에 표시됩니다.</div>
          )}
        </div>
      </div>
    </Shell>
  );
}
