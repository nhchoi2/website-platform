import Link from 'next/link';
import { stages, type Project } from '@/lib/projects';
import type { Inquiry } from '@/lib/inquiries';
export function ProjectList({
  projects,
  inquiries = [],
  admin = false,
}: {
  projects: Project[];
  inquiries?: Inquiry[];
  admin?: boolean;
}) {
  const root = admin ? '/admin' : '/dashboard';
  return (
    <div className="page-body">
      <h1>상담·제작 진행</h1>
      <p>견적과 자료 전달, 제작 진행 안내를 확인하세요.</p>
      {projects.map((p) => (
        <Link className="site-row" key={p.id} href={`${root}/projects/${p.id}`}>
          <div>
            <strong>{p.email || p.id.slice(0, 8)}</strong>
            <p>{p.message}</p>
          </div>
          <span className="pill">{stages[p.stage]}</span>
        </Link>
      ))}
      {!projects.length && (
        <p className="panel">
          아직 연결된 제작 건이 없습니다. 운영자가 상담 후 계정에 연결하면 표시됩니다.
        </p>
      )}
      {!admin && (
        <>
          <h2>내 상담 요청</h2>
          {inquiries.map((i) => (
            <article className="panel" key={i.id}>
              <h3>
                {i.business} ·{' '}
                {i.status === 'new' ? '접수' : i.status === 'contacted' ? '상담 중' : '종료'}
              </h3>
              <p>{i.message}</p>
              <small>접수 번호 {i.id}</small>
            </article>
          ))}
          <Link className="button primary" href="/contact">
            새 제작 상담하기 →
          </Link>
          <p>로그인한 상태로 접수한 상담과 운영자가 계정에 연결한 상담이 표시됩니다.</p>
        </>
      )}
    </div>
  );
}
