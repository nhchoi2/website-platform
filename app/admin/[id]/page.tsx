import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/server/auth';
import { siteDetail, rpc } from '@/lib/server/data';
import type { AccountDetails } from '@/lib/types';
import { Shell } from '@/components/Shell';
import { ReviewPanel } from '@/components/admin/ReviewPanel';
export default async function AdminSite({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(true);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const detail = await siteDetail(user, id).catch(() => null);
  if (!detail) notFound();
  const account = await rpc<AccountDetails>(user, 'get_account_details', {
    p_user: detail.site.owner_id,
  });
  return (
    <Shell user={user} active="admin">
      <section className="account-page">
        <details className="panel">
          <summary>고객 담당자 연락 정보 · 비공개</summary>
          <p>
            {account.contact?.contact_name || '이름 미등록'} ·{' '}
            {account.contact?.contact_phone || '번호 미등록'}
          </p>
          <p className="muted">
            고객이 입력한 연락처이며 문자 인증·본인확인된 번호가 아닙니다. 공개 매장 전화번호와
            별도로 관리합니다.
          </p>
        </details>
      </section>
      <ReviewPanel detail={detail} />
    </Shell>
  );
}
