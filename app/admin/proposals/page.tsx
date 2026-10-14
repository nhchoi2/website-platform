import { Shell } from '@/components/Shell';
import { requireUser } from '@/lib/server/auth';
import { rpc } from '@/lib/server/data';
import { ProposalSharing } from '@/components/admin/ProposalSharing';
export const metadata = { title: '고객 디자인 시안', robots: { index: false, follow: false } };
export default async function Page() {
  const user = await requireUser(true);
  const proposals = await rpc<
    {
      id: string;
      name: string;
      published_at: string | null;
      revoked_at: string | null;
    }[]
  >(user, 'list_design_proposals');
  return (
    <Shell user={user}>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">DESIGN PROPOSALS</p>
          <h1>고객 디자인 시안</h1>
          <p className="muted">
            공유 시안은 고객 홈페이지의 초안·제출본·공개본과 별도로 보관됩니다.
          </p>
        </div>
      </header>
      <div className="page-body">
        {proposals.map((proposal) => (
          <section className="panel" key={proposal.id}>
            <h2>{proposal.name}</h2>
            <p>
              {proposal.revoked_at
                ? '공유 중지'
                : proposal.published_at
                  ? '링크 공유 중'
                  : '사진 준비 중'}
            </p>
            <ProposalSharing
              key={`${proposal.id}:${!!proposal.revoked_at}`}
              id={proposal.id}
              revoked={!!proposal.revoked_at}
            />
          </section>
        ))}
        {!proposals.length && <div className="panel">아직 준비한 고객 시안이 없습니다.</div>}
      </div>
    </Shell>
  );
}
